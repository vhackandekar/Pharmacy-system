import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  // sessions: [{ id, title, messages, timestamp }]
  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem('chat-history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Error loading chat history:", e);
      return [];
    }
  });

  // currentMessages: used for the main dashboard display
  const [currentMessages, setCurrentMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem('active-chat');
      const defaultMsg = [
        { id: 1, role: 'ai', content: "Hello! I'm your AI Pharmacist. How can I help you today?", timestamp: "10:00 AM" }
      ];
      return saved ? JSON.parse(saved) : defaultMsg;
    } catch (e) {
      console.error("Error loading active chat:", e);
      return [
        { id: 1, role: 'ai', content: "Hello! I'm your AI Pharmacist. How can I help you today?", timestamp: "10:00 AM" }
      ];
    }
  });

  const [currentSessionId, setCurrentSessionId] = useState(() => {
    const id = sessionStorage.getItem('active-session-id');
    return id === 'null' ? null : id;
  });

  // Persist sessions to localStorage
  useEffect(() => {
    localStorage.setItem('chat-history', JSON.stringify(sessions));
  }, [sessions]);

  // Persist active chat to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('active-chat', JSON.stringify(currentMessages));
    if (currentSessionId) {
      sessionStorage.setItem('active-session-id', currentSessionId);
    }
  }, [currentMessages, currentSessionId]);

  const [isTyping, setIsTyping] = useState(false);

  // Persistence of active state
  useEffect(() => {
    sessionStorage.setItem('active-chat', JSON.stringify(currentMessages));
    if (currentSessionId) {
      sessionStorage.setItem('active-session-id', currentSessionId);
    }
  }, [currentMessages, currentSessionId]);

  // Unified Session Management:
  // 1. Create sessions for new conversations automatically
  // 2. Keep existing sessions in sync with currentMessages
  // 3. Persist sessions list to localStorage
  useEffect(() => {
    localStorage.setItem('chat-history', JSON.stringify(sessions));

    if (currentMessages.length <= 1) return;

    if (!currentSessionId) {
      // Auto-create session on first user interaction
      const firstUserMsg = currentMessages.find(m => m.role === 'user');
      if (firstUserMsg) {
        const newId = Date.now().toString();
        const newSession = {
          id: newId,
          title: firstUserMsg.content.substring(0, 30) + (firstUserMsg.content.length > 30 ? '...' : ''),
          messages: currentMessages,
          timestamp: new Date().toISOString()
        };
        
        setSessions(prev => {
          if (prev.some(s => s.id === newId)) return prev;
          return [newSession, ...prev];
        });
        setCurrentSessionId(newId);
      }
    } else {
      // Sync currentMessages to the matching session in the list
      setSessions(prev => 
        prev.map(s => s.id === currentSessionId ? { ...s, messages: currentMessages } : s)
      );
    }
  }, [currentMessages, currentSessionId, sessions.length]); // sessions.length as a light trigger for persistence

  const addMessageToActive = async (msg) => {
    // Atomic update with duplicate check
    setCurrentMessages(prev => {
      if (prev.some(m => m.id === msg.id)) return prev;
      return [...prev, msg];
    });

    if (msg.role === 'user') {
      setIsTyping(true);
      try {
        const { data } = await api.post('/agent/chat', { 
          userMessage: msg.content,
          history: currentMessages
        });

        const aiMsg = {
          id: Date.now() + Math.random(),
          role: 'ai',
          content: data.agentResponse.response_message || data.agentResponse.answer,
          metadata: data.agentResponse, 
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        addMessageToActive(aiMsg);
      } catch (error) {
        console.error("AI Assistant Error:", error);
        addMessageToActive({
          id: Date.now() + 1000,
          role: 'ai',
          content: "I'm sorry, I'm having trouble connecting to my knowledge core. Please ensure your OpenAI API key is valid and you have credits.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      } finally {
        setIsTyping(false);
      }
    }
  };

  const startNewChat = () => {
    setCurrentMessages([
      { id: Date.now(), role: 'ai', content: "Hello! I'm your AI Pharmacist. How can I help you today?", timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
    setCurrentSessionId(null);
    sessionStorage.removeItem('active-session-id');
  };

  const loadSession = (id) => {
    const session = sessions.find(s => s.id === id);
    if (session) {
      setCurrentMessages(session.messages);
      setCurrentSessionId(session.id);
    }
  };

  const deleteSession = (id) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    if (currentSessionId === id) {
      startNewChat();
    }
  };

  const clearAllHistory = () => {
    setSessions([]);
    localStorage.removeItem('chat-history');
    startNewChat();
  };

  return (
    <ChatContext.Provider value={{ 
      sessions, 
      currentMessages, 
      addMessageToActive, 
      startNewChat, 
      loadSession, 
      deleteSession,
      clearAllHistory,
      isTyping
    }}>
      {children}
    </ChatContext.Provider>
  );
};

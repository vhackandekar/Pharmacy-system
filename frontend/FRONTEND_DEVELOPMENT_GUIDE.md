# Pharmacy System Frontend Development Guide

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/              # Page components
│   ├── services/           # API service calls
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   ├── context/            # React context providers
│   ├── assets/             # Images, icons, etc.
│   └── styles/             # CSS/SCSS files
├── public/                 # Static assets
└── package.json
```

## Key Features to Implement

### 1. Authentication System
- User Registration/Login
- JWT Token Management
- Protected Routes
- Role-based Access (User/Admin)

### 2. Medicine Catalog
- Browse all medicines
- Search and filter functionality
- Medicine details view
- Prescription requirement indicators

### 3. AI Chat Interface
- Real-time chat with pharmacy agent
- Message history
- Order processing through conversation
- Error handling for safety rejections

### 4. Cart Management
- Add/remove medicines
- Quantity adjustment
- Cart persistence
- Prescription validation

### 5. Order Management
- Place orders
- Order history
- Order status tracking
- Estimated delivery dates

### 6. Prescription Management
- Upload prescription images
- View prescription status
- Prescription validation feedback

### 7. Notification System
- Real-time notifications
- Order confirmations
- Refill alerts
- Stock warnings

## Backend Integration Points

### Authentication Service
```javascript
// src/services/authService.js
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export const authService = {
  register: async (userData) => {
    const response = await axios.post(`${API_BASE}/auth/register`, userData);
    return response.data;
  },
  
  login: async (credentials) => {
    const response = await axios.post(`${API_BASE}/auth/login`, credentials);
    // Store token in localStorage
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem('user'));
  }
};
```

### Medicine Service
```javascript
// src/services/medicineService.js
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const getAuthHeaders = () => ({
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});

export const medicineService = {
  getAllMedicines: async () => {
    const response = await axios.get(`${API_BASE}/medicine`);
    return response.data;
  },
  
  searchMedicines: async (query) => {
    const response = await axios.get(`${API_BASE}/medicine?search=${query}`);
    return response.data;
  }
};
```

### Chat Service
```javascript
// src/services/chatService.js
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const getAuthHeaders = () => ({
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  }
});

export const chatService = {
  sendMessage: async (message) => {
    const response = await axios.post(
      `${API_BASE}/agent/chat`,
      { userMessage: message },
      getAuthHeaders()
    );
    return response.data;
  }
};
```

## Component Architecture

### Authentication Components
```jsx
// src/components/Auth/Login.jsx
import { useState } from 'react';
import { authService } from '../../services/authService';

export const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await authService.login({ email, password });
      onLoginSuccess(result.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      {error && <div className="error">{error}</div>}
      <button type="submit">Login</button>
    </form>
  );
};
```

### Medicine List Component
```jsx
// src/components/Medicine/MedicineList.jsx
import { useEffect, useState } from 'react';
import { medicineService } from '../../services/medicineService';

export const MedicineList = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMedicines();
  }, []);

  const loadMedicines = async () => {
    try {
      const data = await medicineService.getAllMedicines();
      setMedicines(data);
    } catch (error) {
      console.error('Failed to load medicines:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="medicine-list">
      {medicines.map(medicine => (
        <div key={medicine.id} className="medicine-card">
          <h3>{medicine.name}</h3>
          <p>Dosage: {medicine.dosage}</p>
          <p>Price: ₹{medicine.price}</p>
          <p>Stock: {medicine.stock} {medicine.unitType}</p>
          {medicine.prescriptionRequired && (
            <span className="prescription-required">℞ Prescription Required</span>
          )}
        </div>
      ))}
    </div>
  );
};
```

### Chat Interface Component
```jsx
// src/components/Chat/ChatInterface.jsx
import { useState } from 'react';
import { chatService } from '../../services/chatService';

export const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatService.sendMessage(input);
      const botMessage = {
        text: response.agentResponse.answer,
        sender: 'bot',
        status: response.workflowStatus
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        error: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            <div className="message-text">{msg.text}</div>
            {msg.status && (
              <div className="message-status">
                Status: {msg.status}
              </div>
            )}
          </div>
        ))}
        {loading && <div className="message bot">Thinking...</div>}
      </div>
      
      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
};
```

## State Management

### User Context
```jsx
// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const result = await authService.login(credentials);
    setUser(result.user);
    return result;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
```

## Routing Setup

```jsx
// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './components/Auth/Login';
import { MedicineList } from './components/Medicine/MedicineList';
import { ChatInterface } from './components/Chat/ChatInterface';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/medicines" element={
            <ProtectedRoute>
              <MedicineList />
            </ProtectedRoute>
          } />
          <Route path="/chat" element={
            <ProtectedRoute>
              <ChatInterface />
            </ProtectedRoute>
          } />
          <Route path="/" element={<Navigate to="/chat" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
```

## Key Integration Points

1. **Authentication**: Protect all routes except login/registration
2. **Error Handling**: Display meaningful error messages to users
3. **Loading States**: Show loading indicators during API calls
4. **Real-time Updates**: Use polling or WebSockets for notifications
5. **Form Validation**: Client-side validation before API calls
6. **Responsive Design**: Mobile-friendly interface for pharmacy users

## Testing Strategy

1. **Unit Tests**: Test individual components and services
2. **Integration Tests**: Test API integrations
3. **E2E Tests**: Test complete user flows
4. **Mock Data**: Use mock data for development
5. **Error Scenarios**: Test error handling and edge cases

This structure provides a solid foundation for building the frontend while maintaining clean separation of concerns and proper integration with your backend services.
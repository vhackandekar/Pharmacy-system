import React, { useState, useEffect } from 'react';
import {
  Moon, Sun, Globe, Mic, Bell, Shield,
  Trash2, User, CreditCard, Mail, Sliders, Check
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Card, Toggle, Button, Badge } from '../Component/UI';
import { authAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    theme, toggleTheme,
    language, setLanguage,
    voiceMode, setVoiceMode
  } = useTheme();

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : '??';
  const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Feb 2024';

  const updatePreference = async (updates) => {
    setSaving(true);
    try {
      await authAPI.updateProfile(updates);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (error) {
      console.error("Failed to sync settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const sections = [
    {
      title: "Appearance",
      icon: <Sliders className="text-brand-secondary" />,
      items: [
        {
          label: "Theme Mode",
          desc: "Switch between light and dark clinical themes.",
          control: (
            <div className="flex items-center space-x-3">
              {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} className="text-amber-500" />}
              <Toggle enabled={theme === 'dark'} onChange={() => {
                toggleTheme();
                updatePreference({ theme: theme === 'dark' ? 'light' : 'dark' });
              }} />
            </div>
          )
        }
      ]
    },
    {
      title: "Language & Voice",
      icon: <Globe className="text-brand-primary" />,
      items: [
        {
          label: "Display Language",
          desc: "Choose your preferred language for the interface.",
          control: (
            <select
              value={language}
              onChange={(e) => {
                const val = e.target.value;
                setLanguage(val);
                updatePreference({ language: val });
              }}
              className={`text-xs font-bold rounded-lg border p-2 outline-none ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}
            >
              <option value="English">English</option>
              <option value="Marathi">Marathi (मराठी)</option>
            </select>
          )
        },
        {
          label: "Voice Mode",
          desc: "Enable voice interactions and audio responses.",
          control: <Toggle enabled={voiceMode} onChange={() => {
            const next = !voiceMode;
            setVoiceMode(next);
            updatePreference({ voiceMode: next });
          }} />
        }
      ]
    },
    {
      title: "Notifications",
      icon: <Bell className="text-brand-accent" />,
      items: [
        {
          label: "Refill Alerts",
          desc: "Get notified when your prescription is running low.",
          control: <Toggle enabled={true} onChange={() => { }} />
        },
        {
          label: "Order Updates",
          desc: "Status updates for your active medicine deliveries.",
          control: <Toggle enabled={true} onChange={() => { }} />
        }
      ]
    },
    {
      title: "Privacy & Account",
      icon: <Shield className="text-red-500" />,
      items: [
        {
          label: "Security Audit",
          desc: "Review your last login and account activities.",
          control: <Button variant="secondary" size="sm">Review</Button>
        },
        {
          label: "Delete Account",
          desc: "Permanently delete your profile and medical history.",
          control: <Button variant="ghost" size="sm" className="text-red-500 font-bold">Delete</Button>
        }
      ]
    }
  ];

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-10 md:space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight mb-2">Settings</h2>
          <p className="text-sm opacity-60 font-medium">Customize your AI Pharmacy experience and preferences.</p>
        </div>
        {success && (
          <Badge variant="success" className="animate-bounce self-start md:self-center">
            <Check size={12} className="mr-1" /> Preferences Saved
          </Badge>
        )}
      </div>

      <div className="space-y-8">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-4">
            <div className="flex items-center space-x-3 px-2">
              {section.icon}
              <h4 className="font-black text-sm uppercase tracking-widest opacity-40">{section.title}</h4>
            </div>
            <Card className="divide-y divide-white/5 p-0 overflow-hidden">
              {section.items.map((item, i) => (
                <div key={i} className={`p-6 flex items-center justify-between group transition-all ${theme === 'dark' ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'}`}>
                  <div className="max-w-md">
                    <p className="text-sm font-bold mb-1">{item.label}</p>
                    <p className="text-[10px] font-medium opacity-40 leading-relaxed">{item.desc}</p>
                  </div>
                  <div>{item.control}</div>
                </div>
              ))}
            </Card>
          </div>
        ))}
      </div>

      {/* Profile Summary Card */}
      <Card className="bg-brand-secondary/5 border-brand-secondary/10 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold bg-brand-secondary shadow-lg shadow-brand-secondary/20`}>
            {initials}
          </div>
          <div>
            <p className="text-sm font-bold">{user?.name || 'Guest User'}</p>
            <p className="text-[10px] font-bold opacity-40">Member since {memberSince}</p>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={() => navigate('/profile')}>
          <User size={14} className="mr-2" />
          Edit Profile
        </Button>
      </Card>
    </div>
  );
};

export default SettingsPage;

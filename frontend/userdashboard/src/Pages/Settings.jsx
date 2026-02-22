import React from 'react';
import { 
  Moon, Sun, Globe, Mic, Bell, Shield, 
  Trash2, User, CreditCard, Mail, Sliders
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Card, Toggle, Button, Badge } from '../Component/UI';

const SettingsPage = () => {
  const { 
    theme, toggleTheme, 
    language, setLanguage, 
    voiceMode, setVoiceMode 
  } = useTheme();

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
              <Toggle enabled={theme === 'dark'} onChange={toggleTheme} />
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
              onChange={(e) => setLanguage(e.target.value)}
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
          control: <Toggle enabled={voiceMode} onChange={setVoiceMode} />
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
          control: <Toggle enabled={true} onChange={() => {}} />
        },
        { 
          label: "Order Updates", 
          desc: "Status updates for your active medicine deliveries.",
          control: <Toggle enabled={true} onChange={() => {}} />
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
    <div className="p-8 max-w-4xl mx-auto space-y-12">
      <div>
        <h2 className="text-3xl font-black tracking-tight mb-2">Settings</h2>
        <p className="text-sm opacity-60 font-medium">Customize your AI Pharmacy experience and preferences.</p>
      </div>

      <div className="space-y-8">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-4">
            <div className="flex items-center space-x-3 px-2">
               {section.icon}
               <h4 className="font-black text-sm uppercase tracking-widest opacity-40">{section.title}</h4>
            </div>
            <Card className="divide-y divide-white/5 p-0">
              {section.items.map((item, i) => (
                <div key={i} className="p-6 flex items-center justify-between group transition-all">
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
              AJ
            </div>
            <div>
              <p className="text-sm font-bold">Alex Johnson</p>
              <p className="text-[10px] font-bold opacity-40">Member since Feb 2024</p>
            </div>
         </div>
         <Button variant="secondary" size="sm">
            <User size={14} className="mr-2" />
            Edit Profile
         </Button>
      </Card>
    </div>
  );
};

export default SettingsPage;

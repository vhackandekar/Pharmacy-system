import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, User, LogOut, Calendar, Pill, HeartPulse, Bell } from 'lucide-react';

const UserDashboard = () => {
  const navigate = useNavigate();

  const metrics = [
    { icon: <HeartPulse className="w-5 h-5 text-purple-400" />, label: 'Health Score', value: '98%', color: 'from-purple-500/20 to-purple-800/20' },
    { icon: <Pill className="w-5 h-5 text-purple-400" />, label: 'Active Meds', value: '12', color: 'from-purple-500/20 to-purple-800/20' },
    { icon: <Calendar className="w-5 h-5 text-purple-400" />, label: 'Appointments', value: '3', color: 'from-purple-500/20 to-purple-800/20' },
  ];

  return (
    <div className="min-h-screen bg-[#0B0A14] text-white p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-900/10 blur-[120px] rounded-full"></div>

      <div className="max-w-6xl mx-auto relative z-10 space-y-8">
        {/* Header */}
        <header className="flex items-center justify-between bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-purple-500/20">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-800 flex items-center justify-center animate-glow-pulse shadow-lg shadow-purple-500/20">
              <Activity className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">AI Pharmacy</h1>
              <p className="text-purple-300/50 text-xs tracking-widest uppercase">User Dashboard</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-xs">
             <div className="hidden md:flex items-center space-x-2 bg-[#141225] px-4 py-2 rounded-lg border border-purple-800/30">
               <User className="w-4 h-4 text-purple-400" />
               <span className="text-purple-200">Hello, Healthcare Pro</span>
             </div>
             <button 
               onClick={() => navigate('/')}
               className="bg-purple-900/40 hover:bg-purple-800/60 transition-all p-2 rounded-lg border border-purple-500/20"
             >
               <LogOut className="w-5 h-5 text-purple-400" />
             </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {metrics.map((m, i) => (
             <motion.div 
               key={i}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               className={`bg-gradient-to-br ${m.color} backdrop-blur-lg p-6 rounded-2xl border border-purple-500/10 hover:border-purple-500/30 transition-all group`}
             >
               <div className="flex items-center justify-between mb-4">
                 <div className="p-2 rounded-lg bg-purple-500/10 group-hover:scale-110 transition-transform">
                   {m.icon}
                 </div>
                 <Bell className="w-4 h-4 text-purple-300/20 group-hover:text-purple-400 transition-colors" />
               </div>
               <p className="text-purple-300/60 text-sm font-medium">{m.label}</p>
               <h3 className="text-3xl font-bold mt-1 text-white">{m.value}</h3>
             </motion.div>
          ))}
        </div>

        {/* Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <div className="bg-white/5 backdrop-blur-lg p-8 rounded-2xl border border-purple-500/20 h-[300px] flex items-center justify-center group cursor-pointer hover:border-purple-500/40 transition-all">
             <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-purple-500/10 flex items-center justify-center group-hover:animate-pulse">
                   <Activity className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold">Health Tracker</h3>
                <p className="text-purple-300/40 text-sm">Real-time patient monitoring active</p>
             </div>
           </div>

           <div className="bg-white/5 backdrop-blur-lg p-8 rounded-2xl border border-purple-500/20 h-[300px] flex items-center justify-center group cursor-pointer hover:border-purple-500/40 transition-all">
             <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-purple-500/10 flex items-center justify-center group-hover:animate-pulse">
                   <Pill className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold">Pharmacy Inventory</h3>
                <p className="text-purple-300/40 text-sm">System synchronized with central database</p>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;

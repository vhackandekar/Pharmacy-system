import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, Settings, Database, Server, Terminal, LogOut, ShieldCheck, Activity } from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const stats = [
    { label: 'Total Systems', value: '458', icon: <Server className="w-5 h-5" />, trend: '+12%' },
    { label: 'Active Admins', value: '24', icon: <Users className="w-5 h-5" />, trend: 'Stable' },
    { label: 'Data Processing', value: '2.4 TB', icon: <Database className="w-5 h-5" />, trend: '+0.5%' },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white flex relative overflow-hidden">
      {/* Background Matrix Glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-900/10 blur-[150px] rounded-full opacity-50"></div>

      {/* Sidebar */}
      <aside className="w-64 bg-black/40 border-r border-purple-900/30 backdrop-blur-2xl p-6 space-y-8 relative z-20 hidden lg:block">
        <div className="flex items-center space-x-3 mb-10">
          <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <ShieldCheck className="w-6 h-6 text-purple-400" />
          </div>
          <span className="font-bold text-lg tracking-tight">Admin OS</span>
        </div>

        <nav className="space-y-4">
           {[
             { name: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, active: true },
             { name: 'Users', icon: <Users className="w-4 h-4" /> },
             { name: 'System Logs', icon: <Terminal className="w-4 h-4" /> },
             { name: 'Settings', icon: <Settings className="w-4 h-4" /> }
           ].map((item, i) => (
             <div key={i} className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all ${item.active ? 'bg-purple-500/10 border border-purple-500/20 text-purple-300' : 'text-zinc-500 hover:text-zinc-300'}`}>
               {item.icon}
               <span className="text-sm font-medium">{item.name}</span>
             </div>
           ))}
        </nav>

        <div className="absolute bottom-8 left-6 right-6">
           <button 
             onClick={() => navigate('/')}
             className="w-full flex items-center justify-between p-3 rounded-xl bg-red-500/5 border border-red-500/10 text-red-500 hover:bg-red-500/10 transition-all group"
           >
             <span className="text-xs font-bold uppercase tracking-widest">Terminate OS</span>
             <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto relative z-10">
        <div className="max-w-5xl mx-auto space-y-8">
           {/* Header */}
           <div className="flex items-center justify-between bg-white/5 p-6 rounded-2xl border border-white/5 backdrop-blur-md">
             <div>
               <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">System Admin Control</h1>
               <div className="flex items-center space-x-2 mt-1">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                 <span className="text-[10px] uppercase font-bold text-green-500 tracking-[0.2em]">All Systems Operational</span>
               </div>
             </div>
             <div className="flex items-center space-x-4">
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] uppercase font-black text-white/40 tracking-widest">Last Update</p>
                  <p className="text-xs font-mono text-purple-400">14:24:08 // MST</p>
                </div>
                <div className="w-12 h-12 rounded-full border border-purple-500/30 flex items-center justify-center bg-purple-500/10">
                   <Activity className="w-6 h-6 text-purple-400" />
                </div>
             </div>
           </div>

           {/* Stats Grid */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {stats.map((s, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-[#0f0f0f] border border-white/5 p-6 rounded-2xl hover:border-purple-500/20 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-8">
                    <div className="p-3 rounded-xl bg-zinc-900 text-purple-400 border border-white/5">
                      {s.icon}
                    </div>
                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${s.trend === 'Stable' ? 'bg-zinc-800 text-zinc-400' : 'bg-purple-900/30 text-purple-400'}`}>
                      {s.trend}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-3xl font-black tracking-tight">{s.value}</h2>
                    <p className="text-[10px] uppercase font-bold text-zinc-500 mt-1 tracking-widest">{s.label}</p>
                  </div>
                </motion.div>
             ))}
           </div>

           {/* System Activity */}
           <div className="bg-[#0f0f0f] border border-white/5 rounded-2xl overflow-hidden shrink-0">
              <div className="p-5 border-b border-white/5 flex items-center justify-between bg-zinc-900/30">
                 <h3 className="text-xs font-black uppercase tracking-widest text-white">Live System Activity</h3>
                 <Terminal className="w-4 h-4 text-purple-400" />
              </div>
              <div className="p-0 font-mono text-[11px] leading-relaxed">
                 {[
                   { cmd: 'SYS:ROOT_AUTH', status: 'GRANTED', time: '14:24:12' },
                   { cmd: 'DDB:SYNC_CORE', status: 'INITIATED', time: '14:24:10' },
                   { cmd: 'NETWORK:PROT_V4', status: 'STABLE', time: '14:24:08' },
                   { cmd: 'VM:DOCKER_CONT_01', status: 'HEALTHY', time: '14:24:05' }
                 ].map((log, i) => (
                   <div key={i} className="flex items-center justify-between px-6 py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors group">
                      <div className="flex items-center space-x-4">
                        <span className="text-zinc-700 font-bold">{log.time}</span>
                        <span className="text-purple-400 font-bold tracking-tight">{log.cmd}</span>
                      </div>
                      <span className={`font-black tracking-tighter ${log.status === 'GRANTED' ? 'text-green-500' : 'text-purple-300'}`}>{log.status}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

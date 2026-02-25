import React, { useState } from 'react';
import { 
  BarChart3, Box, AlertTriangle, Users, TrendingUp, 
  ArrowUpRight, ArrowDownRight, MoreVertical, Search,
  Filter, Download, ShieldCheck, Plus
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { Card, Badge, Button } from '../Component/UI';

const AdminDashboard = () => {
  const { theme } = useTheme();
  
  const stats = [
    { label: "Total Revenue", value: "$42,500", trend: "+12.5%", isUp: true },
    { label: "Active Agents", value: "24", trend: "0%", isUp: true },
    { label: "Low Stock Items", value: "12", trend: "-2", isUp: false },
    { label: "Pending Prescriptions", value: "85", trend: "+14", isUp: true }
  ];

  const inventory = [
    { id: "INV001", name: "Atorvastatin 40mg", stock: 1200, status: "Healthy", reorder: "2000" },
    { id: "INV002", name: "Lisinopril 10mg", stock: 45, status: "Low Stock", reorder: "500" },
    { id: "INV003", name: "Metformin 500mg", stock: 850, status: "Healthy", reorder: "1000" },
    { id: "INV004", name: "Amoxicillin 250mg", stock: 12, status: "Critical", reorder: "300" }
  ];

  return (
    <div className="min-h-screen p-8 transition-colors duration-500 bg-brand-background text-brand-text-primary">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div>
          <div className="flex items-center space-x-3 mb-2">
             <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary">
                <ShieldCheck size={20} />
             </div>
             <h2 className="text-3xl font-black tracking-tight underline decoration-brand-primary/30 underline-offset-8">Clinical Control Center</h2>
          </div>
          <p className="text-sm opacity-60 font-bold uppercase tracking-widest text-brand-text-secondary">Inventory & Agent Monitoring</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative text-brand-text-primary">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" size={16} />
             <input 
               type="text" 
               placeholder="Search records..." 
               className="pl-10 pr-4 py-2 text-xs font-bold rounded-xl border border-brand-border-color bg-brand-card focus:outline-none focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary/50 transition-all" 
             />
          </div>
          <Button variant="secondary" size="sm">
             <Download size={16} className="mr-2" />
             Export Data
          </Button>
          <Button variant="ghost" className="bg-brand-error/10 text-brand-error" onClick={() => window.location.href='/'}>Logout</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((s, i) => (
          <Card key={i} className="flex items-center justify-between group">
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">{s.label}</p>
                <h3 className="text-2xl font-black">{s.value}</h3>
                <div className="flex items-center mt-1 space-x-1">
                   {s.isUp ? <ArrowUpRight size={12} className="text-brand-success" /> : <ArrowDownRight size={12} className="text-brand-error" />}
                   <span className={`text-[10px] font-bold ${s.isUp ? 'text-brand-success' : 'text-brand-error'}`}>{s.trend}</span>
                </div>
             </div>
             <div className="p-4 rounded-2xl transition-all duration-500 group-hover:scale-110 bg-brand-background">
                {i === 0 ? <TrendingUp size={24} className="text-brand-primary" /> : i === 1 ? <Users size={24} className="text-brand-secondary" /> : i === 2 ? <Box size={24} className="text-brand-warning" /> : <ShieldCheck size={24} className="text-brand-accent" />}
             </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Inventory Master Table */}
        <Card className="lg:col-span-2 overflow-hidden px-0 py-0">
          <div className="p-6 border-b border-brand-border-color flex items-center justify-between">
             <div className="flex items-center space-x-3">
                <Box size={18} className="opacity-40" />
                <h4 className="font-black text-sm uppercase tracking-widest">Inventory Management</h4>
             </div>
             <Button variant="secondary" size="sm">
                <Plus size={14} className="mr-2" />
                Add Item
             </Button>
          </div>
          <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black uppercase tracking-widest opacity-40 bg-brand-background">
                    <th className="px-6 py-4">Item Name</th>
                    <th className="px-6 py-4">Stock Level</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-center">Refill Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border-color">
                  {inventory.map((item) => (
                    <tr key={item.id} className="hover:bg-brand-hover-tint transition-colors group">
                      <td className="px-6 py-5">
                        <p className="text-sm font-bold">{item.name}</p>
                        <p className="text-[10px] opacity-40 font-bold uppercase">SKU: {item.id}</p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col space-y-1">
                           <span className="text-sm font-bold">{item.stock} Units</span>
                           <div className="w-32 h-1 bg-brand-border-color rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${item.status === 'Healthy' ? 'bg-brand-success' : item.status === 'Low Stock' ? 'bg-brand-warning' : 'bg-brand-error'}`} 
                                style={{ width: `${Math.min((item.stock/item.reorder)*100, 100)}%` }} 
                              />
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                         <Badge variant={item.status === 'Healthy' ? 'success' : item.status === 'Low Stock' ? 'warning' : 'error'}>
                            {item.status}
                         </Badge>
                      </td>
                      <td className="px-6 py-5 text-center">
                         <Button variant="secondary" size="sm" className="opacity-40 group-hover:opacity-100">Restock</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        </Card>

        {/* Analytics & High-Efficiency Logs */}
        <div className="space-y-8">
           <Card>
              <div className="flex items-center justify-between mb-6">
                 <h4 className="font-black text-sm uppercase tracking-widest opacity-40 text-brand-primary">Refill Analytics</h4>
                 <BarChart3 size={18} className="opacity-40" />
              </div>
              <div className="flex items-end justify-between h-32 space-x-2">
                 {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ height: 0 }} 
                      animate={{ height: `${h}%` }}
                      className="w-full rounded-t-lg transition-all duration-1000 bg-brand-primary/20 hover:bg-brand-secondary" 
                    />
                 ))}
              </div>
              <div className="flex justify-between mt-4 text-[10px] font-black opacity-30 uppercase tracking-tighter">
                 <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
              </div>
           </Card>

           <Card>
              <h4 className="font-black text-sm uppercase tracking-widest opacity-40 mb-6 flex items-center">
                 <AlertTriangle size={16} className="text-brand-warning mr-2" />
                 Low-Efficiency Logs
              </h4>
              <div className="space-y-6">
                {[
                  { agent: "Bot-Alpha", action: "Failed STT Recognition", time: "10 mins ago" },
                  { agent: "Medic-241", action: "Inventory Mismatch", time: "1 hour ago" },
                  { agent: "Admin-X", action: "Bulk Refill #401 Approved", time: "2 hours ago" }
                ].map((log, k) => (
                  <div key={k} className="flex items-start justify-between">
                     <div>
                        <p className="text-xs font-bold">{log.agent}</p>
                        <p className="text-[10px] opacity-40 mt-1 font-bold">{log.action}</p>
                     </div>
                     <span className="text-[10px] font-black opacity-20 whitespace-nowrap">{log.time}</span>
                  </div>
                ))}
              </div>
              <Button variant="ghost" className="w-full mt-6 text-[10px] font-black uppercase tracking-[0.2em] opacity-40 hover:opacity-100">
                 View System Terminal
              </Button>
           </Card>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;

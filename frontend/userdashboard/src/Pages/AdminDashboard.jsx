import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Box, AlertTriangle, Users, TrendingUp, 
  ArrowUpRight, ArrowDownRight, Search,
  Download, ShieldCheck, Plus, Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { Card, Badge, Button } from '../Component/UI';
import { adminAPI } from '../services/api';

const getStockStatus = (stock) => {
  if (stock === 0) return 'Critical';
  if (stock < 20) return 'Low Stock';
  return 'Healthy';
};

const AdminDashboard = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [activity, setActivity] = useState({ recentOrders: [], recentNotifications: [] });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [statsRes, analyticsRes, inventoryRes, activityRes] = await Promise.all([
          adminAPI.getStats(),
          adminAPI.getAnalytics(),
          adminAPI.getInventory(),
          adminAPI.getActivity()
        ]);
        setStats(statsRes.data);
        setAnalytics(analyticsRes.data);
        setInventory(inventoryRes.data?.medicines ?? []);
        setActivity({
          recentOrders: activityRes.data?.recentOrders ?? [],
          recentNotifications: activityRes.data?.recentNotifications ?? []
        });
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const statsCards = stats && analytics ? [
    { label: "Total Revenue", value: `$${Number(analytics.financials?.totalRevenue ?? 0).toLocaleString()}`, trend: "From orders", isUp: true },
    { label: "Orders Today", value: String(stats.ordersToday ?? 0), trend: "Today", isUp: true },
    { label: "Low Stock Items", value: String(stats.lowStockCount ?? 0), trend: "Need attention", isUp: false },
    { label: "Pending Refills", value: String(stats.pendingRefills ?? 0), trend: "Alerts", isUp: true }
  ] : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-background">
        <Loader2 className="w-10 h-10 animate-spin text-brand-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-background text-brand-text-primary p-8">
        <AlertTriangle className="w-12 h-12 text-brand-error mb-4" />
        <p className="text-brand-error font-bold mb-4">{error}</p>
        <Button variant="secondary" onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

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
        {statsCards.map((s, i) => (
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
                  {inventory.map((item) => {
                    const status = getStockStatus(item.stock);
                    const reorderLevel = 20;
                    const pct = item.stock > 0 ? Math.min((item.stock / reorderLevel) * 100, 100) : 0;
                    return (
                      <tr key={item._id} className="hover:bg-brand-hover-tint transition-colors group">
                        <td className="px-6 py-5">
                          <p className="text-sm font-bold">{item.name}</p>
                          <p className="text-[10px] opacity-40 font-bold uppercase">{item.dosage || ''} {item.unitType || ''}</p>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col space-y-1">
                             <span className="text-sm font-bold">{item.stock} Units</span>
                             <div className="w-32 h-1 bg-brand-border-color rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${status === 'Healthy' ? 'bg-brand-success' : status === 'Low Stock' ? 'bg-brand-warning' : 'bg-brand-error'}`} 
                                  style={{ width: `${pct}%` }} 
                                />
                             </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                           <Badge variant={status === 'Healthy' ? 'success' : status === 'Low Stock' ? 'warning' : 'error'}>
                              {status}
                           </Badge>
                        </td>
                        <td className="px-6 py-5 text-center">
                           <Button variant="secondary" size="sm" className="opacity-40 group-hover:opacity-100">Restock</Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
             </table>
          </div>
        </Card>

        {/* Analytics & High-Efficiency Logs */}
        <div className="space-y-8">
           <Card>
              <div className="flex items-center justify-between mb-6">
                 <h4 className="font-black text-sm uppercase tracking-widest opacity-40 text-brand-primary">Order Stats</h4>
                 <BarChart3 size={18} className="opacity-40" />
              </div>
              <div className="flex items-end justify-between h-32 space-x-2">
                 {analytics?.ordersStats ? [
                   analytics.ordersStats.total,
                   analytics.ordersStats.confirmed,
                   analytics.ordersStats.shipped,
                   analytics.ordersStats.fulfilled
                 ].map((val, i) => {
                   const max = Math.max(analytics.ordersStats.total, 1);
                   const h = Math.round((val / max) * 100);
                   return (
                     <motion.div 
                       key={i} 
                       initial={{ height: 0 }} 
                       animate={{ height: `${h}%` }}
                       className="w-full rounded-t-lg transition-all duration-1000 bg-brand-primary/20 hover:bg-brand-secondary" 
                     />
                   );
                 }) : [40, 70, 45, 90].map((h, i) => (
                   <motion.div 
                     key={i} 
                     initial={{ height: 0 }} 
                     animate={{ height: `${h}%` }}
                     className="w-full rounded-t-lg transition-all duration-1000 bg-brand-primary/20 hover:bg-brand-secondary" 
                   />
                 ))}
              </div>
              <div className="flex justify-between mt-4 text-[10px] font-black opacity-30 uppercase tracking-tighter">
                 <span>Total</span><span>Confirmed</span><span>Shipped</span><span>Fulfilled</span>
              </div>
           </Card>

           <Card>
              <h4 className="font-black text-sm uppercase tracking-widest opacity-40 mb-6 flex items-center">
                 <AlertTriangle size={16} className="text-brand-warning mr-2" />
                 Recent Activity
              </h4>
              <div className="space-y-6">
                {(activity.recentOrders?.length ? activity.recentOrders.slice(0, 5) : []).map((order) => (
                  <div key={order._id} className="flex items-start justify-between">
                     <div>
                        <p className="text-xs font-bold">Order #{String(order._id).slice(-6)}</p>
                        <p className="text-[10px] opacity-40 mt-1 font-bold">{order.status} · ${Number(order.totalAmount || 0).toFixed(2)}</p>
                     </div>
                     <span className="text-[10px] font-black opacity-20 whitespace-nowrap">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''}</span>
                  </div>
                ))}
                {(!activity.recentOrders?.length) && (
                  <p className="text-[10px] opacity-40 font-bold">No recent orders</p>
                )}
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

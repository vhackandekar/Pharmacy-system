import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Filter, Package, Calendar, 
  MoreVertical, Download, ChevronRight,
  Clock, CheckCircle2, XCircle
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useOrders } from '../context/OrderContext';
import { Card, Badge, Button } from '../Component/UI';

const HistoryPage = () => {
  const { theme } = useTheme();
  const { orders } = useOrders();
  const [searchQuery, setSearchQuery] = useState('');

  // Fallback mock data for visualization if real orders are empty
  const mockOrders = [
    {
      id: '3321',
      name: 'Amoxicillin 500mg',
      date: 'Feb 10, 2026',
      qty: '20 Capsules',
      status: 'Delivered',
      image: '💊'
    },
    {
      id: '1234',
      name: 'Ibuprofen 400mg',
      date: 'Jan 28, 2026',
      qty: '50 Tablets',
      status: 'Delivered',
      image: '💊'
    },
    {
      id: '5678',
      name: 'Metformin 500mg',
      date: 'Jan 15, 2026',
      qty: '60 Tablets',
      status: 'Cancelled',
      image: '💊'
    }
  ];

  const displayOrders = orders.length > 0 ? orders : mockOrders;

  const filteredOrders = displayOrders.filter(order => 
    order.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusVariant = (status) => {
    const s = status.toLowerCase();
    if (s.includes('deliver')) return 'success';
    if (s.includes('cancel') || s.includes('reject')) return 'error';
    if (s.includes('process')) return 'warning';
    if (s.includes('ship')) return 'purple';
    return 'info';
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tighter mb-2 text-brand-text-primary">Order History</h2>
          <p className="text-sm opacity-60 font-medium font-['Inter'] text-brand-text-secondary">View your past orders and download receipts.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group min-w-[300px]">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-opacity ${theme === 'dark' ? 'text-white/30 group-focus-within:text-brand-primary' : 'text-slate-400 group-focus-within:text-brand-primary'}`} size={18} />
            <input 
              type="text"
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`
                pl-12 pr-6 py-3 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-brand-primary/10 w-full transition-all border
                ${theme === 'dark' 
                  ? 'bg-slate-900 border-white/10 text-white placeholder:text-white/20' 
                  : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 shadow-sm'}
              `}
            />
          </div>
          <Button variant="secondary" className={`p-3 rounded-2xl border ${theme === 'dark' ? 'border-white/10 bg-slate-900' : 'border-slate-200 bg-white'}`}>
            <Filter size={20} />
          </Button>
        </div>
      </div>

      {/* History Table/Card Container */}
      <div className="grid grid-cols-1 gap-6">
        {/* Desktop Table View */}
        <div className="hidden md:block">
          <Card className={`p-0 overflow-hidden border shadow-2xl rounded-[2rem] ${theme === 'dark' ? 'bg-slate-900/40 border-white/5' : 'bg-white border-slate-100'}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className={`border-b transition-colors ${theme === 'dark' ? 'bg-white/[0.07] border-white/10' : 'bg-slate-100/50 border-slate-200'}`}>
                    <th className="px-8 py-6 text-[12px] font-black uppercase tracking-[0.2em] text-brand-primary">Order ID</th>
                    <th className="px-8 py-6 text-[12px] font-black uppercase tracking-[0.2em] text-brand-primary">Medicine</th>
                    <th className="px-8 py-6 text-[12px] font-black uppercase tracking-[0.2em] text-brand-primary">Date</th>
                    <th className="px-8 py-6 text-[12px] font-black uppercase tracking-[0.2em] text-brand-primary">Quantity</th>
                    <th className="px-8 py-6 text-[12px] font-black uppercase tracking-[0.2em] text-brand-primary">Status</th>
                    <th className="px-8 py-6 text-[12px] font-black uppercase tracking-[0.2em] text-brand-primary">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${theme === 'dark' ? 'divide-white/5' : 'divide-slate-50'}`}>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order, idx) => (
                      <motion.tr 
                        key={order.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`
                          transition-all group cursor-pointer
                          ${theme === 'dark' ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50/50'}
                        `}
                      >
                        <td className="px-8 py-8 font-bold text-sm tracking-tight text-brand-primary uppercase">ORD-{order.id}</td>
                        <td className="px-8 py-8">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-110 ${theme === 'dark' ? 'bg-white/5 text-brand-primary' : 'bg-slate-100 text-brand-primary'}`}>
                              <Package size={20} className="opacity-80" />
                            </div>
                            <span className="font-extrabold text-sm text-brand-text-primary">{order.name}</span>
                          </div>
                        </td>
                        <td className="px-8 py-8">
                          <div className="flex items-center gap-2 text-brand-text-secondary">
                            <Calendar size={14} className="opacity-40" />
                            <span className="text-xs font-bold">{order.date}</span>
                          </div>
                        </td>
                        <td className="px-8 py-8">
                          <span className="text-xs font-black uppercase tracking-wider text-brand-text-secondary opacity-60 group-hover:opacity-100 transition-opacity whitespace-nowrap">{order.qty}</span>
                        </td>
                        <td className="px-8 py-8">
                          <Badge variant={getStatusVariant(order.status)} className="min-w-[100px] text-center">
                            {order.status}
                          </Badge>
                        </td>
                        <td className="px-8 py-8">
                          <div className="flex items-center gap-2">
                            <button className={`p-2 rounded-xl transition-all opacity-0 group-hover:opacity-100 ${theme === 'dark' ? 'hover:bg-white/10 text-white/40 hover:text-white' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-900'}`}>
                              <Download size={18} />
                            </button>
                            <button className={`p-2 rounded-xl transition-all opacity-0 group-hover:opacity-100 ${theme === 'dark' ? 'hover:bg-white/10 text-white/40 hover:text-white' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-900'}`}>
                              <MoreVertical size={18} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : null}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order, idx) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className={`p-6 border ${theme === 'dark' ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-100 shadow-lg shadow-slate-200/50'}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-[1rem] flex items-center justify-center ${theme === 'dark' ? 'bg-brand-primary' : 'bg-brand-primary'} text-white`}>
                        <Package size={18} />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-brand-text-primary leading-tight">{order.name}</h4>
                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary mt-0.5">ORD-{order.id}</p>
                      </div>
                    </div>
                    <Badge variant={getStatusVariant(order.status)} className="px-2 py-1 text-[8px]">
                      {order.status}
                    </Badge>
                  </div>

                  <div className={`grid grid-cols-2 gap-4 p-4 rounded-xl mb-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">Date</p>
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="opacity-40" />
                        <span className="text-[11px] font-bold text-brand-text-secondary">{order.date}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">Quantity</p>
                      <span className="text-[11px] font-bold text-brand-text-secondary">{order.qty}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="secondary" size="sm" className="flex-1 text-[10px] py-2">
                      <Download size={14} className="mr-2" /> Receipt
                    </Button>
                    <Button variant="secondary" size="sm" className="px-3 py-2">
                      <MoreVertical size={14} />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))
          ) : (
             <div className="py-20 text-center">
                <Package size={60} className="mx-auto opacity-10 mb-4" />
                <p className="text-xl font-black uppercase tracking-widest opacity-20 italic">No Orders</p>
             </div>
          )}
        </div>

        {/* Empty State for Desktop Table (if no results found via search) */}
        {filteredOrders.length === 0 && (
           <div className="hidden md:flex py-32 flex-col items-center opacity-10">
              <Package size={100} className="mb-6" />
              <p className="text-4xl font-black uppercase tracking-[0.2em] italic">No Orders Found</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;

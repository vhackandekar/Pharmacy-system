import React from 'react';
import { motion } from 'framer-motion';
import { Package, Truck, Calendar, RefreshCcw, ExternalLink } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useOrders } from '../context/OrderContext';
import { Card, Badge, Button } from '../Component/UI';

const MyOrders = () => {
  const { theme } = useTheme();
  const { orders, reorder } = useOrders();

  const getStatusVariant = (status) => {
    switch (status) {
      case 'Confirmed': return 'info';
      case 'Processing': return 'warning';
      case 'Shipped': return 'purple';
      case 'Delivered': return 'success';
      case 'Rejected': return 'error';
      default: return 'info';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight mb-2">My Orders</h2>
          <p className="text-sm opacity-60 font-medium">Manage your active deliveries and order history.</p>
        </div>
        <div className="flex items-center space-x-3">
           <Button variant="secondary" size="sm">
              <Calendar size={16} className="mr-2" />
              Filter by Date
           </Button>
           <Button variant="primary" size="sm">
              <Package size={16} className="mr-2" />
              Download Report
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {orders.length > 0 ? (
          orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="h-full flex flex-col relative overflow-hidden group">
                {/* Background Decor */}
                <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-10 transition-colors group-hover:opacity-20 ${
                  order.status === 'Delivered' ? 'bg-brand-success' : 'bg-brand-primary'
                }`} />

                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg bg-brand-background">
                      {order.image}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg leading-tight">{order.name}</h4>
                      <p className="text-xs opacity-40 font-bold uppercase tracking-widest mt-1">Ref: #{order.id}</p>
                    </div>
                  </div>
                  <Badge variant={getStatusVariant(order.status)}>
                    {order.status}
                  </Badge>
                </div>

                <div className="space-y-4 mb-8 flex-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="opacity-40 font-bold">Dosage</span>
                    <span className="font-bold">{order.dosage}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="opacity-40 font-bold">Quantity</span>
                    <span className="font-bold">{order.qty} Units</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="opacity-40 font-bold">Ordered On</span>
                    <span className="font-bold">{order.date}</span>
                  </div>
                  <div className="p-3 rounded-xl flex items-center space-x-3 bg-brand-background">
                    <Truck size={14} className="text-brand-primary" />
                    <p className="text-[10px] font-black uppercase tracking-tight">Est. Delivery: <span className="text-brand-primary">{order.estimate}</span></p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mt-auto">
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => reorder(order.id)}
                  >
                    <RefreshCcw size={14} className="mr-2" />
                    Reorder
                  </Button>
                  <Button variant="secondary" size="sm" className="px-3">
                    <ExternalLink size={14} />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
             <Package size={48} className="mx-auto opacity-20 mb-4" />
             <p className="text-sm opacity-40 font-bold">No orders found yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;

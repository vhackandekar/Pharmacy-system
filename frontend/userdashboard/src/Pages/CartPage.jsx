import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Package, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useOrders } from '../context/OrderContext';
import { Button, Badge } from '../Component/UI';
import { useNavigate } from 'react-router-dom';

const CartPage = () => {
  const { theme } = useTheme();
  const { cart, removeFromCart, updateCartQty, placeCartOrder, loading, fetchCart } = useOrders();
  const navigate = useNavigate();

  const total = cart.reduce((sum, item) => sum + (item.price || 0) * item.qty, 0);

  const handlePlaceOrder = async () => {
    if (window.confirm("Confirm order placement and proceed to payment?")) {
      await placeCartOrder();
    }
  };

  const handleClearCart = async () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      // Manual removal for now since we don't have a clear endpoint
      for (const item of cart) {
        await removeFromCart(item.id);
      }
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-10 gap-6"
      >
        <div>
          <h2 className="text-3xl font-black tracking-tight mb-1">My Cart</h2>
          <p className="text-sm opacity-50 font-medium">{cart.length} item{cart.length !== 1 ? 's' : ''} ready to order</p>
        </div>
        <div className="flex items-center gap-2">
          {cart.length > 0 && (
            <Button variant="secondary" size="sm" onClick={handleClearCart} className="flex-1 md:flex-none text-rose-500 hover:bg-rose-500/10">
              <Trash2 size={15} className="md:mr-2" />
              <span className="hidden md:inline">Clear Cart</span>
            </Button>
          )}
          {cart.length > 0 && (
            <Button variant="secondary" size="sm" onClick={() => navigate('/chat')} className="flex-1 md:flex-none">
              <Sparkles size={15} className="md:mr-2" />
              <span className="hidden md:inline">Browse More</span>
            </Button>
          )}
        </div>
      </motion.div>

      {cart.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-32 space-y-5"
        >
          <div className={`w-24 h-24 rounded-3xl flex items-center justify-center text-4xl ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'}`}>
            🛒
          </div>
          <div className="text-center">
            <h3 className="text-xl font-black tracking-tight mb-2">Your cart is empty</h3>
            <p className="text-sm opacity-40 font-medium">Ask the AI Pharmacist to add medicines to your cart.</p>
          </div>
          <Button variant="primary" onClick={() => navigate('/chat')}>
            <Sparkles size={16} className="mr-2" />
            Chat with AI Pharmacist
          </Button>
        </motion.div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {cart.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`rounded-2xl p-5 flex items-center gap-5 border transition-all ${theme === 'dark'
                    ? 'bg-white/3 border-white/8 hover:border-white/15'
                    : 'bg-white border-slate-100 shadow-sm hover:shadow-md'
                    }`}
                >
                  {/* Medicine Icon */}
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'
                    }`}>
                    {item.image || '💊'}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-base leading-tight">{item.name}</h4>
                    <p className="text-xs opacity-40 font-bold mt-0.5">{item.dosage}</p>
                    <p className="text-sm font-black text-brand-primary mt-1">
                      ₹{((item.price || 0) * item.qty).toFixed(2)}
                      <span className="text-xs opacity-40 font-medium ml-1">(₹{(item.price || 0).toFixed(2)} each)</span>
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className={`flex items-center rounded-xl border overflow-hidden ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'
                    }`}>
                    <button
                      onClick={() => updateCartQty(item.id, item.qty - 1)}
                      className={`p-2.5 transition-colors ${theme === 'dark' ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-4 text-sm font-black">{item.qty}</span>
                    <button
                      onClick={() => updateCartQty(item.id, item.qty + 1)}
                      className={`p-2.5 transition-colors ${theme === 'dark' ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className={`p-2.5 rounded-xl transition-all ${theme === 'dark' ? 'text-rose-400 hover:bg-rose-500/10' : 'text-rose-400 hover:bg-rose-50'}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`rounded-2xl p-6 border sticky top-28 ${theme === 'dark'
                ? 'bg-white/3 border-white/8'
                : 'bg-white border-slate-100 shadow-lg shadow-slate-100'
                }`}
            >
              <h3 className="font-black text-lg mb-6 tracking-tight">Order Summary</h3>

              <div className="space-y-3 mb-6">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span className="opacity-60 font-medium truncate mr-2">{item.name} ×{item.qty}</span>
                    <span className="font-black">₹{((item.price || 0) * item.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className={`pt-4 border-t ${theme === 'dark' ? 'border-white/10' : 'border-slate-100'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm opacity-50 font-medium">Subtotal</span>
                  <span className="text-sm font-black">₹{total.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm opacity-50 font-medium">Delivery</span>
                  <Badge variant="success">Free</Badge>
                </div>

                <div className="flex items-center justify-between mb-6">
                  <span className="font-black text-lg">Total</span>
                  <span className="font-black text-xl text-brand-primary">₹{total.toFixed(2)}</span>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={handlePlaceOrder}
                  loading={loading}
                >
                  <Package size={16} className="mr-2" />
                  Place Order
                  <ArrowRight size={16} className="ml-2" />
                </Button>

                <p className="text-center text-[10px] opacity-30 font-black uppercase tracking-widest mt-4">
                  Secure · Encrypted · HIPAA Compliant
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const OrderContext = createContext();

export const useOrders = () => useContext(OrderContext);

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState(() => {
    const savedOrders = localStorage.getItem('app-orders');
    return savedOrders ? JSON.parse(savedOrders) : [
      { id: '101', name: 'Atorvastatin', dosage: '20mg', qty: 30, price: 12.99, status: 'Shipped', date: '2024-02-21', estimate: 'Today', image: '💊' },
      { id: '102', name: 'Lisinopril', dosage: '10mg', qty: 90, price: 8.49, status: 'Processing', date: '2024-02-22', estimate: 'Feb 24', image: '🧪' },
      { id: '103', name: 'Metformin', dosage: '500mg', qty: 60, price: 6.99, status: 'Delivered', date: '2024-02-18', estimate: 'Delivered', image: '💉' },
    ];
  });

  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('app-cart');
    return savedCart ? JSON.parse(savedCart) : [
      { id: 'c1', name: 'Paracetamol', dosage: '500mg', qty: 2, price: 4.99, image: '💊' },
      { id: 'c2', name: 'Vitamin D3', dosage: '1000 IU', qty: 1, price: 9.49, image: '🌟' },
    ];
  });

  const [stats, setStats] = useState({
    activeOrders: 3,
    pendingReview: 1,
    newMessages: 2,
    rewardPoints: 1250
  });

  useEffect(() => {
    localStorage.setItem('app-orders', JSON.stringify(orders));
    const active = orders.filter(o => ['Confirmed', 'Processing', 'Shipped'].includes(o.status)).length;
    setStats(prev => ({ ...prev, activeOrders: active }));
  }, [orders]);

  const socketRef = useRef(null);
  const { user } = useAuth();

  // Connect socket for this user to receive order status updates and refill alerts
  useEffect(() => {
    if (!user) return;
    const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    const socket = io(backend);
    socketRef.current = socket;
    socket.emit('join', { userId: user._id });

    socket.on('order_status_updated', ({ order, message }) => {
      // update or insert order
      setOrders(prev => {
        const found = (prev || []).some(o => String(o._id) === String(order._id) || o.id === order._id);
        if (found) return (prev || []).map(o => (String(o._id) === String(order._id) || o.id === order._id) ? order : o);
        return [order, ...(prev || [])];
      });
    });

    socket.on('refill_alert', (notification) => {
      // Could be used to show an in-app toast or update notifications list
      // For now we keep it in local storage or extend as needed
      console.log('refill_alert', notification);
    });

    return () => { socket.disconnect(); };
  }, [user]);

  useEffect(() => {
    localStorage.setItem('app-cart', JSON.stringify(cart));
  }, [cart]);

  const placeOrder = async (medicine) => {
    // If user is logged in, POST to backend so admin receives real-time event
    if (user && user._id) {
      try {
        const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        const payload = {
          userId: user._id,
          items: [{ medicineId: medicine._id || medicine.id, quantity: medicine.qty || 1 }],
          totalAmount: medicine.price || 0
        };
        const res = await axios.post(`${backend}/api/order/place`, payload);
        const created = res.data;
        setOrders(prev => [created, ...(prev || [])]);
        return created;
      } catch (e) {
        console.error('placeOrder network error', e);
        // fallback to local optimistic order
      }
    }

    const newOrder = {
      id: Math.floor(Math.random() * 900 + 100).toString(),
      name: medicine.name,
      dosage: medicine.dosage || 'Standard',
      qty: medicine.qty || 1,
      price: medicine.price || 0,
      status: 'Confirmed',
      date: new Date().toISOString().split('T')[0],
      estimate: 'Within 2-3 days',
      image: medicine.image || '💊'
    };
    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  const reorder = (orderId) => {
    const orderToReorder = orders.find(o => o.id === orderId);
    if (orderToReorder) placeOrder(orderToReorder);
  };

  const addToCart = (medicine) => {
    setCart(prev => {
      const existing = prev.find(item => item.name === medicine.name);
      if (existing) {
        return prev.map(item => item.name === medicine.name ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { id: `c${Date.now()}`, ...medicine }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const updateCartQty = (itemId, qty) => {
    if (qty < 1) {
      removeFromCart(itemId);
      return;
    }
    setCart(prev => prev.map(item => item.id === itemId ? { ...item, qty } : item));
  };

  const placeCartOrder = () => {
    cart.forEach(item => placeOrder(item));
    setCart([]);
  };

  return (
    <OrderContext.Provider value={{
      orders, cart, stats,
      placeOrder, reorder,
      addToCart, removeFromCart, updateCartQty, placeCartOrder,
      setCart
    }}>
      {children}
    </OrderContext.Provider>
  );
};

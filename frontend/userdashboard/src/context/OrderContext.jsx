import React, { createContext, useContext, useState, useEffect } from 'react';

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

  useEffect(() => {
    localStorage.setItem('app-cart', JSON.stringify(cart));
  }, [cart]);

  const placeOrder = (medicine) => {
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

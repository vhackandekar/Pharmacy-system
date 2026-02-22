import { useState, useEffect, useRef } from 'react';
import { Search, Bell, Moon, Sun, ShoppingCart, AlertTriangle, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getNotifications, getAllOrders, getMedicines } from '../utils/api';
import { Link, useNavigate } from 'react-router-dom';

export default function Topbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [loading, setLoading] = useState(false);
  const notificationsRef = useRef(null);
  const profileRef = useRef(null);
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'SA';

  useEffect(() => {
    fetchNotifications();
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };

    if (showNotifications || showProfile) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications, showProfile]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowProfile(false);
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // Try to fetch real notifications
      try {
        const [notifsRes, ordersRes, medicinesRes] = await Promise.all([
          user?.id ? getNotifications(user.id).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
          getAllOrders().catch(() => ({ data: [] })),
          getMedicines().catch(() => ({ data: [] }))
        ]);

        const allNotifs = [];
        
        // Add pending orders
        const pendingOrders = (ordersRes.data || []).filter(o => 
          o.status === 'PENDING' || o.status === 'CONFIRMED'
        ).slice(0, 5);
        pendingOrders.forEach(order => {
          allNotifs.push({
            id: `order-${order._id}`,
            type: 'order',
            title: 'New Order',
            message: `Order #${order._id?.slice(-6).toUpperCase()} - ₹${order.totalAmount?.toLocaleString()}`,
            time: new Date(order.orderDate),
            icon: ShoppingCart,
            link: '/orders',
            unread: true
          });
        });

        // Add low stock medicines
        const lowStock = (medicinesRes.data || []).filter(m => m.stock < 20).slice(0, 5);
        lowStock.forEach(med => {
          allNotifs.push({
            id: `stock-${med._id}`,
            type: 'stock',
            title: 'Low Stock Alert',
            message: `${med.name} - Only ${med.stock} units left`,
            time: new Date(),
            icon: AlertTriangle,
            link: '/inventory',
            unread: true
          });
        });

        // Sort by time (newest first)
        allNotifs.sort((a, b) => b.time - a.time);
        setNotifications(allNotifs.slice(0, 10));
      } catch {
        // Fallback to mock data
        setNotifications([
          {
            id: '1',
            type: 'order',
            title: 'New Order',
            message: 'Order #ABC123 - ₹2,500',
            time: new Date(),
            icon: ShoppingCart,
            link: '/orders',
            unread: true
          },
          {
            id: '2',
            type: 'stock',
            title: 'Low Stock Alert',
            message: 'Amoxicillin 500mg - Only 15 units left',
            time: new Date(Date.now() - 3600000),
            icon: AlertTriangle,
            link: '/inventory',
            unread: true
          },
          {
            id: '3',
            type: 'order',
            title: 'New Order',
            message: 'Order #XYZ789 - ₹1,800',
            time: new Date(Date.now() - 7200000),
            icon: ShoppingCart,
            link: '/orders',
            unread: false
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, unread: false } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <header className="topbar">
      <div className="search-bar">
        <Search size={16} color="var(--text-muted)" />
        <input placeholder="Search medicines, orders, patients..." />
      </div>

      <div className="topbar-actions">
        <button 
          className="icon-btn" 
          onClick={toggleTheme} 
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <div className="notification-wrapper" ref={notificationsRef}>
          <button 
            className="icon-btn" 
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="notif-dot" />}
            {unreadCount > 0 && (
              <span className="notif-count">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>
          
          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h4>Notifications</h4>
                {unreadCount > 0 && (
                  <button 
                    className="mark-all-read-btn"
                    onClick={markAllAsRead}
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              
              <div className="notification-list">
                {loading ? (
                  <div className="notification-empty">Loading notifications...</div>
                ) : notifications.length === 0 ? (
                  <div className="notification-empty">
                    <Bell size={24} style={{ opacity: 0.3, marginBottom: 8 }} />
                    <p>No notifications</p>
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const Icon = notif.icon;
                    return (
                      <Link
                        key={notif.id}
                        to={notif.link}
                        className={`notification-item ${notif.unread ? 'unread' : ''}`}
                        onClick={() => {
                          markAsRead(notif.id);
                          setShowNotifications(false);
                        }}
                      >
                        <div className="notification-icon">
                          <Icon size={16} />
                        </div>
                        <div className="notification-content">
                          <div className="notification-title">{notif.title}</div>
                          <div className="notification-message">{notif.message}</div>
                          <div className="notification-time">{formatTime(notif.time)}</div>
                        </div>
                        {notif.unread && <div className="notification-unread-dot" />}
                      </Link>
                    );
                  })
                )}
              </div>
              
              {notifications.length > 0 && (
                <div className="notification-footer">
                  <Link to="/refill-alerts" onClick={() => setShowNotifications(false)}>
                    View all notifications
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="profile-wrapper" ref={profileRef}>
          <div 
            className="admin-profile" 
            onClick={() => setShowProfile(!showProfile)}
            style={{ cursor: 'pointer' }}
          >
            <div className="admin-avatar">{initials}</div>
            <div className="admin-info">
              <h4>{user?.name || 'System Admin'}</h4>
              <span>Pharmacy Manager</span>
            </div>
            <ChevronDown size={16} style={{ marginLeft: 8, opacity: 0.6, transition: 'transform 0.2s', transform: showProfile ? 'rotate(180deg)' : 'rotate(0deg)' }} />
          </div>
          
          {showProfile && (
            <div className="profile-dropdown">
              <div className="profile-header">
                <div className="profile-avatar-large">
                  {initials}
                </div>
                <div className="profile-info-large">
                  <h4>{user?.name || 'System Admin'}</h4>
                  <span>{user?.email || 'admin@pharmacy.com'}</span>
                  <div className="profile-role">{user?.role || 'ADMIN'}</div>
                </div>
              </div>
              
              <div className="profile-menu">
                <Link 
                  to="/settings" 
                  className="profile-menu-item"
                  onClick={() => setShowProfile(false)}
                >
                  <User size={16} />
                  <span>View Profile</span>
                </Link>
                <Link 
                  to="/settings" 
                  className="profile-menu-item"
                  onClick={() => setShowProfile(false)}
                >
                  <Settings size={16} />
                  <span>Settings</span>
                </Link>
                <div className="profile-menu-divider" />
                <button 
                  className="profile-menu-item logout-item"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

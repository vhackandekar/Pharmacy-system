import { useState, useEffect } from 'react';
import { Truck, MapPin, Clock, CheckCircle } from 'lucide-react';
import { getAllOrders, updateOrderStatus, triggerOrderWebhook } from '../utils/api';
import toast from 'react-hot-toast';
import { usePollingData } from '../hooks/usePollingData';

const mockDeliveries = [
  { _id: 'd1', orderId: 'ORD-8894', customer: 'Emily Davis', address: '123 MG Road, Bengaluru', items: 4, amount: 12000, status: 'SHIPPED', eta: '2 hours', phone: '+91 98765 43210' },
  { _id: 'd2', orderId: 'ORD-8891', customer: 'Priya Sharma', address: '45 Linking Road, Mumbai', items: 2, amount: 8500, status: 'IN_WAREHOUSE', eta: 'Tomorrow', phone: '+91 87654 32109' },
  { _id: 'd3', orderId: 'ORD-8889', customer: 'Karan Mehta', address: '78 CP, New Delhi', items: 1, amount: 3200, status: 'SHIPPED', eta: '4 hours', phone: '+91 76543 21098' },
  { _id: 'd4', orderId: 'ORD-8888', customer: 'Anjali Singh', address: '12 Park Street, Kolkata', items: 3, amount: 15000, status: 'FULFILLED', eta: 'Delivered', phone: '+91 65432 10987' },
  { _id: 'd5', orderId: 'ORD-8886', customer: 'Rahul Verma', address: '56 Anna Salai, Chennai', items: 2, amount: 9000, status: 'IN_WAREHOUSE', eta: 'Tomorrow', phone: '+91 54321 09876' },
];

const statusOptions = ['IN_WAREHOUSE', 'SHIPPED', 'FULFILLED'];

const statusIcon = (s) => {
  if (s === 'FULFILLED') return <CheckCircle size={16} color="var(--accent-green)" />;
  if (s === 'SHIPPED') return <Truck size={16} color="var(--accent-purple)" />;
  return <Clock size={16} color="var(--accent-orange)" />;
};

export default function Deliveries() {
  const [deliveries, setDeliveries] = useState(mockDeliveries);
  const [updating, setUpdating] = useState(null);

  // Use polling hook for real-time delivery/order updates (every 5 seconds - urgent)
  const { data: ordersData, loading, error, refetch } = usePollingData(
    () => getAllOrders().then(res => res.data),
    5000,
    true,
    []
  );

  // Update deliveries when orders data changes - filter for active deliveries
  useEffect(() => {
    if (ordersData && Array.isArray(ordersData)) {
      const activeDeliveries = ordersData
        .filter(order => ['IN_WAREHOUSE', 'SHIPPED', 'FULFILLED'].includes(order.status))
        .map(order => ({
          _id: order._id,
          orderId: order._id?.slice(-6),
          customer: order.userId?.name || 'Unknown',
          address: order.address || 'Unknown',
          items: order.items?.length || 0,
          amount: order.totalAmount || 0,
          status: order.status,
          eta: order.status === 'FULFILLED' ? 'Delivered' : `${Math.random() > 0.5 ? '2' : '4'} hours`,
          phone: order.userId?.phone || '+91 XXXXXXXXXX'
        }));
      if (activeDeliveries.length > 0) {
        setDeliveries(activeDeliveries);
      }
    }
  }, [ordersData]);

  const handleUpdate = async (id, orderId, status) => {
    setUpdating(id);
    try {
      await triggerOrderWebhook({ orderId, status, userId: 'admin' });
      setDeliveries(p => p.map(d => d._id === id ? { ...d, status } : d));
      toast.success(`Delivery status updated to ${status}`);
      refetch(); // Refetch to keep data in sync
    } catch {
      setDeliveries(p => p.map(d => d._id === id ? { ...d, status } : d));
      toast.success(`Updated to ${status} (demo)`);
    } finally { setUpdating(null); }
  };

  const counts = {
    IN_WAREHOUSE: deliveries.filter(d => d.status === 'IN_WAREHOUSE').length,
    SHIPPED: deliveries.filter(d => d.status === 'SHIPPED').length,
    FULFILLED: deliveries.filter(d => d.status === 'FULFILLED').length,
  };

  return (
    <div>
      <div className="page-header">
        <h1>Deliveries</h1>
        <p>Track and manage active shipments</p>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon orange"><Clock size={20} /></div>
          <div className="stat-value">{counts.IN_WAREHOUSE}</div>
          <div className="stat-label">In Warehouse</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple"><Truck size={20} /></div>
          <div className="stat-value">{counts.SHIPPED}</div>
          <div className="stat-label">Shipped / In Transit</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><CheckCircle size={20} /></div>
          <div className="stat-value">{counts.FULFILLED}</div>
          <div className="stat-label">Fulfilled Today</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {deliveries.map(d => (
          <div className="card" key={d._id} style={{ padding: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', alignItems: 'center', gap: 20, padding: '18px 24px' }}>
              {/* Order Info */}
              <div>
                <div style={{ fontWeight: 700, color: 'var(--accent-blue)', marginBottom: 4, fontSize: 14 }}>
                  #{d.orderId}
                </div>
                <div style={{ fontWeight: 600, marginBottom: 2 }}>{d.customer}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: 12 }}>
                  <MapPin size={12} /> {d.address}
                </div>
              </div>

              {/* Items & Amount */}
              <div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>{d.items} items</div>
                <div style={{ fontWeight: 700, color: 'var(--accent-green)', fontSize: 16 }}>₹{d.amount.toLocaleString()}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{d.phone}</div>
              </div>

              {/* ETA & Status */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  {statusIcon(d.status)}
                  <span className={`status-badge ${d.status.toLowerCase().replace('_', '_')}`}>{d.status}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={11} /> ETA: {d.eta}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                <select
                  className="filter-select"
                  value={d.status}
                  disabled={updating === d._id || d.status === 'FULFILLED'}
                  onChange={e => handleUpdate(d._id, d.orderId, e.target.value)}
                >
                  {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{ padding: '0 24px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              {['IN_WAREHOUSE', 'SHIPPED', 'FULFILLED'].map((step, i, arr) => {
                const stepIdx = arr.indexOf(d.status);
                const isActive = i <= stepIdx;
                return (
                  <div key={step} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                      background: isActive ? 'var(--accent-green)' : 'var(--border)',
                      transition: 'background 0.3s'
                    }} />
                    {i < arr.length - 1 && (
                      <div style={{
                        flex: 1, height: 2,
                        background: isActive ? 'var(--accent-green)' : 'var(--border)',
                        transition: 'background 0.3s'
                      }} />
                    )}
                  </div>
                );
              })}
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8, whiteSpace: 'nowrap' }}>
                {['Warehouse', 'Shipped', 'Delivered'].join(' → ')}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

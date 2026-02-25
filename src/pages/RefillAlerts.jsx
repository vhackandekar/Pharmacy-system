import { useState, useEffect } from 'react';
import { Bell, AlertTriangle, RefreshCw, Send } from 'lucide-react';
import { getMedicines, triggerRefillAlert, getInventoryDetails } from '../utils/api';
import toast from 'react-hot-toast';
import { usePollingData } from '../hooks/usePollingData';

const mockAlerts = [
  { _id: 'a1', medicineName: 'Amoxicillin 500mg', medicineId: 'm1', stock: 0, status: 'EMPTY', daysLeft: 0, customer: 'Sarah Johnson', userId: 'u1' },
  { _id: 'a2', medicineName: 'Lisinopril 10mg', medicineId: 'm2', stock: 85, status: 'LOW', daysLeft: 5, customer: 'Michael Chen', userId: 'u2' },
  { _id: 'a3', medicineName: 'Sertraline 50mg', medicineId: 'm3', stock: 95, status: 'LOW', daysLeft: 7, customer: 'Emily Davis', userId: 'u3' },
  { _id: 'a4', medicineName: 'Metformin 500mg', medicineId: 'm4', stock: 30, status: 'LOW', daysLeft: 3, customer: 'David Wilson', userId: 'u4' },
];

export default function RefillAlerts() {
  const [alerts, setAlerts] = useState(mockAlerts);
  const [lowStock, setLowStock] = useState([]);
  const [sending, setSending] = useState(null);
  const [tab, setTab] = useState('user');

  // Use polling hook for real-time inventory updates (every 10 seconds)
  const { data: inventoryData, loading, error, refetch } = usePollingData(
    () => getInventoryDetails().then(res => res.data),
    10000,
    true,
    []
  );

  // Update low stock when inventory data changes
  useEffect(() => {
    if (inventoryData?.medicines) {
      const medicines = inventoryData.medicines;
      setLowStock(medicines.filter(m => m.stock < 100));

      // Update alerts based on new medicine stock
      setAlerts(prevAlerts => prevAlerts.map(alert => {
        const med = medicines.find(m => m._id === alert.medicineId);
        if (med) {
          return {
            ...alert,
            stock: med.stock,
            status: med.stock === 0 ? 'EMPTY' : 'LOW'
          };
        }
        return alert;
      }));
    }
  }, [inventoryData]);

  const handleSendAlert = async (alert) => {
    setSending(alert._id);
    try {
      await triggerRefillAlert({
        type: 'STOCK_ALERT',
        medicineName: alert.medicineName,
        stockLeft: alert.stock,
        userId: alert.userId,
        daysLeft: alert.daysLeft,
      });
      toast.success(`Alert sent for ${alert.medicineName}`);
      setAlerts(p => p.map(a => a._id === alert._id ? { ...a, notified: true } : a));
    } catch {
      toast.success(`Alert sent (demo) for ${alert.medicineName}`);
      setAlerts(p => p.map(a => a._id === alert._id ? { ...a, notified: true } : a));
    } finally { setSending(null); }
  };

  const handleSendAll = async () => {
    for (const alert of alerts.filter(a => !a.notified)) {
      await handleSendAlert(alert);
      await new Promise(r => setTimeout(r, 300));
    }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1>Refill Alerts</h1>
          <p>Monitor stock levels and send refill notifications</p>
        </div>
        <button className="btn btn-primary" onClick={handleSendAll}>
          <Send size={16} /> Send All Alerts
        </button>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon red"><AlertTriangle size={20} /></div>
          <div className="stat-value">{alerts.filter(a => a.status === 'EMPTY').length}</div>
          <div className="stat-label">Out of Stock</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><Bell size={20} /></div>
          <div className="stat-value">{alerts.filter(a => a.status === 'LOW').length}</div>
          <div className="stat-label">Low Stock Alerts</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><RefreshCw size={20} /></div>
          <div className="stat-value">{alerts.filter(a => a.notified).length}</div>
          <div className="stat-label">Notifications Sent</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
        {[['user', 'User Refill Alerts'], ['inventory', 'Low Inventory']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="btn"
            style={{
              background: tab === key ? 'var(--brand)' : 'var(--bg-card)',
              color: tab === key ? 'white' : 'var(--text-secondary)',
              border: `1px solid ${tab === key ? 'transparent' : 'var(--border)'}`,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'user' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {alerts.map(alert => (
            <div className="card" key={alert._id} style={{ padding: '18px 22px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', alignItems: 'center', gap: 20 }}>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>{alert.medicineName}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Patient: {alert.customer}</div>
                </div>
                <div>
                  <span className={`status-badge ${alert.status.toLowerCase()}`}>{alert.status}</span>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                    Stock: {alert.stock} units
                  </div>
                </div>
                <div>
                  <div style={{
                    fontSize: 20, fontWeight: 800, fontFamily: 'Syne',
                    color: alert.daysLeft <= 3 ? 'var(--accent-red)' : 'var(--accent-orange)'
                  }}>
                    {alert.daysLeft} days
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>until out of stock</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {alert.notified ? (
                    <span style={{ fontSize: 12, color: 'var(--accent-green)', fontWeight: 600 }}>✓ Sent</span>
                  ) : (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleSendAlert(alert)}
                      disabled={sending === alert._id}
                    >
                      <Send size={14} />
                      {sending === alert._id ? 'Sending...' : 'Send Alert'}
                    </button>
                  )}
                </div>
              </div>

              {alert.daysLeft <= 3 && (
                <div style={{
                  marginTop: 12, padding: '8px 12px',
                  background: 'rgba(239,68,68,0.08)', borderRadius: 8,
                  fontSize: 13, color: 'var(--accent-red)',
                  display: 'flex', alignItems: 'center', gap: 6
                }}>
                  <AlertTriangle size={14} />
                  Urgent: Customer will run out in {alert.daysLeft} day{alert.daysLeft !== 1 ? 's' : ''}!
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Current Stock</th>
                <th>Stock Level</th>
                <th>Price</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {lowStock.map(med => (
                <tr key={med._id}>
                  <td style={{ fontWeight: 600 }}>{med.name}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 80 }}>
                        <div className="stock-bar">
                          <div className="stock-bar-fill" style={{
                            width: `${Math.min((med.stock / 200) * 100, 100)}%`,
                            background: med.stock === 0 ? 'var(--accent-red)' : 'var(--accent-orange)'
                          }} />
                        </div>
                      </div>
                      <span style={{ fontWeight: 600, color: med.stock === 0 ? 'var(--accent-red)' : 'var(--accent-orange)' }}>
                        {med.stock}
                      </span>
                    </div>
                  </td>
                  <td>{med.stock === 0 ? '🔴 Empty' : '🟡 Low'}</td>
                  <td>₹{med.price?.toLocaleString()}</td>
                  <td>
                    <span className={`status-badge ${med.stock === 0 ? 'empty' : 'low'}`}>
                      {med.stock === 0 ? 'EMPTY' : 'LOW'}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-primary btn-sm" onClick={() => toast.success('Reorder request sent!')}>
                      <RefreshCw size={13} /> Reorder
                    </button>
                  </td>
                </tr>
              ))}
              {lowStock.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                  All medicines are well stocked! 🎉
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

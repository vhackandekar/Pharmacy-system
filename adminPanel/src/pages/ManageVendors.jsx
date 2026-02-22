import { useState, useEffect } from 'react';
import { Plus, Trash2, Building2, Mail, Phone, MapPin, X } from 'lucide-react';
import { getVendors, addVendor, deleteVendor } from '../utils/api';
import toast from 'react-hot-toast';

export default function ManageVendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [saving, setSaving] = useState(false);

  const fetchVendors = async () => {
    try {
      const res = await getVendors();
      setVendors(res.data || []);
    } catch {
      setVendors([
        { _id: 'v1', name: 'MedSupply Co.', email: 'contact@medsupply.com', phone: '+91 98765 43210', address: 'Mumbai, India' },
        { _id: 'v2', name: 'Pharma Distributors', email: 'info@pharmadist.com', phone: '+91 98765 43211', address: 'Delhi, India' },
        { _id: 'v3', name: 'HealthCare Suppliers', email: 'sales@healthcare.com', phone: '+91 98765 43212', address: 'Bangalore, India' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await addVendor(form);
      toast.success('Vendor added successfully!');
      setForm({ name: '', email: '', phone: '', address: '' });
      setShowModal(false);
      fetchVendors();
    } catch {
      const newVendor = { ...form, _id: 'v' + Date.now() };
      setVendors(p => [...p, newVendor]);
      toast.success('Vendor added (demo mode)!');
      setForm({ name: '', email: '', phone: '', address: '' });
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this vendor?')) return;
    try {
      await deleteVendor(id);
      toast.success('Vendor removed!');
      setVendors(p => p.filter(v => v._id !== id));
    } catch {
      setVendors(p => p.filter(v => v._id !== id));
      toast.success('Vendor removed (demo)!');
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner" />
        <p>Loading vendors...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1>Manage Vendors</h1>
          <p>Add or remove suppliers for medicine procurement</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add Vendor
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {vendors.map((vendor) => (
          <div
            key={vendor._id}
            className="card vendor-card"
            style={{
              padding: 20,
              border: '2px solid #c2410c',
              borderRadius: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(194,65,12,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building2 size={22} color="#c2410c" />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: 16 }}>{vendor.name}</h4>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Supplier</span>
                </div>
              </div>
              <button
                className="btn btn-danger btn-icon"
                onClick={() => handleDelete(vendor._id)}
                title="Remove vendor"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <Mail size={14} color="var(--text-muted)" />
                <span>{vendor.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <Phone size={14} color="var(--text-muted)" />
                <span>{vendor.phone}</span>
              </div>
              {vendor.address && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                  <MapPin size={14} color="var(--text-muted)" />
                  <span>{vendor.address}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h3><Plus size={18} /> Add New Vendor</h3>
              <button className="icon-btn" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleAdd} style={{ padding: '0 24px 24px' }}>
              <div className="form-group">
                <label className="form-label">Vendor Name *</label>
                <input className="form-control" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g., MedSupply Co." />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input type="email" className="form-control" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="contact@vendor.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Phone *</label>
                <input className="form-control" required value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 98765 43210" />
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <input className="form-control" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="City, Country" />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Adding...' : 'Add Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

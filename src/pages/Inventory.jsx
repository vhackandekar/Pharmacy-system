import { useState, useEffect } from 'react';
import { Package, Plus, Edit, Search, X } from 'lucide-react';
import { getMedicines, addMedicine, updateMedicine } from '../utils/api';
import toast from 'react-hot-toast';

const emptyForm = { name: '', dosage: '', unitType: 'tablets', stock: '', price: '', prescriptionRequired: false };

export default function Inventory() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchMedicines = async () => {
    try {
      const res = await getMedicines();
      setMedicines(res.data || []);
    } catch {
      setMedicines([
        { _id: '1', name: 'Dolo 650', dosage: '650mg', unitType: 'tablets', stock: 100, price: 2550, prescriptionRequired: false },
        { _id: '2', name: 'Metformin', dosage: '500mg', unitType: 'tablets', stock: 50, price: 15000, prescriptionRequired: true },
        { _id: '3', name: 'Amoxicillin 500mg', dosage: '500mg', unitType: 'capsules', stock: 0, price: 8500, prescriptionRequired: true },
        { _id: '4', name: 'Lisinopril 10mg', dosage: '10mg', unitType: 'tablets', stock: 85, price: 12000, prescriptionRequired: true },
        { _id: '5', name: 'Paracetamol', dosage: '500mg', unitType: 'tablets', stock: 500, price: 1500, prescriptionRequired: false },
        { _id: '6', name: 'Omeprazole', dosage: '20mg', unitType: 'capsules', stock: 120, price: 3200, prescriptionRequired: false },
      ]);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchMedicines(); }, []);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (med) => { setEditing(med); setForm({ ...med }); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, stock: +form.stock, price: +form.price };
      if (editing) {
        await updateMedicine(editing._id, payload);
        toast.success('Medicine updated!');
      } else {
        await addMedicine(payload);
        toast.success('Medicine added!');
      }
      setShowModal(false);
      fetchMedicines();
    } catch {
      toast.error('Failed to save. Check if backend is running.');
      // Optimistic update for demo
      if (!editing) {
        setMedicines(p => [...p, { ...form, _id: Date.now().toString(), stock: +form.stock, price: +form.price }]);
      } else {
        setMedicines(p => p.map(m => m._id === editing._id ? { ...m, ...form, stock: +form.stock, price: +form.price } : m));
      }
      setShowModal(false);
    } finally { setSaving(false); }
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return 'EMPTY';
    if (stock < 100) return 'LOW';
    return 'OK';
  };

  const getStockColor = (stock) => {
    if (stock === 0) return 'var(--accent-red)';
    if (stock < 100) return 'var(--accent-orange)';
    return 'var(--accent-green)';
  };

  const filtered = medicines.filter(m => {
    const matchSearch = m.name?.toLowerCase().includes(search.toLowerCase());
    if (filter === 'low') return matchSearch && m.stock < 100;
    if (filter === 'empty') return matchSearch && m.stock === 0;
    if (filter === 'prescription') return matchSearch && m.prescriptionRequired;
    return matchSearch;
  });

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1>Inventory</h1>
          <p>Manage medicines and stock levels</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={16} /> Add Medicine
        </button>
      </div>

      <div className="filters-bar">
        <div style={{ position: 'relative', flex: 1, maxWidth: 280 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="search-input-sm"
            style={{ paddingLeft: 32, width: '100%' }}
            placeholder="Search medicines..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="filter-select" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All Medicines</option>
          <option value="low">Low Stock</option>
          <option value="empty">Out of Stock</option>
          <option value="prescription">Prescription Required</option>
        </select>
        <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 'auto' }}>
          {filtered.length} medicines
        </span>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-state"><div className="spinner" /></div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Medicine Name</th>
                <th>Dosage</th>
                <th>Unit Type</th>
                <th>Stock</th>
                <th>Price</th>
                <th>Rx Required</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(med => (
                <tr key={med._id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{med.name}</div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{med.dosage}</td>
                  <td style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{med.unitType}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ flex: 1, maxWidth: 80 }}>
                        <div className="stock-bar">
                          <div
                            className="stock-bar-fill"
                            style={{
                              width: `${Math.min((med.stock / 500) * 100, 100)}%`,
                              background: getStockColor(med.stock)
                            }}
                          />
                        </div>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: getStockColor(med.stock) }}>
                        {med.stock}
                      </span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>₹{med.price?.toLocaleString()}</td>
                  <td>
                    <span style={{
                      fontSize: 12, fontWeight: 600,
                      color: med.prescriptionRequired ? 'var(--accent-orange)' : 'var(--text-muted)'
                    }}>
                      {med.prescriptionRequired ? 'Required' : 'No'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${getStockStatus(med.stock).toLowerCase()}`}>
                      {getStockStatus(med.stock)}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary btn-sm btn-icon"
                      onClick={() => openEdit(med)}
                      title="Edit"
                    >
                      <Edit size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && filtered.length === 0 && (
          <div className="empty-state">
            <Package size={40} />
            <p>No medicines found</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editing ? 'Edit Medicine' : 'Add New Medicine'}</h3>
              <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setShowModal(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Medicine Name</label>
                  <input className="form-control" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required placeholder="e.g. Paracetamol 500mg" />
                </div>
                <div className="form-group">
                  <label className="form-label">Dosage</label>
                  <input className="form-control" value={form.dosage} onChange={e => setForm(p => ({ ...p, dosage: e.target.value }))} required placeholder="e.g. 500mg" />
                </div>
                <div className="form-group">
                  <label className="form-label">Unit Type</label>
                  <select className="form-control" value={form.unitType} onChange={e => setForm(p => ({ ...p, unitType: e.target.value }))}>
                    <option value="tablets">Tablets</option>
                    <option value="capsules">Capsules</option>
                    <option value="ml">ML</option>
                    <option value="strips">Strips</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Stock (Units)</label>
                  <input type="number" className="form-control" value={form.stock} onChange={e => setForm(p => ({ ...p, stock: e.target.value }))} required min="0" placeholder="100" />
                </div>
                <div className="form-group">
                  <label className="form-label">Price (₹ paise)</label>
                  <input type="number" className="form-control" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} required min="0" placeholder="2550" />
                </div>
              </div>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.prescriptionRequired}
                    onChange={e => setForm(p => ({ ...p, prescriptionRequired: e.target.checked }))}
                    style={{ width: 16, height: 16, accentColor: 'var(--brand)' }}
                  />
                  <span className="form-label" style={{ margin: 0 }}>Prescription Required</span>
                </label>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editing ? 'Update Medicine' : 'Add Medicine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

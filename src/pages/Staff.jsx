import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Users } from 'lucide-react';
import { getStaff, createStaff, updateStaff, deleteStaff } from '../api/client';
import { Spinner, EmptyState, Modal, ConfirmModal, StarRating } from '../components/UI';
import { useToast } from '../context/AppContext';

const ROLES = ['Senior Technician','Electrician','Plumber','Maintenance Supervisor','Pest Control Specialist','Civil Engineer','IT Technician','General Worker'];
const SPECIALIZATIONS = ['plumbing','electrical','civil','pest','hygiene','furniture','internet','security','general'];

export default function StaffPage() {
  const { addToast } = useToast();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formModal, setFormModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({ name: '', role: '', specialization: 'general', phone: '', email: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await getStaff();
      setStaff(res.data);
    } catch { addToast('Failed to load staff', 'error'); }
    setLoading(false);
  }

  function openCreate() {
    setEditingStaff(null);
    setForm({ name: '', role: '', specialization: 'general', phone: '', email: '' });
    setErrors({});
    setFormModal(true);
  }

  function openEdit(s) {
    setEditingStaff(s);
    setForm({ name: s.name, role: s.role, specialization: s.specialization || 'general', phone: s.phone || '', email: s.email || '' });
    setErrors({});
    setFormModal(true);
  }

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.role) errs.role = 'Role is required';
    setErrors(errs);
    return !Object.keys(errs).length;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      if (editingStaff) {
        await updateStaff(editingStaff.id, form);
        addToast('Staff updated', 'success');
      } else {
        await createStaff(form);
        addToast('Staff added', 'success');
      }
      setFormModal(false);
      load();
    } catch { addToast('Save failed', 'error'); }
    setSaving(false);
  }

  async function handleDelete() {
    try {
      await deleteStaff(deleteId);
      addToast('Staff deactivated', 'success');
      setDeleteId(null);
      load();
    } catch { addToast('Delete failed', 'error'); }
  }

  const specColors = { plumbing:'#06b6d4', electrical:'#f59e0b', civil:'#8b5cf6', pest:'#10b981', hygiene:'#f43f5e', furniture:'#f97316', internet:'#3b82f6', security:'#ef4444', general:'#6b7280' };

  return (
    <div className="page-content fade-in">
      <div className="page-header">
        <div>
          <h1>Staff Management</h1>
          <p>{staff.length} active maintenance staff</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={15} /> Add Staff
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><Spinner size={36} /></div>
      ) : staff.length === 0 ? (
        <EmptyState icon={<Users size={28} />} title="No staff yet" description="Add your first maintenance staff member."
          action={<button className="btn btn-primary" onClick={openCreate}><Plus size={14} />Add Staff</button>} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {staff.map(s => (
            <div key={s.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {/* Card top bar */}
              <div style={{ height: 4, background: specColors[s.specialization] || 'var(--accent)' }} />
              <div style={{ padding: '20px 22px' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div style={{
                    width: 46, height: 46, borderRadius: '50%',
                    background: `${specColors[s.specialization] || 'var(--accent)'}20`,
                    color: specColors[s.specialization] || 'var(--accent)',
                    display: 'grid', placeItems: 'center', fontSize: 20, fontWeight: 800, flexShrink: 0
                  }}>
                    {s.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }} className="truncate">{s.name}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{s.role}</div>
                  </div>
                  <div className="flex gap-1">
                    <button className="btn btn-icon btn-secondary btn-sm" onClick={() => openEdit(s)}><Edit3 size={13} /></button>
                    <button className="btn btn-icon btn-danger btn-sm" onClick={() => setDeleteId(s.id)}><Trash2 size={13} /></button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                  <span style={{ fontSize: 11.5, padding: '2px 10px', borderRadius: 'var(--radius-full)', background: `${specColors[s.specialization] || 'var(--accent)'}15`, color: specColors[s.specialization] || 'var(--accent)', fontWeight: 600, textTransform: 'capitalize' }}>
                    {s.specialization || 'General'}
                  </span>
                  {s.phone && <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>📞 {s.phone}</span>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                  {[
                    ['Assigned', s.total_assigned || 0, 'var(--accent)'],
                    ['Active', s.active_count || 0, 'var(--amber)'],
                    ['Resolved', s.resolved_count || 0, 'var(--emerald)'],
                  ].map(([label, val, color]) => (
                    <div key={label} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color }}>{val}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={formModal} onClose={() => setFormModal(false)}
        title={editingStaff ? 'Edit Staff' : 'Add Staff Member'}
        subtitle="Maintenance personnel details"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setFormModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : editingStaff ? 'Save Changes' : 'Add Staff'}
            </button>
          </>
        }
      >
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Full Name <span className="form-required">*</span></label>
            <input className="form-input" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="e.g. Rajesh Kumar" />
            {errors.name && <div className="form-error">{errors.name}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Role <span className="form-required">*</span></label>
            <select className="form-select" value={form.role} onChange={e => setForm(f => ({...f, role: e.target.value}))}>
              <option value="">Select role…</option>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            {errors.role && <div className="form-error">{errors.role}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Specialization</label>
            <select className="form-select" value={form.specialization} onChange={e => setForm(f => ({...f, specialization: e.target.value}))}>
              {SPECIALIZATIONS.map(s => <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input className="form-input" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} placeholder="10-digit number" maxLength={10} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="staff@hostel.com" />
        </div>
      </Modal>

      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Deactivate Staff" confirmText="Deactivate"
        message="This will deactivate the staff member. They will no longer appear in assignment lists." danger />
    </div>
  );
}

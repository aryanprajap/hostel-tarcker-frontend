import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Megaphone } from 'lucide-react';
import { getAnnouncements, createAnnouncement, deleteAnnouncement } from '../api/client';
import { Spinner, EmptyState, Modal, ConfirmModal, timeAgo } from '../components/UI';
import { useToast } from '../context/AppContext';

const TYPES = [
  { value: 'info', label: 'ℹ️ Info', color: 'var(--accent)' },
  { value: 'warning', label: '⚠️ Warning', color: 'var(--amber)' },
  { value: 'maintenance', label: '🔧 Maintenance', color: 'var(--purple)' },
  { value: 'urgent', label: '🚨 Urgent', color: 'var(--rose)' },
];

export default function AnnouncementsPage() {
  const { addToast } = useToast();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', type: 'info', created_by: 'Admin', expires_at: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await getAnnouncements();
      setAnnouncements(res.data);
    } catch { addToast('Failed to load announcements', 'error'); }
    setLoading(false);
  }

  function validate() {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.content.trim()) errs.content = 'Content is required';
    setErrors(errs);
    return !Object.keys(errs).length;
  }

  async function handleCreate() {
    if (!validate()) return;
    setSaving(true);
    try {
      await createAnnouncement({ ...form, expires_at: form.expires_at || undefined });
      addToast('Announcement created', 'success');
      setModal(false);
      setForm({ title: '', content: '', type: 'info', created_by: 'Admin', expires_at: '' });
      load();
    } catch { addToast('Failed to create', 'error'); }
    setSaving(false);
  }

  async function handleDelete() {
    try {
      await deleteAnnouncement(deleteId);
      addToast('Announcement deleted', 'success');
      setDeleteId(null);
      load();
    } catch { addToast('Delete failed', 'error'); }
  }

  const typeColors = { info: 'var(--accent)', warning: 'var(--amber)', maintenance: 'var(--purple)', urgent: 'var(--rose)' };
  const typeBgs = { info: 'rgba(59,130,246,0.08)', warning: 'rgba(245,158,11,0.08)', maintenance: 'rgba(139,92,246,0.08)', urgent: 'rgba(244,63,94,0.08)' };

  return (
    <div className="page-content fade-in">
      <div className="page-header">
        <div>
          <h1>Announcements</h1>
          <p>Hostel-wide notices and updates</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>
          <Plus size={15} /> New Announcement
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><Spinner size={36} /></div>
      ) : announcements.length === 0 ? (
        <EmptyState icon={<Megaphone size={28} />} title="No announcements" description="Post the first hostel announcement."
          action={<button className="btn btn-primary" onClick={() => setModal(true)}><Plus size={14} />Post Announcement</button>} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {announcements.map(a => (
            <div key={a.id} style={{
              background: typeBgs[a.type] || 'var(--bg-glass)',
              border: `1px solid ${typeColors[a.type]}30`,
              borderLeft: `4px solid ${typeColors[a.type]}`,
              borderRadius: 'var(--radius-lg)',
              padding: '18px 22px',
              display: 'flex',
              gap: 16,
              alignItems: 'flex-start',
            }}>
              <div style={{ flex: 1 }}>
                <div className="flex items-center gap-2 mb-2" style={{ flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: typeColors[a.type] }}>
                    {TYPES.find(t => t.value === a.type)?.label || a.type}
                  </span>
                  <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>by {a.created_by}</span>
                  <span style={{ fontSize: 11.5, color: 'var(--text-muted)', marginLeft: 'auto' }}>{timeAgo(a.created_at)}</span>
                  {a.expires_at && (
                    <span style={{ fontSize: 11, color: 'var(--amber)', background: 'rgba(245,158,11,0.1)', padding: '1px 8px', borderRadius: 'var(--radius-full)' }}>
                      Expires {timeAgo(a.expires_at)}
                    </span>
                  )}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{a.title}</h3>
                <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{a.content}</p>
              </div>
              <button className="btn btn-danger btn-sm btn-icon" onClick={() => setDeleteId(a.id)} style={{ flexShrink: 0 }}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="New Announcement"
        subtitle="Post a notice to all hostel residents"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleCreate} disabled={saving}>
              {saving ? 'Posting…' : 'Post Announcement'}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Type</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {TYPES.map(t => (
              <button key={t.value} onClick={() => setForm(f => ({...f, type: t.value}))}
                style={{
                  padding: '6px 14px', borderRadius: 'var(--radius-full)', border: `1px solid ${form.type === t.value ? t.color : 'var(--border)'}`,
                  background: form.type === t.value ? `${t.color}18` : 'var(--bg-glass)',
                  color: form.type === t.value ? t.color : 'var(--text-secondary)',
                  fontSize: 12.5, fontWeight: 600, cursor: 'pointer', transition: 'var(--transition)',
                }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Title <span className="form-required">*</span></label>
          <input className="form-input" value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} placeholder="e.g. Water Supply Maintenance" />
          {errors.title && <div className="form-error">{errors.title}</div>}
        </div>
        <div className="form-group">
          <label className="form-label">Content <span className="form-required">*</span></label>
          <textarea className="form-textarea" rows={4} value={form.content} onChange={e => setForm(f => ({...f, content: e.target.value}))}
            placeholder="Write the announcement details here…" />
          {errors.content && <div className="form-error">{errors.content}</div>}
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Posted By</label>
            <input className="form-input" value={form.created_by} onChange={e => setForm(f => ({...f, created_by: e.target.value}))} placeholder="Admin" />
          </div>
          <div className="form-group">
            <label className="form-label">Expiry Date (optional)</label>
            <input className="form-input" type="date" value={form.expires_at} onChange={e => setForm(f => ({...f, expires_at: e.target.value}))} />
          </div>
        </div>
      </Modal>

      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Delete Announcement" message="This announcement will be permanently deleted." confirmText="Delete" danger />
    </div>
  );
}

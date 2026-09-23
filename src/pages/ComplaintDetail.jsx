import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit3, MessageSquare, Star } from 'lucide-react';
import { getComplaint, updateComplaint, addComment, getStaff } from '../api/client';
import { StatusBadge, PriorityBadge, CategoryTag, Timeline, StarRating, Spinner, Modal, formatDate, timeAgo } from '../components/UI';
import { useToast } from '../context/AppContext';

const STATUSES = ['open','in_progress','resolved','closed','rejected'];

export default function ComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [complaint, setComplaint] = useState(null);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  const [updateModal, setUpdateModal] = useState(false);
  const [commentModal, setCommentModal] = useState(false);
  const [rateModal, setRateModal] = useState(false);

  const [updateForm, setUpdateForm] = useState({ status: '', assigned_to: '', priority: '', notes: '' });
  const [comment, setComment] = useState('');
  const [commentBy, setCommentBy] = useState('Admin');
  const [rating, setRating] = useState(0);
  const [ratingFeedback, setRatingFeedback] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, [id]);

  async function load() {
    setLoading(true);
    try {
      const [c, s] = await Promise.all([getComplaint(id), getStaff()]);
      setComplaint(c.data);
      setStaff(s.data);
      setUpdateForm({ status: c.data.status, assigned_to: c.data.assigned_to || '', priority: c.data.priority, notes: '' });
    } catch { addToast('Failed to load complaint', 'error'); navigate('/complaints'); }
    setLoading(false);
  }

  async function handleUpdate() {
    setSaving(true);
    try {
      await updateComplaint(id, {
        status: updateForm.status !== complaint.status ? updateForm.status : undefined,
        assigned_to: updateForm.assigned_to !== String(complaint.assigned_to || '') ? (updateForm.assigned_to || null) : undefined,
        priority: updateForm.priority !== complaint.priority ? updateForm.priority : undefined,
        notes: updateForm.notes || undefined,
        performed_by: 'Admin',
      });
      addToast('Complaint updated', 'success');
      setUpdateModal(false);
      load();
    } catch { addToast('Update failed', 'error'); }
    setSaving(false);
  }

  async function handleComment() {
    if (!comment.trim()) return;
    setSaving(true);
    try {
      await addComment(id, { notes: comment, performed_by: commentBy });
      addToast('Comment added', 'success');
      setCommentModal(false);
      setComment('');
      load();
    } catch { addToast('Failed to add comment', 'error'); }
    setSaving(false);
  }

  async function handleRate() {
    if (!rating) return;
    setSaving(true);
    try {
      await updateComplaint(id, { rating, feedback: ratingFeedback, performed_by: complaint.resident_name });
      addToast('Thank you for your feedback!', 'success');
      setRateModal(false);
      load();
    } catch { addToast('Rating failed', 'error'); }
    setSaving(false);
  }

  if (loading) return (
    <div className="page-content fade-in" style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
      <Spinner size={40} />
    </div>
  );
  if (!complaint) return null;

  const isResolved = ['resolved','closed'].includes(complaint.status);
  const priorityColors = { low: '#10b981', medium: '#f59e0b', high: '#f97316', critical: '#f43f5e' };

  return (
    <div className="page-content fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/complaints')}>
            <ArrowLeft size={14} /> Back
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 style={{ fontSize: 20 }}>{complaint.title}</h1>
              <StatusBadge status={complaint.status} />
              <PriorityBadge priority={complaint.priority} />
            </div>
            <span className="font-mono text-xs text-muted">{complaint.complaint_number}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={() => setCommentModal(true)}>
            <MessageSquare size={15} /> Add Comment
          </button>
          {isResolved && !complaint.rating && (
            <button className="btn btn-success" onClick={() => setRateModal(true)}>
              <Star size={15} /> Rate Resolution
            </button>
          )}
          <button className="btn btn-primary" onClick={() => setUpdateModal(true)}>
            <Edit3 size={15} /> Update Status
          </button>
        </div>
      </div>

      <div className="grid-2">
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Details Card */}
          <div className="card">
            <div className="card-header"><span className="card-title">📋 Complaint Details</span></div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div className="form-label">Description</div>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{complaint.description}</p>
              </div>
              <div className="divider" style={{ margin: '0' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  ['Resident', complaint.resident_name],
                  ['Room', complaint.room_number],
                  ['Phone', complaint.phone || '—'],
                  ['Email', complaint.email || '—'],
                  ['Category', <CategoryTag category={complaint.category} />],
                  ['Priority', <PriorityBadge priority={complaint.priority} />],
                  ['Status', <StatusBadge status={complaint.status} />],
                  ['Assigned To', complaint.assigned_name || <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>],
                  ['Filed', formatDate(complaint.created_at)],
                  ['Last Updated', timeAgo(complaint.updated_at)],
                  ...(complaint.resolved_at ? [['Resolved At', formatDate(complaint.resolved_at)]] : []),
                  ...(complaint.estimated_completion ? [['ETA', formatDate(complaint.estimated_completion)]] : []),
                ].map(([label, val]) => (
                  <div key={label}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>{label}</div>
                    <div style={{ fontSize: 13.5, fontWeight: 500 }}>{val}</div>
                  </div>
                ))}
              </div>
              {complaint.rating && (
                <>
                  <div className="divider" style={{ margin: 0 }} />
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Resident Rating</div>
                    <StarRating rating={complaint.rating} />
                    {complaint.feedback && <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6, fontStyle: 'italic' }}>"{complaint.feedback}"</p>}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Priority Card */}
          <div className="card" style={{ borderLeft: `3px solid ${priorityColors[complaint.priority]}` }}>
            <div className="card-body" style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className={`priority-dot ${complaint.priority}`} />
                <span style={{ fontSize: 13.5, fontWeight: 600, color: priorityColors[complaint.priority] }}>
                  {complaint.priority.charAt(0).toUpperCase() + complaint.priority.slice(1)} Priority
                </span>
                {complaint.priority === 'critical' && (
                  <span style={{ fontSize: 11, background: 'rgba(244,63,94,0.1)', color: 'var(--rose)', padding: '2px 8px', borderRadius: 'var(--radius-full)', marginLeft: 'auto' }}>
                    ⚠ Urgent Action Required
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column — Timeline */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">🕐 Maintenance History</span>
            <span className="text-xs text-muted">{complaint.history?.length || 0} events</span>
          </div>
          <div className="card-body">
            <Timeline history={complaint.history} />
          </div>
        </div>
      </div>

      {/* Update Modal */}
      <Modal open={updateModal} onClose={() => setUpdateModal(false)} title="Update Complaint"
        subtitle="Change status, assignment, or priority"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setUpdateModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleUpdate} disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Status</label>
          <select className="form-select" value={updateForm.status} onChange={e => setUpdateForm(f => ({ ...f, status: e.target.value }))}>
            {STATUSES.map(s => <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s.replace('_',' ')}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Assign To</label>
          <select className="form-select" value={updateForm.assigned_to} onChange={e => setUpdateForm(f => ({ ...f, assigned_to: e.target.value }))}>
            <option value="">— Unassigned —</option>
            {staff.map(s => <option key={s.id} value={s.id}>{s.name} ({s.role})</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Priority</label>
          <select className="form-select" value={updateForm.priority} onChange={e => setUpdateForm(f => ({ ...f, priority: e.target.value }))}>
            {['low','medium','high','critical'].map(p => <option key={p} value={p} style={{ textTransform: 'capitalize' }}>{p}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Notes (optional)</label>
          <textarea className="form-textarea" rows={3} placeholder="Add a note about this update…"
            value={updateForm.notes} onChange={e => setUpdateForm(f => ({ ...f, notes: e.target.value }))} />
        </div>
      </Modal>

      {/* Comment Modal */}
      <Modal open={commentModal} onClose={() => setCommentModal(false)} title="Add Comment"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setCommentModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleComment} disabled={saving || !comment.trim()}>
              {saving ? 'Adding…' : 'Add Comment'}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Your Name</label>
          <input className="form-input" value={commentBy} onChange={e => setCommentBy(e.target.value)} placeholder="e.g. Admin / Technician Name" />
        </div>
        <div className="form-group">
          <label className="form-label">Comment <span className="form-required">*</span></label>
          <textarea className="form-textarea" rows={4} placeholder="Add a comment or update about this complaint…"
            value={comment} onChange={e => setComment(e.target.value)} />
        </div>
      </Modal>

      {/* Rate Modal */}
      <Modal open={rateModal} onClose={() => setRateModal(false)} title="Rate Resolution"
        subtitle="How satisfied are you with the resolution?"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setRateModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleRate} disabled={saving || !rating}>
              {saving ? 'Submitting…' : 'Submit Rating'}
            </button>
          </>
        }
      >
        <div className="form-group" style={{ textAlign: 'center' }}>
          <label className="form-label">Your Rating</label>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', margin: '10px 0' }}>
            {[1,2,3,4,5].map(n => (
              <span key={n} onClick={() => setRating(n)}
                style={{ fontSize: 32, cursor: 'pointer', color: n <= rating ? 'var(--amber)' : 'var(--border)', transition: 'var(--transition)' }}>
                ★
              </span>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Feedback (optional)</label>
          <textarea className="form-textarea" rows={3} placeholder="Share your thoughts on how the issue was handled…"
            value={ratingFeedback} onChange={e => setRatingFeedback(e.target.value)} />
        </div>
      </Modal>
    </div>
  );
}

import React from 'react';

/* ── StatusBadge ──────────────────────────────────────────── */
export function StatusBadge({ status }) {
  const labels = {
    open: 'Open', in_progress: 'In Progress',
    resolved: 'Resolved', closed: 'Closed', rejected: 'Rejected'
  };
  return <span className={`badge badge-${status}`}>{labels[status] || status}</span>;
}

/* ── PriorityBadge ───────────────────────────────────────── */
export function PriorityBadge({ priority }) {
  return (
    <span className={`badge badge-${priority}`} style={{ textTransform: 'capitalize' }}>
      <span className={`priority-dot ${priority}`} />
      {priority}
    </span>
  );
}

/* ── CategoryIcon ────────────────────────────────────────── */
const categoryData = {
  plumbing:    { icon: '🔧', label: 'Plumbing' },
  electrical:  { icon: '⚡', label: 'Electrical' },
  civil:       { icon: '🏗️', label: 'Civil' },
  pest:        { icon: '🐛', label: 'Pest Control' },
  hygiene:     { icon: '🧹', label: 'Hygiene' },
  furniture:   { icon: '🪑', label: 'Furniture' },
  internet:    { icon: '📡', label: 'Internet' },
  security:    { icon: '🔒', label: 'Security' },
  other:       { icon: '📋', label: 'Other' },
};

export function CategoryTag({ category }) {
  const data = categoryData[category] || categoryData.other;
  return (
    <span className={`badge cat-${category}`} style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
      {data.icon} {data.label}
    </span>
  );
}

export function getCategoryLabel(cat) {
  return categoryData[cat]?.label || cat;
}
export function getCategoryIcon(cat) {
  return categoryData[cat]?.icon || '📋';
}

/* ── StarRating ──────────────────────────────────────────── */
export function StarRating({ rating, max = 5 }) {
  return (
    <div className="stars">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={`star ${i < rating ? 'filled' : ''}`}>★</span>
      ))}
    </div>
  );
}

/* ── Spinner ─────────────────────────────────────────────── */
export function Spinner({ size = 20 }) {
  return <div className="loading-spinner" style={{ width: size, height: size }} />;
}

/* ── EmptyState ──────────────────────────────────────────── */
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}

/* ── TimeAgo ─────────────────────────────────────────────── */
export function timeAgo(dateStr) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

/* ── Timeline ────────────────────────────────────────────── */
const actionLabels = {
  created: 'Complaint Created',
  assigned: 'Assigned to Staff',
  status_changed: 'Status Updated',
  commented: 'Comment Added',
  resolved: 'Marked as Resolved',
  closed: 'Complaint Closed',
  rejected: 'Complaint Rejected',
  rated: 'Resident Feedback',
};

export function Timeline({ history }) {
  if (!history?.length) return (
    <div className="text-muted" style={{ padding: '20px 0', textAlign: 'center' }}>
      No history yet.
    </div>
  );
  return (
    <div className="timeline">
      {history.map((item) => (
        <div key={item.id} className="timeline-item">
          <div className={`timeline-dot ${item.action}`} />
          <div className="timeline-time">{formatDate(item.timestamp)}</div>
          <div className="timeline-action">{actionLabels[item.action] || item.action}</div>
          <div className="timeline-by">by {item.performed_by}</div>
          {item.notes && <div className="timeline-notes">{item.notes}</div>}
        </div>
      ))}
    </div>
  );
}

/* ── Modal ───────────────────────────────────────────────── */
export function Modal({ open, onClose, title, subtitle, children, footer, size = '' }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${size}`}>
        <div className="modal-header">
          <div>
            <div className="modal-title">{title}</div>
            {subtitle && <div className="modal-subtitle">{subtitle}</div>}
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

/* ── Confirm Modal ───────────────────────────────────────── */
export function ConfirmModal({ open, onClose, onConfirm, title, message, confirmText = 'Delete', danger = true }) {
  return (
    <Modal open={open} onClose={onClose} title={title}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </>
      }
    >
      <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{message}</p>
    </Modal>
  );
}

/* ── Skeleton Loader ─────────────────────────────────────── */
export function SkeletonCard() {
  return (
    <div className="card" style={{ padding: 24 }}>
      <div className="skeleton" style={{ height: 16, width: '60%', marginBottom: 12 }} />
      <div className="skeleton" style={{ height: 12, width: '90%', marginBottom: 8 }} />
      <div className="skeleton" style={{ height: 12, width: '75%' }} />
    </div>
  );
}

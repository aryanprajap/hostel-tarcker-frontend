import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { getGlobalHistory } from '../api/client';
import { Spinner, EmptyState, formatDate } from '../components/UI';

const actionColors = {
  created: 'var(--accent)',
  assigned: 'var(--purple)',
  status_changed: 'var(--amber)',
  commented: 'var(--cyan)',
  resolved: 'var(--emerald)',
  closed: 'var(--text-muted)',
  rejected: 'var(--rose)',
  rated: 'var(--amber)',
};

const actionIcons = {
  created: '📝', assigned: '👤', status_changed: '🔄',
  commented: '💬', resolved: '✅', closed: '🔒', rejected: '❌', rated: '⭐',
};

const actionLabels = {
  created: 'Complaint Created', assigned: 'Assigned to Staff',
  status_changed: 'Status Updated', commented: 'Comment Added',
  resolved: 'Marked Resolved', closed: 'Complaint Closed',
  rejected: 'Complaint Rejected', rated: 'Resident Rated',
};

export default function MaintenanceHistory() {
  const [history, setHistory] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { load(); }, [page]);

  async function load() {
    setLoading(true);
    try {
      const res = await getGlobalHistory({ page, limit: 30 });
      setHistory(res.data.history);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  const filtered = search
    ? history.filter(h =>
        h.complaint_number?.toLowerCase().includes(search.toLowerCase()) ||
        h.complaint_title?.toLowerCase().includes(search.toLowerCase()) ||
        h.performed_by?.toLowerCase().includes(search.toLowerCase()) ||
        h.action?.toLowerCase().includes(search.toLowerCase())
      )
    : history;

  return (
    <div className="page-content fade-in">
      <div className="page-header">
        <div>
          <h1>Maintenance History</h1>
          <p>Complete audit trail of all maintenance activities</p>
        </div>
        <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '8px 16px', fontSize: 13, fontWeight: 600, color: 'var(--accent-light)' }}>
          {total} total events
        </div>
      </div>

      <div className="mb-4 search-input-wrap" style={{ maxWidth: 420 }}>
        <Search size={15} />
        <input className="form-input" placeholder="Filter by complaint, action, or person…"
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center' }}><Spinner size={36} /></div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={<span style={{ fontSize: 28 }}>📜</span>} title="No history found" description="No maintenance events match your search." />
        ) : (
          <>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Complaint</th>
                    <th>Action</th>
                    <th>Details</th>
                    <th>Performed By</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(h => (
                    <tr key={h.id}>
                      <td>
                        <span style={{ fontSize: 11.5, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {formatDate(h.timestamp)}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: 'var(--accent-light)', marginBottom: 2 }}>{h.complaint_number}</div>
                        <div style={{ fontSize: 12.5, fontWeight: 600, maxWidth: 180 }} className="truncate">{h.complaint_title}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Room {h.room_number}</div>
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px',
                          borderRadius: 'var(--radius-full)', fontSize: 12, fontWeight: 600,
                          background: `${actionColors[h.action] || 'var(--text-muted)'}18`,
                          color: actionColors[h.action] || 'var(--text-muted)',
                          border: `1px solid ${actionColors[h.action] || 'var(--border)'}30`,
                        }}>
                          {actionIcons[h.action]} {actionLabels[h.action] || h.action}
                        </span>
                      </td>
                      <td>
                        {(h.old_value || h.new_value) && (
                          <div style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            {h.old_value && <span style={{ color: 'var(--rose-light)', textDecoration: 'line-through', textTransform: 'capitalize' }}>{h.old_value}</span>}
                            {h.old_value && h.new_value && <span style={{ color: 'var(--text-muted)' }}>→</span>}
                            {h.new_value && <span style={{ color: 'var(--emerald)', textTransform: 'capitalize', fontWeight: 600 }}>{h.new_value}</span>}
                          </div>
                        )}
                      </td>
                      <td>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{h.performed_by}</span>
                      </td>
                      <td style={{ maxWidth: 220 }}>
                        {h.notes && <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }} className="truncate">{h.notes}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)' }}>
                <div className="pagination">
                  <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => (
                    <button key={i+1} className={`page-btn ${page === i+1 ? 'active' : ''}`} onClick={() => setPage(i+1)}>{i+1}</button>
                  ))}
                  <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

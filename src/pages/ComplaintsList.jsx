import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, Plus, Trash2, Eye } from 'lucide-react';
import { getComplaints, deleteComplaint, getStaff } from '../api/client';
import { StatusBadge, PriorityBadge, CategoryTag, Spinner, EmptyState, ConfirmModal, timeAgo } from '../components/UI';
import { useToast, useComplaints } from '../context/AppContext';

const CATEGORIES = ['plumbing','electrical','civil','pest','hygiene','furniture','internet','security','other'];
const PRIORITIES = ['low','medium','high','critical'];
const STATUSES   = ['open','in_progress','resolved','closed','rejected'];

export default function ComplaintsList() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { setOpenCount } = useComplaints();

  const [complaints, setComplaints] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [order, setOrder] = useState('DESC');
  const [showFilters, setShowFilters] = useState(false);

  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => { load(); }, [search, statusFilter, categoryFilter, priorityFilter, sortBy, order, page]);

  async function load() {
    setLoading(true);
    try {
      const res = await getComplaints({ search, status: statusFilter, category: categoryFilter, priority: priorityFilter, sortBy, order, page, limit: 15 });
      setComplaints(res.data.complaints);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
      const openRes = await getComplaints({ status: 'open', limit: 1 });
      setOpenCount(openRes.data.total);
    } catch (e) { addToast('Failed to load complaints', 'error'); }
    setLoading(false);
  }

  async function handleDelete() {
    try {
      await deleteComplaint(deleteId);
      addToast('Complaint deleted', 'success');
      setDeleteId(null);
      load();
    } catch { addToast('Delete failed', 'error'); }
  }

  function handleSort(field) {
    if (sortBy === field) setOrder(o => o === 'ASC' ? 'DESC' : 'ASC');
    else { setSortBy(field); setOrder('DESC'); }
  }

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>↕</span>;
    return <span style={{ color: 'var(--accent)', fontSize: 10 }}>{order === 'ASC' ? '↑' : '↓'}</span>;
  };

  function resetFilters() {
    setSearch(''); setStatusFilter(''); setCategoryFilter(''); setPriorityFilter('');
    setPage(1);
  }

  const hasFilters = search || statusFilter || categoryFilter || priorityFilter;

  return (
    <div className="page-content fade-in">
      <div className="page-header">
        <div>
          <h1>All Complaints</h1>
          <p>{total} complaint{total !== 1 ? 's' : ''} found</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={() => setShowFilters(f => !f)}>
            <SlidersHorizontal size={15} /> Filters {hasFilters && `(${[statusFilter, categoryFilter, priorityFilter, search].filter(Boolean).length})`}
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/complaints/new')}>
            <Plus size={15} /> New Complaint
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card mb-4" style={{ display: showFilters ? 'block' : 'none' }}>
        <div className="card-body" style={{ padding: 20 }}>
          <div className="form-grid">
            <div className="search-input-wrap">
              <Search size={15} />
              <input className="form-input" placeholder="Search by name, room, title…"
                value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <select className="form-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="">All Status</option>
              {STATUSES.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
            </select>
            <select className="form-select" value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}>
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c} style={{ textTransform: 'capitalize' }}>{c}</option>)}
            </select>
            <select className="form-select" value={priorityFilter} onChange={e => { setPriorityFilter(e.target.value); setPage(1); }}>
              <option value="">All Priorities</option>
              {PRIORITIES.map(p => <option key={p} value={p} style={{ textTransform: 'capitalize' }}>{p}</option>)}
            </select>
          </div>
          {hasFilters && (
            <button className="btn btn-sm btn-secondary mt-4" onClick={resetFilters}>Clear Filters</button>
          )}
        </div>
      </div>

      {/* Search bar always visible */}
      {!showFilters && (
        <div className="mb-4 search-input-wrap" style={{ maxWidth: 400 }}>
          <Search size={15} />
          <input className="form-input" placeholder="Search complaints…"
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
      )}

      {/* Table */}
      <div className="card">
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center' }}><Spinner size={36} /></div>
        ) : complaints.length === 0 ? (
          <EmptyState
            icon={<span style={{ fontSize: 28 }}>📭</span>}
            title="No complaints found"
            description={hasFilters ? "Try adjusting your filters." : "No complaints have been filed yet."}
            action={<button className="btn btn-primary" onClick={() => navigate('/complaints/new')}><Plus size={14} />File Complaint</button>}
          />
        ) : (
          <>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th className="sortable" onClick={() => handleSort('complaint_number')}>ID <SortIcon field="complaint_number" /></th>
                    <th>Title</th>
                    <th className="sortable" onClick={() => handleSort('room_number')}>Room <SortIcon field="room_number" /></th>
                    <th>Category</th>
                    <th className="sortable" onClick={() => handleSort('priority')}>Priority <SortIcon field="priority" /></th>
                    <th className="sortable" onClick={() => handleSort('status')}>Status <SortIcon field="status" /></th>
                    <th>Assigned</th>
                    <th className="sortable" onClick={() => handleSort('created_at')}>Filed <SortIcon field="created_at" /></th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map(c => (
                    <tr key={c.id}>
                      <td>
                        <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{c.complaint_number}</span>
                      </td>
                      <td style={{ maxWidth: 200 }}>
                        <div className="truncate font-bold" style={{ fontSize: 13.5 }}>{c.title}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{c.resident_name}</div>
                      </td>
                      <td><span style={{ fontWeight: 600, fontSize: 13 }}>{c.room_number}</span></td>
                      <td><CategoryTag category={c.category} /></td>
                      <td><PriorityBadge priority={c.priority} /></td>
                      <td><StatusBadge status={c.status} /></td>
                      <td>
                        {c.assigned_name
                          ? <span style={{ fontSize: 12.5 }}>{c.assigned_name}</span>
                          : <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Unassigned</span>}
                      </td>
                      <td><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{timeAgo(c.created_at)}</span></td>
                      <td>
                        <div className="flex gap-2">
                          <button className="btn btn-icon btn-secondary btn-sm" title="View" onClick={() => navigate(`/complaints/${c.id}`)}>
                            <Eye size={14} />
                          </button>
                          <button className="btn btn-icon btn-danger btn-sm" title="Delete" onClick={() => setDeleteId(c.id)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)' }}>
                <div className="pagination">
                  <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    const p = i + 1;
                    return (
                      <button key={p} className={`page-btn ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                    );
                  })}
                  <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</button>
                </div>
                <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                  Showing page {page} of {totalPages} · {total} total
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmModal
        open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Delete Complaint"
        message="Are you sure you want to permanently delete this complaint? This action cannot be undone."
        confirmText="Delete" danger
      />
    </div>
  );
}

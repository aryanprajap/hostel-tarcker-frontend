import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList, AlertTriangle, CheckCircle2, Clock,
  TrendingUp, Star, Activity, Megaphone, ArrowRight, Plus
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { getAnalyticsSummary, getAnalyticsTrends, getComplaints, getAnnouncements } from '../api/client';
import { StatusBadge, PriorityBadge, CategoryTag, Spinner, timeAgo } from '../components/UI';

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#6b7280', '#f43f5e'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px' }}>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => <p key={i} style={{ fontSize: 13, fontWeight: 600, color: p.color }}>{p.name}: {p.value}</p>)}
    </div>
  );
};

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const target = Number(value) || 0;
    if (target === 0) { setDisplay(0); return; }
    let start = 0;
    const step = Math.ceil(target / 30);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setDisplay(target); clearInterval(timer); }
      else setDisplay(start);
    }, 30);
    return () => clearInterval(timer);
  }, [value]);
  return <>{display}</>;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getAnalyticsSummary(),
      getAnalyticsTrends(14),
      getComplaints({ limit: 6, sortBy: 'created_at', order: 'DESC' }),
      getAnnouncements(),
    ]).then(([s, t, c, a]) => {
      setSummary(s.data);
      setTrends(t.data);
      setRecentComplaints(c.data.complaints);
      setAnnouncements(a.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="page-content fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <Spinner size={40} />
    </div>
  );

  const statusData = summary?.byStatus?.map(s => ({ name: s.status, value: s.count })) || [];
  const resolveRate = summary?.total > 0 ? Math.round((summary.resolved / summary.total) * 100) : 0;

  const kpis = [
    { icon: <ClipboardList size={20} />, label: 'Total Complaints', value: summary?.total || 0, color: 'blue', sub: 'All time' },
    { icon: <Clock size={20} />, label: 'Open', value: summary?.open || 0, color: 'amber', sub: 'Awaiting action' },
    { icon: <Activity size={20} />, label: 'In Progress', value: summary?.inProgress || 0, color: 'purple', sub: 'Being worked on' },
    { icon: <CheckCircle2 size={20} />, label: 'Resolved', value: summary?.resolved || 0, color: 'emerald', sub: `${resolveRate}% resolution rate` },
    { icon: <AlertTriangle size={20} />, label: 'Critical', value: summary?.critical || 0, color: 'rose', sub: 'Needs urgent attention' },
    { icon: <Star size={20} />, label: 'Avg Rating', value: summary?.avgRating ? `${summary.avgRating}★` : '—', color: 'cyan', sub: 'Resident satisfaction' },
  ];

  const annColors = { info: 'var(--accent)', warning: 'var(--amber)', maintenance: 'var(--purple)', urgent: 'var(--rose)' };

  return (
    <div className="page-content fade-in">
      <div className="page-header">
        <div>
          <h1>🏢 Dashboard</h1>
          <p>Welcome back! Here's what's happening at your hostel.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/complaints/new')}>
          <Plus size={16} /> New Complaint
        </button>
      </div>

      {/* KPI Cards */}
      <div className="stat-grid mb-6">
        {kpis.map((k) => (
          <div key={k.label} className={`stat-card ${k.color}`}>
            <div className={`stat-icon ${k.color}`}>{k.icon}</div>
            <div className="stat-value">
              {typeof k.value === 'number' ? <AnimatedNumber value={k.value} /> : k.value}
            </div>
            <div className="stat-label">{k.label}</div>
            <div className="text-xs text-muted mt-4">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid-2 mb-6">
        {/* Trend */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">📊 Activity — Last 14 Days</span>
          </div>
          <div className="card-body">
            {trends.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={trends}>
                  <defs>
                    <linearGradient id="dashGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="total" stroke="#3b82f6" fill="url(#dashGrad)" strokeWidth={2} name="Filed" />
                  <Area type="monotone" dataKey="resolved" stroke="#10b981" fill="none" strokeWidth={2} name="Resolved" strokeDasharray="5 3" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                No trend data yet
              </div>
            )}
          </div>
        </div>

        {/* Status Donut */}
        <div className="card">
          <div className="card-header"><span className="card-title">🔵 Status Breakdown</span></div>
          <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ flex: '0 0 160px' }}>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                    dataKey="value" paddingAngle={4}>
                    {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {statusData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2">
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'capitalize', flex: 1 }}>{d.name.replace('_', ' ')}</span>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{d.value}</span>
                </div>
              ))}
              {summary?.avgResolutionTime && (
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Avg Resolution</span>
                  <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--emerald)', marginLeft: 8 }}>{summary.avgResolutionTime}h</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Complaints + Announcements */}
      <div className="grid-2">
        {/* Recent Complaints */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">🔔 Recent Complaints</span>
            <button className="btn btn-sm btn-secondary" onClick={() => navigate('/complaints')}>
              View all <ArrowRight size={13} />
            </button>
          </div>
          <div className="card-body" style={{ padding: '12px 0 0' }}>
            {recentComplaints.length === 0 ? (
              <div style={{ padding: '20px 24px', color: 'var(--text-muted)', fontSize: 13 }}>
                No complaints yet. <button className="btn btn-sm btn-primary" style={{ marginLeft: 8 }} onClick={() => navigate('/complaints/new')}>File one</button>
              </div>
            ) : (
              recentComplaints.map((c, i) => (
                <div key={c.id}
                  style={{ padding: '12px 24px', borderBottom: i < recentComplaints.length - 1 ? '1px solid var(--border)' : 'none', cursor: 'pointer', transition: 'var(--transition)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-glass)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  onClick={() => navigate(`/complaints/${c.id}`)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)' }}>{c.complaint_number}</span>
                    <StatusBadge status={c.status} />
                    <PriorityBadge priority={c.priority} />
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 13.5, marginBottom: 2 }} className="truncate">{c.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Room {c.room_number} · {c.resident_name} · {timeAgo(c.created_at)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Announcements */}
        <div className="card">
          <div className="card-header">
            <span className="card-title"><Megaphone size={16} style={{ display: 'inline', marginRight: 6 }} />Announcements</span>
            <button className="btn btn-sm btn-secondary" onClick={() => navigate('/announcements')}>
              Manage <ArrowRight size={13} />
            </button>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '16px 24px 24px' }}>
            {announcements.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No active announcements.</div>
            ) : (
              announcements.slice(0, 4).map(a => (
                <div key={a.id} className={`announcement-card ${a.type}`}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: annColors[a.type] || 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {a.type}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>{timeAgo(a.created_at)}</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{a.title}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{a.content}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  ClipboardList, AlertTriangle, CheckCircle2, Clock,
  TrendingUp, Star, Zap, Users
} from 'lucide-react';
import { getAnalyticsSummary, getAnalyticsTrends, getResolutionTime } from '../api/client';
import { Spinner, EmptyState, getCategoryIcon } from '../components/UI';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4', '#f97316', '#6b7280'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', boxShadow: 'var(--shadow-md)' }}>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ fontSize: 13, fontWeight: 600, color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [resolution, setResolution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trendDays, setTrendDays] = useState(30);

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    getAnalyticsTrends(trendDays).then(r => setTrends(r.data));
  }, [trendDays]);

  async function loadAll() {
    setLoading(true);
    try {
      const [s, t, r] = await Promise.all([
        getAnalyticsSummary(), getAnalyticsTrends(trendDays), getResolutionTime()
      ]);
      setSummary(s.data);
      setTrends(t.data);
      setResolution(r.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  if (loading) return (
    <div className="page-content fade-in">
      <div className="page-header"><h1>Analytics</h1></div>
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner size={40} /></div>
    </div>
  );

  const statusData = summary?.byStatus?.map(s => ({
    name: s.status.replace('_', ' '), value: s.count
  })) || [];

  const categoryData = summary?.byCategory?.map(c => ({
    name: `${getCategoryIcon(c.category)} ${c.category}`, total: c.count, resolved: c.resolved
  })) || [];

  const priorityData = summary?.byPriority?.map(p => ({
    name: p.priority, count: p.count
  })) || [];

  const resolutionData = resolution?.byCategory?.map(c => ({
    name: c.category, hours: c.avg_hours, count: c.count
  })) || [];

  const kpis = [
    { icon: <ClipboardList size={20} />, label: 'Total Complaints', value: summary?.total || 0, color: 'blue' },
    { icon: <Clock size={20} />, label: 'Open / Pending', value: (summary?.open || 0) + (summary?.inProgress || 0), color: 'amber' },
    { icon: <CheckCircle2 size={20} />, label: 'Resolved', value: summary?.resolved || 0, color: 'emerald' },
    { icon: <AlertTriangle size={20} />, label: 'Critical Active', value: summary?.critical || 0, color: 'rose' },
    { icon: <Clock size={20} />, label: 'Avg. Resolution', value: summary?.avgResolutionTime ? `${summary.avgResolutionTime}h` : '—', color: 'purple' },
    { icon: <Star size={20} />, label: 'Avg. Rating', value: summary?.avgRating ? `${summary.avgRating}/5` : '—', color: 'cyan' },
  ];

  return (
    <div className="page-content fade-in">
      <div className="page-header">
        <div>
          <h1>Analytics</h1>
          <p>Comprehensive maintenance performance insights</p>
        </div>
        <div className="flex gap-2">
          {[7, 14, 30, 60].map(d => (
            <button key={d} className={`btn btn-sm ${trendDays === d ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setTrendDays(d)}>{d}d</button>
          ))}
        </div>
      </div>

      {/* KPI Row */}
      <div className="stat-grid mb-6">
        {kpis.map((k) => (
          <div key={k.label} className={`stat-card ${k.color}`}>
            <div className={`stat-icon ${k.color}`}>{k.icon}</div>
            <div className="stat-value">{k.value}</div>
            <div className="stat-label">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Trend Chart */}
      <div className="card mb-6">
        <div className="card-header">
          <span className="card-title">📈 Complaint Trends — Last {trendDays} Days</span>
        </div>
        <div className="card-body">
          {trends.length === 0 ? (
            <EmptyState icon={<TrendingUp size={28} />} title="No trend data" description="No complaints filed in this period." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="resolvedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="total" stroke="#3b82f6" fill="url(#totalGrad)" strokeWidth={2} name="Filed" />
                <Area type="monotone" dataKey="resolved" stroke="#10b981" fill="url(#resolvedGrad)" strokeWidth={2} name="Resolved" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid-2 mb-6">
        {/* By Category */}
        <div className="card">
          <div className="card-header"><span className="card-title">📂 Complaints by Category</span></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total" fill="#3b82f6" name="Total" radius={[0,4,4,0]} />
                <Bar dataKey="resolved" fill="#10b981" name="Resolved" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Donut */}
        <div className="card">
          <div className="card-header"><span className="card-title">🟢 Status Distribution</span></div>
          <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <ResponsiveContainer width="55%" height={200}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                  dataKey="value" paddingAngle={3}>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {statusData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2">
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'capitalize', flex: 1 }}>{d.name}</span>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Resolution Time */}
      {resolutionData.length > 0 && (
        <div className="card mb-6">
          <div className="card-header"><span className="card-title">⏱️ Average Resolution Time by Category (hours)</span></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={resolutionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="hours" name="Avg Hours" radius={[4,4,0,0]}>
                  {resolutionData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent Resolved */}
      {resolution?.recentResolved?.length > 0 && (
        <div className="card">
          <div className="card-header"><span className="card-title">✅ Recently Resolved</span></div>
          <div className="card-body" style={{ padding: '0 24px 20px' }}>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Number</th><th>Title</th><th>Category</th><th>Priority</th><th>Resolved In</th>
                  </tr>
                </thead>
                <tbody>
                  {resolution.recentResolved.map(r => (
                    <tr key={r.complaint_number}>
                      <td className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{r.complaint_number}</td>
                      <td style={{ maxWidth: 220 }} className="truncate">{r.title}</td>
                      <td style={{ textTransform: 'capitalize' }}>{r.category}</td>
                      <td style={{ textTransform: 'capitalize', color: r.priority === 'critical' ? 'var(--rose)' : r.priority === 'high' ? 'var(--priority-high)' : 'inherit' }}>{r.priority}</td>
                      <td><span style={{ fontWeight: 700, color: 'var(--emerald)' }}>{r.hours_to_resolve}h</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { Settings, Building2, Database, Palette, Bell } from 'lucide-react';
import { useTheme } from '../context/AppContext';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="page-content fade-in">
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p>Configure your hostel tracker preferences</p>
        </div>
      </div>

      <div style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Hostel Info */}
        <div className="card">
          <div className="card-header"><span className="card-title"><Building2 size={16} style={{ display: 'inline', marginRight: 6 }} />Hostel Information</span></div>
          <div className="card-body">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Hostel Name</label>
                <input className="form-input" defaultValue="Sunrise Student Hostel" />
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input className="form-input" defaultValue="Bangalore, Karnataka" />
              </div>
              <div className="form-group">
                <label className="form-label">Contact Email</label>
                <input className="form-input" type="email" defaultValue="admin@hostel.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Contact Phone</label>
                <input className="form-input" defaultValue="+91 98765 43210" />
              </div>
            </div>
            <button className="btn btn-primary btn-sm">Save Changes</button>
          </div>
        </div>

        {/* Appearance */}
        <div className="card">
          <div className="card-header"><span className="card-title"><Palette size={16} style={{ display: 'inline', marginRight: 6 }} />Appearance</span></div>
          <div className="card-body">
            <div className="flex items-center justify-between" style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Theme</div>
                <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>Currently using {theme} mode</div>
              </div>
              <button className="btn btn-secondary" onClick={toggleTheme}>
                {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
              </button>
            </div>
            <div className="flex items-center justify-between" style={{ padding: '12px 0' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Compact Table View</div>
                <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>Show more rows with less padding</div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <div style={{ width: 44, height: 24, borderRadius: 12, background: 'var(--border)', position: 'relative', transition: 'var(--transition)' }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: 3, transition: 'var(--transition)' }} />
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Database */}
        <div className="card">
          <div className="card-header"><span className="card-title"><Database size={16} style={{ display: 'inline', marginRight: 6 }} />Database</span></div>
          <div className="card-body">
            <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '14px 18px', marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Database Engine</div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>SQLite (sql.js) · hostel_tracker.db</div>
              <div style={{ fontSize: 12, color: 'var(--emerald)', marginTop: 4 }}>✓ Connected &amp; Operational</div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary btn-sm">📊 View DB Stats</button>
              <button className="btn btn-secondary btn-sm">⬇️ Export Data (CSV)</button>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="card">
          <div className="card-header"><span className="card-title">ℹ️ About</span></div>
          <div className="card-body">
            <div style={{ display: 'grid', gap: 10 }}>
              {[
                ['Application', 'HostelTrack — Complaint & Maintenance System'],
                ['Version', '1.0.0'],
                ['Frontend', 'React 18 + Vite'],
                ['Backend', 'Node.js + Express'],
                ['Database', 'SQLite via sql.js'],
                ['Charts', 'Recharts'],
              ].map(([label, val]) => (
                <div key={label} className="flex gap-4 items-center">
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 110 }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

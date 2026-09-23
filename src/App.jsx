import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import ComplaintsList from './pages/ComplaintsList';
import NewComplaint from './pages/NewComplaint';
import ComplaintDetail from './pages/ComplaintDetail';
import MaintenanceHistory from './pages/MaintenanceHistory';
import Analytics from './pages/Analytics';
import Staff from './pages/Staff';
import Announcements from './pages/Announcements';
import Settings from './pages/Settings';
import ShieldLogo from './components/ShieldLogo';
import { LogOut, User, Shield, Wrench } from 'lucide-react';

const pageTitles = {
  '/': { title: 'Dashboard', sub: 'Overview of your hostel' },
  '/complaints': { title: 'All Complaints', sub: 'Browse and manage complaints' },
  '/complaints/new': { title: 'New Complaint', sub: 'File a maintenance request' },
  '/history': { title: 'Maintenance History', sub: 'Full audit trail' },
  '/analytics': { title: 'Analytics', sub: 'Performance insights' },
  '/staff': { title: 'Staff', sub: 'Manage maintenance personnel' },
  '/announcements': { title: 'Announcements', sub: 'Hostel-wide notices' },
  '/settings': { title: 'Settings', sub: 'Configure your preferences' },
};

function Header() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const key = Object.keys(pageTitles).find(k => k !== '/' && location.pathname.startsWith(k)) || '/';
  const info = pageTitles[location.pathname] || pageTitles[key] || { title: 'HostelTrack', sub: '' };

  const getRoleIcon = (role) => {
    if (role === 'admin') return <Shield size={12} />;
    if (role === 'staff') return <Wrench size={12} />;
    return <User size={12} />;
  };

  const getRoleBadgeStyle = (role) => {
    if (role === 'admin') return { color: 'var(--purple-light)', background: 'rgba(139, 92, 246, 0.15)' };
    if (role === 'staff') return { color: 'var(--emerald-light)', background: 'rgba(16, 185, 129, 0.15)' };
    return { color: 'var(--accent-light)', background: 'rgba(59, 130, 246, 0.15)' };
  };

  return (
    <header className="header">
      <div className="header-title">
        <h2>{info.title}</h2>
        {info.sub && <p>{info.sub}</p>}
      </div>
      <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* API Connected Status Badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '6px 12px', borderRadius: 'var(--radius-full)',
          background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
          fontSize: 12, fontWeight: 600, color: 'var(--emerald)'
        }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--emerald)', display: 'inline-block', animation: 'pulse-dot 2s infinite' }} />
          Neon DB
        </div>

        {/* User Profile Pill & Logout */}
        {user && (
          <div className="user-profile-pill">
            <div className="user-avatar-circle">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="user-info-text">
              <span className="user-display-name">{user.name}</span>
              <span
                className="user-role-tag"
                style={{
                  ...getRoleBadgeStyle(user.role),
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                  padding: '1px 6px',
                  borderRadius: 4
                }}
              >
                {getRoleIcon(user.role)}
                {user.role} {user.room_number ? `(${user.room_number})` : ''}
              </span>
            </div>
            <button
              type="button"
              className="logout-icon-btn"
              onClick={logout}
              title="Sign Out"
            >
              <LogOut size={15} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

function MainLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        gap: 16
      }}>
        <ShieldLogo size={56} />
        <div className="auth-spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: 13.5, fontWeight: 600, letterSpacing: '0.02em' }}>
          HostelTrack • Shield of Trust
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/complaints" element={<ComplaintsList />} />
          <Route path="/complaints/new" element={<NewComplaint />} />
          <Route path="/complaints/:id" element={<ComplaintDetail />} />
          <Route path="/history" element={<MaintenanceHistory />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <MainLayout />
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

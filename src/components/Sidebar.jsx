import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, ClipboardList, PlusCircle, History,
  BarChart3, Users, Megaphone, Settings, Moon, Sun,
  LogOut
} from 'lucide-react';
import { useTheme, useComplaints } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import ShieldLogo from './ShieldLogo';

const navItems = [
  {
    section: 'Overview', links: [
      { to: '/', icon: <LayoutDashboard size={17} />, label: 'Dashboard' },
      { to: '/analytics', icon: <BarChart3 size={17} />, label: 'Analytics' },
    ]
  },
  {
    section: 'Complaints', links: [
      { to: '/complaints', icon: <ClipboardList size={17} />, label: 'All Complaints', badge: true },
      { to: '/complaints/new', icon: <PlusCircle size={17} />, label: 'New Complaint' },
    ]
  },
  {
    section: 'Management', links: [
      { to: '/history', icon: <History size={17} />, label: 'Maintenance History' },
      { to: '/staff', icon: <Users size={17} />, label: 'Staff' },
      { to: '/announcements', icon: <Megaphone size={17} />, label: 'Announcements' },
      { to: '/settings', icon: <Settings size={17} />, label: 'Settings' },
    ]
  },
];

export default function Sidebar() {
  const { theme, toggleTheme } = useTheme();
  const { openCount } = useComplaints();
  const { user, logout } = useAuth();

  const getRoleBadge = (role) => {
    if (role === 'admin') return <span style={{ color: 'var(--purple-light)', fontSize: 11, fontWeight: 700 }}>Admin</span>;
    if (role === 'staff') return <span style={{ color: 'var(--emerald-light)', fontSize: 11, fontWeight: 700 }}>Staff</span>;
    return <span style={{ color: 'var(--accent-light)', fontSize: 11, fontWeight: 700 }}>Resident</span>;
  };

  return (
    <nav className="sidebar">
      <div className="sidebar-logo" style={{ padding: '16px 14px' }}>
        <ShieldLogo size={38} showText={true} subtitle="Protected & resolved" />
      </div>

      <div className="sidebar-nav">
        {navItems.map(section => (
          <div key={section.section}>
            <div className="nav-section-label">{section.section}</div>
            {section.links.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >
                {link.icon}
                <span>{link.label}</span>
                {link.badge && openCount > 0 && (
                  <span className="nav-badge">{openCount}</span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        {user && (
          <div className="sidebar-user-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
              <div className="user-avatar-circle" style={{ width: 28, height: 28, fontSize: 12 }}>
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div style={{ minWidth: 0, overflow: 'hidden' }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {user.name}
                </div>
                <div>{getRoleBadge(user.role)} {user.room_number ? <span style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>• {user.room_number}</span> : null}</div>
              </div>
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

        <button className="sidebar-theme-btn" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>
    </nav>
  );
}

import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, ClipboardList, PlusCircle, History,
    BarChart3, Users, Megaphone, Settings, Moon, Sun
} from 'lucide-react';
import { useTheme } from '../context/AppContext';
import { useComplaints } from '../context/AppContext';
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
    const location = useLocation();

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
                <button className="sidebar-theme-btn" onClick={toggleTheme}>
                    {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
                    <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
            </div>
        </nav>
    );
}

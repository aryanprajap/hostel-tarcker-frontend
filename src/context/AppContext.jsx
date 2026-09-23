import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ─── Theme Context ─────────────────────────────────────────────────────────────
const ThemeContext = createContext(null);
export const useTheme = () => useContext(ThemeContext);

// ─── Toast Context ─────────────────────────────────────────────────────────────
const ToastContext = createContext(null);
export const useToast = () => useContext(ToastContext);

// ─── Complaint Context ─────────────────────────────────────────────────────────
const ComplaintContext = createContext(null);
export const useComplaints = () => useContext(ComplaintContext);

// ─── Combined Provider ─────────────────────────────────────────────────────────
export function AppProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('ht-theme') || 'dark');
  const [toasts, setToasts] = useState([]);
  const [openCount, setOpenCount] = useState(0);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ht-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <ToastContext.Provider value={{ addToast }}>
        <ComplaintContext.Provider value={{ openCount, setOpenCount }}>
          {children}
          <ToastContainer toasts={toasts} />
        </ComplaintContext.Provider>
      </ToastContext.Provider>
    </ThemeContext.Provider>
  );
}

function ToastContainer({ toasts }) {
  const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span className="toast-icon" style={{ color: t.type === 'success' ? 'var(--emerald)' : t.type === 'error' ? 'var(--rose)' : t.type === 'warning' ? 'var(--amber)' : 'var(--accent)' }}>
            {icons[t.type]}
          </span>
          <span className="toast-message">{t.message}</span>
        </div>
      ))}
    </div>
  );
}

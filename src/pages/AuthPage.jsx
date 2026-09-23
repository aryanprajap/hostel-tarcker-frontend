import React, { useState } from 'react';
import {
  Lock, User, Mail, Phone, Home, Shield, Wrench,
  ArrowRight, Eye, EyeOff, Sparkles, CheckCircle2, AlertCircle,
  Sun, Moon, KeyRound, UserCheck
} from 'lucide-react';
import ShieldLogo from '../components/ShieldLogo';
import { useAuth } from '../context/AuthContext';
import { useTheme, useToast } from '../context/AppContext';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('resident');
  const [roomNumber, setRoomNumber] = useState('');
  const [phone, setPhone] = useState('');

  const { login, register } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { addToast } = useToast();

  const handleDemoLogin = async (demoUser, demoPass) => {
    setErrorMsg('');
    setLoading(true);
    try {
      await login(demoUser, demoPass);
      addToast(`Welcome back, ${demoUser}!`, 'success');
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (isLogin) {
      if (!identifier.trim() || !password) {
        setErrorMsg('Please enter both username/email and password.');
        return;
      }

      setLoading(true);
      try {
        const loggedUser = await login(identifier.trim(), password);
        addToast(`Welcome back, ${loggedUser.name}!`, 'success');
      } catch (err) {
        setErrorMsg(err.response?.data?.error || 'Login failed. Please check credentials.');
      } finally {
        setLoading(false);
      }
    } else {
      // Validation for Sign Up
      if (!username.trim() || !email.trim() || !password || !name.trim()) {
        setErrorMsg('Please fill in all required fields (Username, Full Name, Email, Password).');
        return;
      }

      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters long.');
        return;
      }

      if (role === 'resident' && !roomNumber.trim()) {
        setErrorMsg('Please enter your room number (e.g. A-101).');
        return;
      }

      setLoading(true);
      try {
        const newUser = await register({
          username: username.trim(),
          email: email.trim(),
          password,
          name: name.trim(),
          role,
          room_number: role === 'resident' ? roomNumber.trim() : null,
          phone: phone.trim() || null
        });
        addToast(`Account created! Welcome, ${newUser.name}!`, 'success');
      } catch (err) {
        setErrorMsg(err.response?.data?.error || 'Registration failed. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="auth-container">
      {/* Background Animated Glows */}
      <div className="auth-glow auth-glow-1" />
      <div className="auth-glow auth-glow-2" />
      <div className="auth-glow auth-glow-3" />

      {/* Top Bar with Theme Toggle */}
      <div className="auth-top-bar">
        <div className="auth-brand-chip">
          <ShieldLogo size={22} />
          <span>HostelTrack • Shield of Trust</span>
        </div>
        <button
          type="button"
          className="auth-theme-btn"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </div>

      {/* Main Glass Card */}
      <div className="auth-card">
        {/* Card Header with Shield of Trust Logo */}
        <div className="auth-header">
          <div style={{ marginBottom: 14, display: 'flex', justifyContent: 'center' }}>
            <ShieldLogo size={58} />
          </div>
          <h2>{isLogin ? 'Sign in to HostelTrack' : 'Create an Account'}</h2>
          <p style={{ color: 'var(--accent-light)', fontWeight: 600, fontSize: 13, marginBottom: 4 }}>
            Shield of Trust • Protected & Resolved
          </p>
          <p>
            {isLogin
              ? 'Real-time complaint tracking & hostel maintenance portal'
              : 'Join your hostel community to report and track issues'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(true); setErrorMsg(''); }}
          >
            <KeyRound size={15} />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            className={`auth-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(false); setErrorMsg(''); }}
          >
            <UserCheck size={15} />
            <span>Sign Up</span>
          </button>
        </div>

        {/* Demo Accounts Bar (Login Only) */}
        {isLogin && (
          <div className="demo-accounts-box">
            <div className="demo-title">
              <Sparkles size={13} />
              <span>Quick 1-Click Demo Logins:</span>
            </div>
            <div className="demo-chips">
              <button
                type="button"
                className="demo-chip admin"
                disabled={loading}
                onClick={() => handleDemoLogin('admin', 'admin123')}
              >
                <Shield size={13} />
                <span>Admin Warden</span>
              </button>
              <button
                type="button"
                className="demo-chip resident"
                disabled={loading}
                onClick={() => handleDemoLogin('arjun', 'password123')}
              >
                <User size={13} />
                <span>Resident (Arjun)</span>
              </button>
              <button
                type="button"
                className="demo-chip staff"
                disabled={loading}
                onClick={() => handleDemoLogin('rajesh', 'password123')}
              >
                <Wrench size={13} />
                <span>Staff (Rajesh)</span>
              </button>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="auth-error-banner">
            <AlertCircle size={17} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {isLogin ? (
            /* ── Sign In Fields ── */
            <>
              <div className="auth-input-group">
                <label>Username or Email</label>
                <div className="auth-input-wrapper">
                  <User size={17} className="auth-field-icon" />
                  <input
                    type="text"
                    placeholder="e.g. admin or arjun@hostel.com"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label>Password</label>
                <div className="auth-input-wrapper">
                  <Lock size={17} className="auth-field-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="auth-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* ── Sign Up Fields ── */
            <>
              {/* Role Selection */}
              <div className="auth-input-group">
                <label>I am registering as:</label>
                <div className="role-selector-grid">
                  <button
                    type="button"
                    className={`role-option-card ${role === 'resident' ? 'selected' : ''}`}
                    onClick={() => setRole('resident')}
                  >
                    <div className="role-icon-box">🎓</div>
                    <div className="role-label">Resident</div>
                    <div className="role-sub">Student / Hosteller</div>
                  </button>
                  <button
                    type="button"
                    className={`role-option-card ${role === 'staff' ? 'selected' : ''}`}
                    onClick={() => setRole('staff')}
                  >
                    <div className="role-icon-box">🛠️</div>
                    <div className="role-label">Staff</div>
                    <div className="role-sub">Maintenance Team</div>
                  </button>
                  <button
                    type="button"
                    className={`role-option-card ${role === 'admin' ? 'selected' : ''}`}
                    onClick={() => setRole('admin')}
                  >
                    <div className="role-icon-box">🛡️</div>
                    <div className="role-label">Warden</div>
                    <div className="role-sub">Administration</div>
                  </button>
                </div>
              </div>

              <div className="auth-row-2">
                <div className="auth-input-group">
                  <label>Username *</label>
                  <div className="auth-input-wrapper">
                    <User size={17} className="auth-field-icon" />
                    <input
                      type="text"
                      placeholder="e.g. rahul_99"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label>Full Name *</label>
                  <div className="auth-input-wrapper">
                    <CheckCircle2 size={17} className="auth-field-icon" />
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="auth-input-group">
                <label>Email Address *</label>
                <div className="auth-input-wrapper">
                  <Mail size={17} className="auth-field-icon" />
                  <input
                    type="email"
                    placeholder="e.g. rahul@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label>Password * (min 6 chars)</label>
                <div className="auth-input-wrapper">
                  <Lock size={17} className="auth-field-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="auth-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="auth-row-2">
                {role === 'resident' && (
                  <div className="auth-input-group">
                    <label>Room Number *</label>
                    <div className="auth-input-wrapper">
                      <Home size={17} className="auth-field-icon" />
                      <input
                        type="text"
                        placeholder="e.g. B-302"
                        value={roomNumber}
                        onChange={(e) => setRoomNumber(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="auth-input-group" style={{ gridColumn: role !== 'resident' ? 'span 2' : 'auto' }}>
                  <label>Phone Number (Optional)</label>
                  <div className="auth-input-wrapper">
                    <Phone size={17} className="auth-field-icon" />
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Submit Button */}
          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? (
              <span className="auth-spinner" />
            ) : (
              <>
                <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        {/* Footer Toggle */}
        <div className="auth-footer-toggle">
          {isLogin ? (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                className="auth-link-btn"
                onClick={() => { setIsLogin(false); setErrorMsg(''); }}
              >
                Sign up here
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                className="auth-link-btn"
                onClick={() => { setIsLogin(true); setErrorMsg(''); }}
              >
                Sign in here
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

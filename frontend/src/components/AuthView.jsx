import React, { useState } from 'react';
import { api, setAuthToken } from '../services/api';

export default function AuthView({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('VIEWER');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLogin) {
        const data = await api.auth.login({ email, password });
        setAuthToken(data.token);
        onAuthSuccess(data.user, data.token);
      } else {
        const data = await api.auth.register({ name, email, password, role });
        setSuccess('Registration successful! You can now log in.');
        setIsLogin(true);
        // Pre-fill email for login convenience
        setPassword('');
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to autofill credentials for demo convenience
  const autofillDemo = (selectedRole) => {
    setIsLogin(true);
    setError('');
    setSuccess('');
    
    // We assume default seeds exist. In the seed data:
    // admin@example.com (role: ADMIN)
    // analyst@example.com (role: ANALYST)
    // viewer@example.com (role: VIEWER)
    // Default seed password for all is typically "password123"
    setPassword('password123');
    if (selectedRole === 'ADMIN') {
      setEmail('admin@example.com');
    } else if (selectedRole === 'ANALYST') {
      setEmail('analyst@example.com');
    } else {
      setEmail('viewer@example.com');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="brand-logo mb-2">FINANCE CONTROL</div>
          <h2 className="auth-title">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="auth-subtitle">
            {isLogin ? 'Log in to manage your financial dashboards' : 'Sign up to start tracking transactions'}
          </p>
        </div>

        {error && <div className="alert alert-error mb-2">{error}</div>}
        {success && <div className="alert alert-success mb-2">{success}</div>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Default Role (For Demo Purposes)</label>
              <select
                className="form-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="VIEWER">VIEWER (Read-only summary & basic table)</option>
                <option value="ANALYST">ANALYST (Read-only plus Charts and Trends)</option>
                <option value="ADMIN">ADMIN (Full create, edit, delete, user controls)</option>
              </select>
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Processing...' : isLogin ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
          </span>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setSuccess('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              cursor: 'pointer',
              fontWeight: 600,
              textDecoration: 'underline',
            }}
          >
            {isLogin ? 'Register Here' : 'Login Here'}
          </button>
        </div>

        {isLogin && (
          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '0.75rem', textAlign: 'center' }}>
              Autofill Seed Accounts (Demo)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              <button onClick={() => autofillDemo('ADMIN')} className="btn btn-secondary btn-sm">ADMIN</button>
              <button onClick={() => autofillDemo('ANALYST')} className="btn btn-secondary btn-sm">ANALYST</button>
              <button onClick={() => autofillDemo('VIEWER')} className="btn btn-secondary btn-sm">VIEWER</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

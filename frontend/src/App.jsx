import React, { useState, useEffect } from 'react';
import { api, setAuthToken } from './services/api';
import AuthView from './components/AuthView';
import DashboardView from './components/DashboardView';
import TransactionsView from './components/TransactionsView';
import UserManagementView from './components/UserManagementView';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // Fetch user profile from backend using the stored token
      const profile = await api.users.getMe();
      setUser(profile);
    } catch (err) {
      console.error('Failed to verify token', err);
      // Clear invalid token
      setAuthToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleAuthSuccess = (authenticatedUser) => {
    setUser(authenticatedUser);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setAuthToken(null);
    setUser(null);
    setActiveTab('dashboard');
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '100vh', background: 'var(--bg-main)', flexDirection: 'column', gap: '1rem' }}>
        <div className="brand-logo" style={{ fontSize: '2rem' }}>FINANCE CONTROL</div>
        <div className="brand-badge">Initializing Secure Ledger Session...</div>
      </div>
    );
  }

  // If user is not authenticated, render login/registration form
  if (!user) {
    return <AuthView onAuthSuccess={handleAuthSuccess} />;
  }

  const isAdmin = user.role === 'ADMIN';

  return (
    <div className="app-container">
      {/* Shared Navigation Header */}
      <header className="app-header">
        <div className="brand-section">
          <div className="brand-logo">FINANCE CONTROL</div>
          <span className="brand-badge">SECURE LEDGER</span>
        </div>

        <nav className="nav-links">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`nav-button ${activeTab === 'dashboard' ? 'active' : ''}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`nav-button ${activeTab === 'transactions' ? 'active' : ''}`}
          >
            Transactions
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab('users')}
              className={`nav-button ${activeTab === 'users' ? 'active' : ''}`}
            >
              User Management
            </button>
          )}
        </nav>

        <div className="user-profile-widget">
          <div className="user-info">
            <span className="user-name">{user.name}</span>
            <span className={`user-role-badge ${
              user.role === 'ADMIN' ? 'role-admin' : user.role === 'ANALYST' ? 'role-analyst' : 'role-viewer'
            }`}>
              {user.role}
            </span>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary btn-sm" style={{ padding: '0.45rem 0.9rem' }}>
            Log Out
          </button>
        </div>
      </header>

      {/* Main Screen Content Router */}
      <main className="main-content">
        {activeTab === 'dashboard' && <DashboardView user={user} />}
        {activeTab === 'transactions' && <TransactionsView user={user} />}
        {activeTab === 'users' && isAdmin && <UserManagementView currentUser={user} />}
      </main>
    </div>
  );
}

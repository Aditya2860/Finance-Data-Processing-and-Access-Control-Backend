import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function UserManagementView({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isAdmin = currentUser.role === 'ADMIN';

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.users.listAll();
      setUsers(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch user directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, []);

  const handleUpdateRole = async (userId, newRole) => {
    setError('');
    try {
      await api.users.update(userId, { role: newRole });
      // Update local state directly to be reactive and clean
      setUsers(prev =>
        prev.map(u => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      setError(err.message || 'Failed to update user role.');
    }
  };

  const handleToggleActive = async (userId, currentActive) => {
    if (userId === currentUser.id) {
      setError('You cannot deactivate your own account.');
      return;
    }

    setError('');
    const nextActive = !currentActive;
    try {
      await api.users.update(userId, { isActive: nextActive });
      setUsers(prev =>
        prev.map(u => (u.id === userId ? { ...u, isActive: nextActive } : u))
      );
    } catch (err) {
      setError(err.message || 'Failed to update account active status.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (userId === currentUser.id) {
      setError('You cannot delete your own account.');
      return;
    }

    if (!window.confirm('Are you sure you want to permanently delete this user? All their associated records will remain but they will lose access.')) {
      return;
    }

    setError('');
    try {
      await api.users.delete(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      setError(err.message || 'Failed to delete user.');
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex-center empty-state" style={{ flexDirection: 'column', height: '300px' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔒 Access Denied</div>
        <p style={{ maxWidth: '360px' }}>
          User Management is an administrative action. Your current role is <strong>{currentUser.role}</strong>.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3">
        <h1 style={{ fontSize: '2rem', margin: 0, fontFamily: 'var(--font-heading)' }}>User Administration</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Manage user permissions, toggle account activation states, or remove accounts.
        </p>
      </div>

      {error && <div className="alert alert-error mb-3">{error}</div>}

      <div className="glass-card">
        {loading ? (
          <div className="flex-center empty-state">Loading user directory...</div>
        ) : (
          <div className="table-wrapper">
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isSelf = u.id === currentUser.id;
                  return (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 600 }}>
                        {u.name} {isSelf && <span className="brand-badge" style={{ fontSize: '0.55rem' }}>YOU</span>}
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                      <td>
                        <select
                          className="form-select"
                          style={{ width: '130px', padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
                          value={u.role}
                          onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                        >
                          <option value="VIEWER">VIEWER</option>
                          <option value="ANALYST">ANALYST</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>
                      <td>
                        <label className="switch-label">
                          <input
                            type="checkbox"
                            className="switch-input"
                            checked={u.isActive}
                            disabled={isSelf}
                            onChange={() => handleToggleActive(u.id, u.isActive)}
                          />
                          <span className="switch-slider"></span>
                          <span style={{ fontSize: '0.8rem', color: u.isActive ? 'var(--success)' : 'var(--text-muted)' }}>
                            {u.isActive ? 'Active' : 'Suspended'}
                          </span>
                        </label>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {new Date(u.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          disabled={isSelf}
                          className="btn btn-danger btn-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

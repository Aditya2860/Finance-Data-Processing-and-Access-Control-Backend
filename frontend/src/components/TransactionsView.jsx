import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function TransactionsView({ user }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  
  // Filtering states
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    from: '',
    to: '',
    page: 1,
    limit: 10,
  });

  // Modal forms states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  
  // Transaction fields state
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('EXPENSE');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  
  const isAdmin = user.role === 'ADMIN';

  const fetchRecords = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.records.list(filters);
      setRecords(data.records || []);
      setPagination(data.pagination || { page: 1, totalPages: 1 });
    } catch (err) {
      setError(err.message || 'Failed to fetch transaction records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 })); // Reset to page 1 on filter change
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      category: '',
      from: '',
      to: '',
      page: 1,
      limit: 10,
    });
  };

  const resetFormFields = () => {
    setAmount('');
    setType('EXPENSE');
    setCategory('');
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setError('');
  };

  const handleOpenAddModal = () => {
    resetFormFields();
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (record) => {
    setSelectedRecord(record);
    setAmount(record.amount);
    setType(record.type);
    setCategory(record.category);
    // Parse date into YYYY-MM-DD
    const formattedDate = new Date(record.date).toISOString().split('T')[0];
    setDate(formattedDate);
    setNotes(record.notes || '');
    setError('');
    setIsEditModalOpen(true);
  };

  const handleCreateRecord = async (e) => {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Amount must be a positive number');
      return;
    }

    try {
      await api.records.create({
        amount: parsedAmount,
        type,
        category,
        date,
        notes: notes || undefined,
      });
      setIsAddModalOpen(false);
      resetFormFields();
      fetchRecords();
    } catch (err) {
      setError(err.message || 'Failed to create transaction record.');
    }
  };

  const handleUpdateRecord = async (e) => {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Amount must be a positive number');
      return;
    }

    try {
      await api.records.update(selectedRecord.id, {
        amount: parsedAmount,
        type,
        category,
        date,
        notes: notes || undefined,
      });
      setIsEditModalOpen(false);
      resetFormFields();
      fetchRecords();
    } catch (err) {
      setError(err.message || 'Failed to update transaction record.');
    }
  };

  const handleDeleteRecord = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction record?')) {
      return;
    }

    setError('');
    try {
      await api.records.delete(id);
      fetchRecords();
    } catch (err) {
      setError(err.message || 'Failed to delete transaction record.');
    }
  };

  return (
    <div>
      <div className="flex-between mb-3" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', margin: 0, fontFamily: 'var(--font-heading)' }}>Transaction Records</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            List, filter, and manage income and expense ledger entries.
          </p>
        </div>

        {isAdmin && (
          <button onClick={handleOpenAddModal} className="btn btn-primary">
            + Add Transaction
          </button>
        )}
      </div>

      {error && <div className="alert alert-error mb-3">{error}</div>}

      {/* Filters Form Panel */}
      <div className="glass-card mb-3">
        <div className="filters-container">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Type</label>
            <select
              name="type"
              className="form-select"
              value={filters.type}
              onChange={handleFilterChange}
            >
              <option value="">All Types</option>
              <option value="INCOME">Income Only</option>
              <option value="EXPENSE">Expense Only</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Category</label>
            <input
              type="text"
              name="category"
              className="form-input"
              placeholder="e.g. Salary, Utilities"
              value={filters.category}
              onChange={handleFilterChange}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">From Date</label>
            <input
              type="date"
              name="from"
              className="form-input"
              value={filters.from}
              onChange={handleFilterChange}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">To Date</label>
            <input
              type="date"
              name="to"
              className="form-input"
              value={filters.to}
              onChange={handleFilterChange}
            />
          </div>

          <button onClick={clearFilters} className="btn btn-secondary" style={{ height: '44px' }}>
            Reset Filters
          </button>
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="glass-card">
        {loading ? (
          <div className="flex-center empty-state">Loading transactions...</div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="glass-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Creator</th>
                    <th>Notes</th>
                    {isAdmin && <th style={{ textAlign: 'right' }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {records.length > 0 ? (
                    records.map((r) => (
                      <tr key={r.id}>
                        <td>
                          <span className={`badge ${r.type === 'INCOME' ? 'badge-income' : 'badge-expense'}`}>
                            {r.type}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>{r.category}</td>
                        <td style={{ fontWeight: 600, color: r.type === 'INCOME' ? 'var(--success)' : 'var(--danger)' }}>
                          ${r.amount.toFixed(2)}
                        </td>
                        <td>{new Date(r.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{r.user?.name || 'Unknown'}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          {r.notes || '—'}
                        </td>
                        {isAdmin && (
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                              <button onClick={() => handleOpenEditModal(r)} className="btn btn-secondary btn-sm">
                                Edit
                              </button>
                              <button onClick={() => handleDeleteRecord(r.id)} className="btn btn-danger btn-sm">
                                Delete
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={isAdmin ? 7 : 6} className="empty-state">
                        No transactions match the filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="pagination-controls">
                <span className="pagination-text">
                  Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong>
                </span>
                <div className="pagination-buttons">
                  <button
                    onClick={() => handlePageChange(filters.page - 1)}
                    disabled={filters.page <= 1}
                    className="btn btn-secondary btn-sm"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(filters.page + 1)}
                    disabled={filters.page >= pagination.totalPages}
                    className="btn btn-secondary btn-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Transaction Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">Create Transaction Entry</h2>
            {error && <div className="alert alert-error mb-2">{error}</div>}
            
            <form onSubmit={handleCreateRecord}>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="EXPENSE">EXPENSE (Outgoing)</option>
                  <option value="INCOME">INCOME (Incoming)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="form-input"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Rent, Dining, Salary"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Notes (Optional)</label>
                <textarea
                  className="form-input"
                  style={{ height: '70px', resize: 'vertical' }}
                  placeholder="Additional details..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">Edit Transaction Entry</h2>
            {error && <div className="alert alert-error mb-2">{error}</div>}
            
            <form onSubmit={handleUpdateRecord}>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="EXPENSE">EXPENSE (Outgoing)</option>
                  <option value="INCOME">INCOME (Incoming)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="form-input"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Category name"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Notes (Optional)</label>
                <textarea
                  className="form-input"
                  style={{ height: '70px', resize: 'vertical' }}
                  placeholder="Additional details..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

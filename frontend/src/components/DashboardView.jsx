import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function DashboardView({ user }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ from: '', to: '' });
  const [summary, setSummary] = useState(null);
  const [recent, setRecent] = useState([]);
  const [categories, setCategories] = useState({ all: [], income: [], expenses: [] });
  const [trends, setTrends] = useState([]);

  // Check if role is allowed to see advanced analytics
  const hasAnalyticsAccess = ['ADMIN', 'ANALYST'].includes(user.role);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      if (hasAnalyticsAccess) {
        // ADMIN & ANALYST: can call getFull
        const data = await api.dashboard.getFull(filters);
        setSummary(data.summary);
        setCategories(data.categories || { all: [], income: [], expenses: [] });
        setTrends(data.trends?.trends || []);
        setRecent(data.recentActivity?.records || []);
      } else {
        // VIEWER: can only call summary and recent
        const [summaryData, recentData] = await Promise.all([
          api.dashboard.getSummary(filters),
          api.dashboard.getRecent(5),
        ]);
        setSummary(summaryData);
        setRecent(recentData.records || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ from: '', to: '' });
  };

  if (loading && !summary) {
    return <div className="flex-center" style={{ height: '300px' }}><div className="brand-badge">Loading Dashboard Analytics...</div></div>;
  }

  // Calculate coordinates for SVG trends chart
  const renderTrendsSVG = () => {
    if (!trends || trends.length === 0) {
      return (
        <div className="empty-state">No trend data available for the period.</div>
      );
    }

    const svgWidth = 600;
    const svgHeight = 220;
    const padding = 40;
    const chartWidth = svgWidth - padding * 2;
    const chartHeight = svgHeight - padding * 2;

    // Find max value to scale chart
    const maxVal = Math.max(
      ...trends.map(t => Math.max(t.income, t.expenses, 100))
    ) * 1.1; // Add 10% headroom

    const getX = (index) => padding + (index * (chartWidth / (trends.length - 1 || 1)));
    const getY = (val) => svgHeight - padding - (val * (chartHeight / maxVal));

    // Generate path points
    let incomePoints = '';
    let expensePoints = '';

    trends.forEach((t, i) => {
      const x = getX(i);
      const yInc = getY(t.income);
      const yExp = getY(t.expenses);
      incomePoints += `${i === 0 ? 'M' : 'L'} ${x} ${yInc} `;
      expensePoints += `${i === 0 ? 'M' : 'L'} ${x} ${yExp} `;
    });

    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="xMidYMid meet">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = padding + chartHeight * ratio;
          const val = (maxVal * (1 - ratio)).toFixed(0);
          return (
            <g key={i} opacity="0.15">
              <line x1={padding} y1={y} x2={svgWidth - padding} y2={y} stroke="var(--text-secondary)" strokeWidth="1" strokeDasharray="4 4" />
              <text x={padding - 8} y={y + 4} fill="var(--text-secondary)" fontSize="10" textAnchor="end">${val}</text>
            </g>
          );
        })}

        {/* X Axis Labels */}
        {trends.map((t, i) => {
          const x = getX(i);
          return (
            <text key={i} x={x} y={svgHeight - padding + 16} fill="var(--text-muted)" fontSize="9" textAnchor="middle" transform={`rotate(15, ${x}, ${svgHeight - padding + 16})`}>
              {t.label}
            </text>
          );
        })}

        {/* Trends lines */}
        {trends.length > 1 && (
          <>
            {/* Income Area */}
            <path
              d={`${incomePoints} L ${getX(trends.length - 1)} ${svgHeight - padding} L ${getX(0)} ${svgHeight - padding} Z`}
              fill="url(#incomeGrad)"
              opacity="0.06"
            />
            {/* Expense Area */}
            <path
              d={`${expensePoints} L ${getX(trends.length - 1)} ${svgHeight - padding} L ${getX(0)} ${svgHeight - padding} Z`}
              fill="url(#expenseGrad)"
              opacity="0.06"
            />

            {/* Income Line */}
            <path d={incomePoints} fill="none" stroke="var(--success)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            {/* Expense Line */}
            <path d={expensePoints} fill="none" stroke="var(--danger)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}

        {/* Points circles */}
        {trends.map((t, i) => {
          const x = getX(i);
          return (
            <g key={i}>
              <circle cx={x} cy={getY(t.income)} r="4" fill="var(--bg-main)" stroke="var(--success)" strokeWidth="2.5" />
              <circle cx={x} cy={getY(t.expenses)} r="4" fill="var(--bg-main)" stroke="var(--danger)" strokeWidth="2.5" />
            </g>
          );
        })}

        {/* Gradients */}
        <defs>
          <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--success)" />
            <stop offset="100%" stopColor="var(--success)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--danger)" />
            <stop offset="100%" stopColor="var(--danger)" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    );
  };

  return (
    <div>
      <div className="flex-between mb-3" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', margin: 0, fontFamily: 'var(--font-heading)' }}>Dashboard Overview</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Real-time insights on incomes, expenses, and role access.
          </p>
        </div>

        {/* Filters */}
        <div className="glass-card" style={{ padding: '0.75rem 1.25rem' }}>
          <div className="flex-center" style={{ gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>DATE RANGE:</span>
            <input
              type="date"
              name="from"
              className="form-input"
              style={{ width: '135px', padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
              value={filters.from}
              onChange={handleFilterChange}
            />
            <span style={{ color: 'var(--text-muted)' }}>to</span>
            <input
              type="date"
              name="to"
              className="form-input"
              style={{ width: '135px', padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
              value={filters.to}
              onChange={handleFilterChange}
            />
            {(filters.from || filters.to) && (
              <button onClick={clearFilters} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem 0.6rem' }}>
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {error && <div className="alert alert-error mb-3">{error}</div>}

      {/* Metric Cards */}
      {summary && (
        <div className="summary-grid">
          <div className="glass-card metric-card income">
            <span className="metric-label">Total Income</span>
            <span className="metric-value" style={{ color: 'var(--success)' }}>
              ${summary.totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="metric-subtext">{summary.incomeCount} incoming entries</span>
          </div>

          <div className="glass-card metric-card expense">
            <span className="metric-label">Total Expenses</span>
            <span className="metric-value" style={{ color: 'var(--danger)' }}>
              ${summary.totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="metric-subtext">{summary.expenseCount} outgoing entries</span>
          </div>

          <div className="glass-card metric-card balance">
            <span className="metric-label">Net Balance</span>
            <span className="metric-value" style={{ color: summary.netBalance >= 0 ? 'var(--text-primary)' : 'var(--danger)' }}>
              ${summary.netBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="metric-subtext" style={{ textTransform: 'capitalize' }}>
              Condition: <strong style={{ color: summary.netBalance >= 0 ? 'var(--success)' : 'var(--danger)' }}>{summary.status}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Main dashboard visualization area */}
      <div className="dashboard-grid">
        {/* Trends (Only ADMIN & ANALYST) */}
        <div className="glass-card chart-card">
          <div className="card-title">
            <span>Monthly Trends</span>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
              <span className="flex-center" style={{ gap: '0.25rem' }}><span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }}></span> Income</span>
              <span className="flex-center" style={{ gap: '0.25rem' }}><span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--danger)' }}></span> Expense</span>
            </div>
          </div>
          {hasAnalyticsAccess ? (
            <div className="svg-chart-container">
              {renderTrendsSVG()}
            </div>
          ) : (
            <div className="flex-center empty-state" style={{ flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ fontSize: '1.5rem' }}>🔒 Restricted</div>
              <p style={{ maxWidth: '300px', fontSize: '0.85rem' }}>
                Your current role (<strong>{user.role}</strong>) does not have access to Trends and Advanced Analytics. Please contact an admin to upgrade your role.
              </p>
            </div>
          )}
        </div>

        {/* Category Breakdown (Only ADMIN & ANALYST) */}
        <div className="glass-card chart-card" style={{ minHeight: 'auto' }}>
          <div className="card-title">Category Breakdown</div>
          {hasAnalyticsAccess ? (
            <div className="category-progress-container">
              {categories.all && categories.all.length > 0 ? (
                categories.all.map((c, i) => (
                  <div key={i} className="category-row">
                    <div className="category-labels">
                      <span className="category-name">{c.category}</span>
                      <span className="category-stats">
                        ${c.total.toLocaleString()} ({c.percentage}%)
                      </span>
                    </div>
                    <div className="progress-bar-bg">
                      <div
                        className={`progress-bar-fill ${c.type === 'INCOME' ? 'progress-income' : 'progress-expense'}`}
                        style={{ width: `${c.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">No category metrics found.</div>
              )}
            </div>
          ) : (
            <div className="flex-center empty-state" style={{ flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ fontSize: '1.5rem' }}>🔒 Restricted</div>
              <p style={{ maxWidth: '240px', fontSize: '0.85rem' }}>
                Category percentages require <strong>ANALYST</strong> or <strong>ADMIN</strong> permissions.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity Table (Available to ALL roles) */}
      <div className="glass-card">
        <div className="card-title">Recent Activity</div>
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
              </tr>
            </thead>
            <tbody>
              {recent && recent.length > 0 ? (
                recent.map((r, i) => (
                  <tr key={r.id || i}>
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
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.notes || '—'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="empty-state">No recent records available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats } from '../services/api';
import { getStatusBadgeClass, getPriorityBadgeClass, formatDate } from '../components/ComplaintCard';

const BAR_COLORS = {
  open: '#2980b9',
  in_progress: '#e67e22',
  escalated: '#c0392b',
  resolved: '#27ae60',
  closed: '#7f8c8d',
  assigned: '#8e44ad',
  pending: '#d68910',
};

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch(() => setError('Failed to load dashboard data. Please make sure the backend is running.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <span>Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  const chartData = [
    { key: 'open', label: 'Open', value: stats.open, color: BAR_COLORS.open },
    { key: 'assigned', label: 'Assigned', value: stats.assigned, color: BAR_COLORS.assigned },
    { key: 'in_progress', label: 'In Progress', value: stats.in_progress, color: BAR_COLORS.in_progress },
    { key: 'pending', label: 'Pending', value: stats.pending_customer_response, color: BAR_COLORS.pending },
    { key: 'escalated', label: 'Escalated', value: stats.escalated, color: BAR_COLORS.escalated },
    { key: 'resolved', label: 'Resolved', value: stats.resolved, color: BAR_COLORS.resolved },
    { key: 'closed', label: 'Closed', value: stats.closed, color: BAR_COLORS.closed },
  ];

  const maxVal = Math.max(...chartData.map(d => d.value), 1);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-subtitle">Overview of all customer complaints</div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/complaints/register')}>
          + Register Complaint
        </button>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-label">Total Complaints</div>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat-card open">
          <div className="stat-label">Open</div>
          <div className="stat-value">{stats.open}</div>
        </div>
        <div className="stat-card inprogress">
          <div className="stat-label">In Progress</div>
          <div className="stat-value">{stats.in_progress}</div>
        </div>
        <div className="stat-card escalated">
          <div className="stat-label">Escalated</div>
          <div className="stat-value">{stats.escalated}</div>
        </div>
        <div className="stat-card resolved">
          <div className="stat-label">Resolved</div>
          <div className="stat-value">{stats.resolved}</div>
        </div>
      </div>

      {/* Status Distribution Chart */}
      <div className="card mb-4" style={{ marginBottom: '24px' }}>
        <div className="section-title">Status Distribution</div>
        <div className="bar-chart">
          {chartData.map(item => (
            <div className="bar-item" key={item.key}>
              <div className="bar-count">{item.value}</div>
              <div
                className="bar"
                style={{
                  height: `${Math.max((item.value / maxVal) * 90, item.value > 0 ? 8 : 0)}px`,
                  background: item.color,
                }}
              />
              <div className="bar-label">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Complaints Table */}
      <div className="card">
        <div className="section-title" style={{ justifyContent: 'space-between' }}>
          <span>Recent Complaints</span>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => navigate('/complaints')}
          >
            View All
          </button>
        </div>
        {stats.recent_complaints && stats.recent_complaints.length > 0 ? (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Complaint #</th>
                  <th>Customer</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_complaints.map(c => (
                  <tr
                    key={c.complaint_id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/complaints/${c.complaint_id}`)}
                  >
                    <td className="font-mono" style={{ color: '#c0392b', fontWeight: 600 }}>
                      {c.complaint_number}
                    </td>
                    <td>{c.customer_name}</td>
                    <td>{c.category}</td>
                    <td>
                      <span className={`badge ${getPriorityBadgeClass(c.priority)}`}>
                        {c.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(c.status)}`}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatDate(c.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">&#128196;</div>
            <div className="empty-state-title">No complaints yet</div>
            <p className="text-muted">Register the first complaint to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;

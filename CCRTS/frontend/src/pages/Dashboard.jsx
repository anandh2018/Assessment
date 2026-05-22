import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats, getAnalyticsSummary, getAnalyticsCategories, getAnalyticsAgents, runETL } from '../services/api';
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
  const [analytics, setAnalytics] = useState(null);
  const [categories, setCategories] = useState([]);
  const [agents, setAgents] = useState([]);
  const [etlLoading, setEtlLoading] = useState(false);
  const [etlMsg, setEtlMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch(() => setError('Failed to load dashboard data. Please make sure the backend is running.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    Promise.all([getAnalyticsSummary(), getAnalyticsCategories(), getAnalyticsAgents()])
      .then(([summary, cats, agts]) => {
        setAnalytics(summary);
        setCategories(cats);
        setAgents(agts);
      })
      .catch(() => {}); // Analytics may be empty initially
  }, []);

  const handleRunETL = () => {
    setEtlLoading(true);
    setEtlMsg('');
    runETL()
      .then(result => {
        setEtlMsg(`ETL complete: ${result.records_processed} records processed.`);
        return Promise.all([getAnalyticsSummary(), getAnalyticsCategories(), getAnalyticsAgents()]);
      })
      .then(([summary, cats, agts]) => {
        setAnalytics(summary);
        setCategories(cats);
        setAgents(agts);
      })
      .catch(() => setEtlMsg('ETL failed. Make sure the backend is running.'))
      .finally(() => setEtlLoading(false));
  };

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

      {/* ETL Analytics Section */}
      <div className="card mb-4" style={{ marginBottom: '24px', border: '2px solid #2980b9' }}>
        <div className="section-title" style={{ justifyContent: 'space-between', display: 'flex', alignItems: 'center' }}>
          <span>ETL Analytics Pipeline</span>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleRunETL}
            disabled={etlLoading}
          >
            {etlLoading ? 'Running...' : 'Run ETL Pipeline'}
          </button>
        </div>
        {etlMsg && <div className="alert" style={{ marginBottom: '12px', padding: '8px 12px', background: '#eaf4fb', borderRadius: '6px', color: '#2980b9' }}>{etlMsg}</div>}
        {analytics && (
          <div className="stats-grid" style={{ marginBottom: '16px' }}>
            <div className="stat-card total"><div className="stat-label">ETL Records</div><div className="stat-value">{analytics.total_records}</div></div>
            <div className="stat-card escalated"><div className="stat-label">SLA Breaches</div><div className="stat-value">{analytics.sla_breached}</div></div>
            <div className="stat-card resolved"><div className="stat-label">Resolved</div><div className="stat-value">{analytics.resolved_count}</div></div>
            <div className="stat-card open"><div className="stat-label">Breach Rate</div><div className="stat-value">{analytics.breach_rate}%</div></div>
          </div>
        )}
        {categories.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontWeight: 600, marginBottom: '8px', color: '#2c3e50' }}>Category Analysis</div>
            {categories.map(c => (
              <div key={c.category} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <div style={{ width: '160px', fontSize: '13px', color: '#555' }}>{c.category}</div>
                <div style={{ flex: 1, background: '#eee', borderRadius: '4px', height: '18px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min((c.total_count / 40) * 100, 100)}%`, background: '#2980b9', height: '100%', borderRadius: '4px', transition: 'width 0.4s' }} />
                </div>
                <div style={{ width: '30px', textAlign: 'right', fontSize: '13px', fontWeight: 600 }}>{c.total_count}</div>
                <div style={{ width: '80px', fontSize: '12px', color: '#c0392b' }}>{c.sla_breach_count} breaches</div>
              </div>
            ))}
          </div>
        )}
        {agents.length > 0 && (
          <div>
            <div style={{ fontWeight: 600, marginBottom: '8px', color: '#2c3e50' }}>Agent Performance</div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Agent</th><th>Assigned</th><th>Resolved</th><th>Avg Hours</th><th>SLA Breaches</th>
                  </tr>
                </thead>
                <tbody>
                  {agents.map(a => (
                    <tr key={a.agent_name}>
                      <td>{a.agent_name}</td>
                      <td>{a.total_assigned}</td>
                      <td>{a.resolved_count}</td>
                      <td>{a.avg_resolution_hours}</td>
                      <td style={{ color: a.sla_breach_count > 0 ? '#c0392b' : '#27ae60' }}>{a.sla_breach_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
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

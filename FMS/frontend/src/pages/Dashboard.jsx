import { useState, useEffect } from 'react';
import API from '../api';

const RATING_LABELS = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Very Good', 5: 'Excellent' };

function RatingBadge({ rating }) {
  return (
    <span className={`rating-badge rating-${rating}`}>
      {'⭐'.repeat(rating)} {rating}/5
    </span>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await API.get('/dashboard');
      setStats(res.data);
    } catch (err) {
      setError('Failed to load dashboard data. Make sure the backend is running on port 8001.');
    } finally {
      setLoading(false);
    }
  };

  const maxCount = stats
    ? Math.max(...Object.values(stats.rating_distribution).map(Number), 1)
    : 1;

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!stats) return null;

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>

      {/* Summary Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Feedback</h3>
          <div className="stat-value">{stats.total_count}</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#43a047' }}>
          <h3>Average Rating</h3>
          <div className="stat-value" style={{ color: '#43a047' }}>
            {stats.average_rating.toFixed(1)}<span style={{ fontSize: '1rem', color: '#999' }}> / 5</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Rating Distribution */}
        <div className="card">
          <div className="section-header">Rating Distribution</div>
          <div className="rating-distribution">
            {[5, 4, 3, 2, 1].map((r) => {
              const count = stats.rating_distribution[String(r)] || 0;
              const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
              return (
                <div key={r} className="rating-bar-row">
                  <div className="rating-label">
                    <span className={`rating-badge rating-${r}`}>{r} ⭐</span>
                  </div>
                  <div className="rating-bar-bg">
                    <div
                      className="rating-bar-fill"
                      style={{
                        width: `${pct}%`,
                        background: r >= 4 ? '#43a047' : r === 3 ? '#fb8c00' : '#e53935',
                      }}
                    />
                  </div>
                  <div className="rating-bar-count">{count}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rating labels summary */}
        <div className="card">
          <div className="section-header">Rating Summary</div>
          {[5, 4, 3, 2, 1].map((r) => (
            <div key={r} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <span style={{ fontWeight: 600, color: '#555' }}>{RATING_LABELS[r]}</span>
              <span className={`rating-badge rating-${r}`}>
                {stats.rating_distribution[String(r)] || 0} responses
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Feedback */}
      <div className="card">
        <div className="section-header">Recent Feedback (Last 5)</div>
        {stats.recent_feedback.length === 0 ? (
          <p style={{ color: '#888', textAlign: 'center', padding: '1rem' }}>No feedback submitted yet.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Participant</th>
                  <th>Program</th>
                  <th>Rating</th>
                  <th>Comments</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_feedback.map((fb) => (
                  <tr key={fb.feedback_id}>
                    <td style={{ fontWeight: 600 }}>{fb.participant_name}</td>
                    <td>{fb.program_name}</td>
                    <td><RatingBadge rating={fb.rating} /></td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {fb.comments || <span style={{ color: '#bbb' }}>—</span>}
                    </td>
                    <td>{formatDate(fb.submitted_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

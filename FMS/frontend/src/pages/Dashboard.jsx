import { useState, useEffect } from 'react';
import API from '../api';
import { getAnalyticsSummary, getAnalyticsPrograms, getAnalyticsRatings, runETL } from '../api';

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
  const [analytics, setAnalytics] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [etlLoading, setEtlLoading] = useState(false);
  const [etlMsg, setEtlMsg] = useState('');

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

  useEffect(() => {
    Promise.all([getAnalyticsSummary(), getAnalyticsPrograms(), getAnalyticsRatings()])
      .then(([s, p, r]) => { setAnalytics(s); setPrograms(p); setRatings(r); })
      .catch(() => {});
  }, []);

  const handleRunETL = () => {
    setEtlLoading(true);
    setEtlMsg('');
    runETL()
      .then(res => {
        setEtlMsg(`ETL complete: ${res.records_processed} records processed.`);
        return Promise.all([getAnalyticsSummary(), getAnalyticsPrograms(), getAnalyticsRatings()]);
      })
      .then(([s, p, r]) => { setAnalytics(s); setPrograms(p); setRatings(r); })
      .catch(() => setEtlMsg('ETL failed. Ensure backend is running.'))
      .finally(() => setEtlLoading(false));
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

      {/* ETL Analytics */}
      <div style={{ background: '#fff', borderRadius: '10px', padding: '20px', marginTop: '24px', border: '2px solid #4361ee', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ margin: 0, color: '#2c3e50' }}>ETL Analytics Pipeline</h3>
          <button onClick={handleRunETL} disabled={etlLoading} style={{ background: '#4361ee', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 18px', cursor: 'pointer', fontWeight: 600 }}>
            {etlLoading ? 'Running...' : 'Run ETL'}
          </button>
        </div>
        {etlMsg && <div style={{ padding: '8px 12px', background: '#eef2ff', borderRadius: '6px', color: '#4361ee', marginBottom: '12px', fontSize: '14px' }}>{etlMsg}</div>}
        {analytics && analytics.total_records > 0 && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
              {[
                { label: 'Total Records', value: analytics.total_records, color: '#4361ee' },
                { label: 'Avg Rating', value: analytics.avg_rating + ' / 5', color: '#2ecc71' },
                { label: 'Positive (4-5★)', value: analytics.positive_count, color: '#27ae60' },
                { label: 'Negative (1-2★)', value: analytics.negative_count, color: '#e74c3c' },
              ].map(s => (
                <div key={s.label} style={{ background: '#f8f9fa', borderRadius: '8px', padding: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>{s.label}</div>
                </div>
              ))}
            </div>
            {ratings.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontWeight: 600, marginBottom: '10px', color: '#2c3e50' }}>Rating Distribution</div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', height: '80px' }}>
                  {ratings.map(r => (
                    <div key={r.rating} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 600 }}>{r.count}</div>
                      <div style={{ width: '100%', background: r.rating >= 4 ? '#2ecc71' : r.rating === 3 ? '#f39c12' : '#e74c3c', height: `${Math.max(r.percentage, 4)}px`, borderRadius: '3px 3px 0 0', transition: 'height 0.4s' }} />
                      <div style={{ fontSize: '11px', color: '#666' }}>{r.rating}★</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {programs.length > 0 && (
              <div>
                <div style={{ fontWeight: 600, marginBottom: '10px', color: '#2c3e50' }}>Program Performance</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #eee' }}>
                      <th style={{ textAlign: 'left', padding: '6px 8px' }}>Program</th>
                      <th style={{ textAlign: 'center', padding: '6px 8px' }}>Responses</th>
                      <th style={{ textAlign: 'center', padding: '6px 8px' }}>Avg Rating</th>
                      <th style={{ textAlign: 'center', padding: '6px 8px' }}>Positive</th>
                    </tr>
                  </thead>
                  <tbody>
                    {programs.map(p => (
                      <tr key={p.program_name} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '6px 8px' }}>{p.program_name}</td>
                        <td style={{ textAlign: 'center', padding: '6px 8px' }}>{p.total_count}</td>
                        <td style={{ textAlign: 'center', padding: '6px 8px', color: p.avg_rating >= 4 ? '#27ae60' : p.avg_rating >= 3 ? '#f39c12' : '#e74c3c', fontWeight: 600 }}>{p.avg_rating}</td>
                        <td style={{ textAlign: 'center', padding: '6px 8px' }}>{p.positive_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
        {(!analytics || analytics.total_records === 0) && !etlLoading && (
          <div style={{ textAlign: 'center', color: '#999', padding: '20px 0', fontSize: '14px' }}>No ETL data loaded yet. Click "Run ETL" to process the dataset.</div>
        )}
      </div>
    </div>
  );
}

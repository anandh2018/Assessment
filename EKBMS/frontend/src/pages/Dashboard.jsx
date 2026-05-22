import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getArticles, getCategories, getKBAnalyticsSummary, getKBAnalyticsCategories, getKBTopArticles, getKBAuthors, runKBETL } from '../services/api'

export default function Dashboard() {
  const [articles, setArticles] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const [kbAnalytics, setKbAnalytics] = useState(null)
  const [kbCategoryStats, setKbCategoryStats] = useState([])
  const [topArticles, setTopArticles] = useState([])
  const [etlLoading, setEtlLoading] = useState(false)
  const [etlMsg, setEtlMsg] = useState('')

  useEffect(() => {
    Promise.all([getArticles(), getCategories()])
      .then(([arts, cats]) => {
        setArticles(arts)
        setCategories(cats)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    Promise.all([getKBAnalyticsSummary(), getKBAnalyticsCategories(), getKBTopArticles()])
      .then(([s, c, t]) => { setKbAnalytics(s); setKbCategoryStats(c); setTopArticles(t); })
      .catch(() => {});
  }, []);

  const handleRunETL = () => {
    setEtlLoading(true);
    setEtlMsg('');
    runKBETL()
      .then(res => {
        setEtlMsg(`ETL complete: ${res.records_processed} records processed.`);
        return Promise.all([getKBAnalyticsSummary(), getKBAnalyticsCategories(), getKBTopArticles()]);
      })
      .then(([s, c, t]) => { setKbAnalytics(s); setKbCategoryStats(c); setTopArticles(t); })
      .catch(() => setEtlMsg('ETL failed. Ensure backend is running.'))
      .finally(() => setEtlLoading(false));
  };

  if (loading) return <div className="loader">Loading dashboard...</div>

  const total    = articles.length
  const approved = articles.filter(a => a.status === 'Approved').length
  const pending  = articles.filter(a => a.status === 'Pending Approval').length
  const archived = articles.filter(a => a.status === 'Archived').length
  const rejected = articles.filter(a => a.status === 'Rejected').length

  const mostViewed = [...articles]
    .sort((a, b) => b.view_count - a.view_count)
    .slice(0, 5)

  const recent = [...articles]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5)

  const catBreakdown = categories.map(cat => ({
    name: cat.category_name,
    count: articles.filter(a => a.category_id === cat.category_id).length,
  })).filter(c => c.count > 0).sort((a, b) => b.count - a.count)

  const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  const STATUS_CLASS = {
    'Draft': 'badge-draft',
    'Pending Approval': 'badge-pending',
    'Approved': 'badge-approved',
    'Rejected': 'badge-rejected',
    'Archived': 'badge-archived',
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <button className="btn btn-primary" onClick={() => navigate('/articles/create')}>
          + New Article
        </button>
      </div>

      {/* Stats */}
      <div className="stat-cards">
        <div className="stat-card">
          <span className="stat-value">{total}</span>
          <span className="stat-label">Total Articles</span>
        </div>
        <div className="stat-card approved">
          <span className="stat-value">{approved}</span>
          <span className="stat-label">Approved</span>
        </div>
        <div className="stat-card pending">
          <span className="stat-value">{pending}</span>
          <span className="stat-label">Pending Approval</span>
        </div>
        <div className="stat-card rejected">
          <span className="stat-value">{rejected}</span>
          <span className="stat-label">Rejected</span>
        </div>
        <div className="stat-card archived">
          <span className="stat-value">{archived}</span>
          <span className="stat-label">Archived</span>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Most Viewed */}
        <div className="card">
          <h2 className="section-title">Most Viewed Articles</h2>
          {mostViewed.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '.9rem' }}>No articles yet.</p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Views</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mostViewed.map(a => (
                    <tr
                      key={a.article_id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/articles/${a.article_id}`)}
                    >
                      <td>{a.title}</td>
                      <td>{a.view_count}</td>
                      <td>
                        <span className={`badge ${STATUS_CLASS[a.status] || 'badge-draft'}`}>
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Articles */}
        <div className="card">
          <h2 className="section-title">Recent Articles</h2>
          {recent.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '.9rem' }}>No articles yet.</p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map(a => (
                    <tr
                      key={a.article_id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/articles/${a.article_id}`)}
                    >
                      <td>{a.title}</td>
                      <td>{a.author_name}</td>
                      <td>{fmtDate(a.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Category Breakdown */}
      {catBreakdown.length > 0 && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h2 className="section-title">Category Breakdown</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.75rem' }}>
            {catBreakdown.map(c => (
              <div key={c.name} style={{
                background: 'var(--primary-light)',
                borderRadius: 'var(--radius)',
                padding: '.6rem 1.1rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '.2rem',
                minWidth: '110px',
              }}>
                <span style={{ fontWeight: 700, fontSize: '1.4rem', color: 'var(--primary-dark)' }}>
                  {c.count}
                </span>
                <span style={{ fontSize: '.78rem', color: 'var(--primary-dark)', textAlign: 'center' }}>
                  {c.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ETL Analytics Section */}
      <div className="card" style={{ marginTop: '1.5rem', border: '2px solid #4361ee' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 className="section-title" style={{ margin: 0 }}>ETL Analytics Pipeline</h2>
          <button
            onClick={handleRunETL}
            disabled={etlLoading}
            style={{ background: '#4361ee', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 16px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}
          >
            {etlLoading ? 'Running...' : 'Run ETL'}
          </button>
        </div>
        {etlMsg && <div style={{ padding: '8px 12px', background: '#eef2ff', borderRadius: '6px', color: '#4361ee', marginBottom: '12px', fontSize: '14px' }}>{etlMsg}</div>}
        {kbAnalytics && kbAnalytics.total_records > 0 ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '1.5rem' }}>
              {[{ label: 'ETL Records', value: kbAnalytics.total_records }, { label: 'Total Views', value: kbAnalytics.total_views }, { label: 'Avg Rating', value: kbAnalytics.avg_rating + ' / 5' }].map(s => (
                <div key={s.label} style={{ background: 'var(--primary-light, #eef2ff)', borderRadius: '8px', padding: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: '#4361ee' }}>{s.value}</div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>{s.label}</div>
                </div>
              ))}
            </div>
            {topArticles.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px', color: 'var(--text, #2c3e50)' }}>Top 10 Most Viewed Articles (ETL)</h3>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Title</th><th>Category</th><th>Author</th><th>Views</th><th>Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topArticles.map((a, i) => (
                        <tr key={i}>
                          <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</td>
                          <td>{a.category}</td>
                          <td>{a.author_name}</td>
                          <td><strong>{a.view_count}</strong></td>
                          <td>{a.rating}★</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {kbCategoryStats.length > 0 && (
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px', color: 'var(--text, #2c3e50)' }}>Category Usage Analytics (ETL)</h3>
                {kbCategoryStats.map(c => (
                  <div key={c.category_name} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <div style={{ width: '140px', fontSize: '12px', color: '#555' }}>{c.category_name}</div>
                    <div style={{ flex: 1, background: '#eee', borderRadius: '4px', height: '16px' }}>
                      <div style={{ width: `${Math.min((c.total_views / 1000) * 100, 100)}%`, background: '#4361ee', height: '100%', borderRadius: '4px' }} />
                    </div>
                    <div style={{ width: '80px', fontSize: '12px', color: '#555' }}>{c.total_views} views</div>
                    <div style={{ width: '50px', fontSize: '12px', fontWeight: 600 }}>{c.article_count} arts</div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', color: '#aaa', padding: '20px', fontSize: '14px' }}>
            No ETL data loaded. Click "Run ETL" to process the knowledge base dataset.
          </div>
        )}
      </div>
    </div>
  )
}

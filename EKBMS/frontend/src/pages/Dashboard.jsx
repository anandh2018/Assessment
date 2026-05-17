import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getArticles, getCategories } from '../services/api'

export default function Dashboard() {
  const [articles, setArticles] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([getArticles(), getCategories()])
      .then(([arts, cats]) => {
        setArticles(arts)
        setCategories(cats)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

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
    </div>
  )
}

import React from 'react'
import { useNavigate } from 'react-router-dom'

const STATUS_CLASS = {
  'Draft':            'badge-draft',
  'Pending Approval': 'badge-pending',
  'Approved':         'badge-approved',
  'Rejected':         'badge-rejected',
  'Archived':         'badge-archived',
}

function StarDisplay({ rating }) {
  const full = Math.round(rating || 0)
  return (
    <span className="stars" title={`${(rating || 0).toFixed(1)} / 5`}>
      {[1,2,3,4,5].map(i => (
        <span key={i} className={`star readonly ${i <= full ? 'filled' : ''}`}>★</span>
      ))}
    </span>
  )
}

export default function ArticleCard({ article, onDelete }) {
  const navigate = useNavigate()

  const summary = article.summary
    ? article.summary.slice(0, 100) + (article.summary.length > 100 ? '…' : '')
    : article.content.slice(0, 100) + (article.content.length > 100 ? '…' : '')

  const tags = article.tags
    ? article.tags.split(',').map(t => t.trim()).filter(Boolean)
    : []

  const formattedDate = new Date(article.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })

  return (
    <div className="article-card">
      <div>
        <a
          className="article-card-title"
          href={`/articles/${article.article_id}`}
          onClick={e => { e.preventDefault(); navigate(`/articles/${article.article_id}`) }}
        >
          {article.title}
        </a>
      </div>

      <div className="article-card-meta">
        <span>By <strong>{article.author_name}</strong></span>
        {article.category && <span>| {article.category.category_name}</span>}
        <span>| {formattedDate}</span>
      </div>

      <p className="article-card-summary">{summary}</p>

      {tags.length > 0 && (
        <div className="tags-row">
          {tags.map(tag => (
            <span key={tag} className="tag-chip">{tag}</span>
          ))}
        </div>
      )}

      <div className="article-card-footer">
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '.82rem', color: 'var(--text-muted)' }}>
          <span className={`badge ${STATUS_CLASS[article.status] || 'badge-draft'}`}>
            {article.status}
          </span>
          <span title="Views">👁 {article.view_count}</span>
          <StarDisplay rating={article.rating} />
        </div>

        <div className="article-card-actions">
          <button
            className="btn btn-outline btn-sm"
            onClick={() => navigate(`/articles/${article.article_id}`)}
          >
            View
          </button>
          {onDelete && (
            <button
              className="btn btn-danger btn-sm"
              onClick={() => onDelete(article.article_id)}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

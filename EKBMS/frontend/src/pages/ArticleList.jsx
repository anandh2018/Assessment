import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import ArticleCard from '../components/ArticleCard'
import { getArticles, searchArticles, getCategories, deleteArticle } from '../services/api'

const STATUSES = ['', 'Draft', 'Pending Approval', 'Approved', 'Rejected', 'Archived']

export default function ArticleList() {
  const [articles, setArticles]   = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading]     = useState(true)
  const [keyword, setKeyword]     = useState('')
  const [status, setStatus]       = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [sortBy, setSortBy]       = useState('latest')
  const navigate = useNavigate()

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [arts, cats] = await Promise.all([
        keyword
          ? searchArticles({ keyword, status: status || undefined, category_id: categoryId || undefined })
          : getArticles({ status: status || undefined, category_id: categoryId || undefined }),
        getCategories(),
      ])
      setArticles(arts)
      setCategories(cats)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [keyword, status, categoryId])

  useEffect(() => {
    const timer = setTimeout(fetchData, 300)
    return () => clearTimeout(timer)
  }, [fetchData])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this article?')) return
    try {
      await deleteArticle(id)
      setArticles(prev => prev.filter(a => a.article_id !== id))
    } catch (e) {
      alert('Failed to delete article.')
    }
  }

  const sorted = [...articles].sort((a, b) => {
    if (sortBy === 'views')  return b.view_count - a.view_count
    if (sortBy === 'rating') return b.rating - a.rating
    return new Date(b.created_at) - new Date(a.created_at)
  })

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Articles</h1>
        <button className="btn btn-primary" onClick={() => navigate('/articles/create')}>
          + New Article
        </button>
      </div>

      <div className="filter-bar">
        <input
          placeholder="Search articles..."
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
        />
        <select value={status} onChange={e => setStatus(e.target.value)}>
          {STATUSES.map(s => (
            <option key={s} value={s}>{s || 'All Statuses'}</option>
          ))}
        </select>
        <select value={categoryId} onChange={e => setCategoryId(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
          ))}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="latest">Latest</option>
          <option value="views">Most Viewed</option>
          <option value="rating">Highest Rated</option>
        </select>
      </div>

      {loading ? (
        <div className="loader">Loading articles...</div>
      ) : sorted.length === 0 ? (
        <div className="empty-state">
          <h3>No articles found</h3>
          <p>Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="card-grid">
          {sorted.map(article => (
            <ArticleCard
              key={article.article_id}
              article={article}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

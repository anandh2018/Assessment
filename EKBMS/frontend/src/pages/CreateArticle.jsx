import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createArticle, submitArticle, getCategories } from '../services/api'

const INITIAL = {
  title: '',
  summary: '',
  content: '',
  category_id: '',
  author_name: '',
  tags: '',
}

export default function CreateArticle() {
  const [form, setForm]         = useState(INITIAL)
  const [categories, setCategories] = useState([])
  const [errors, setErrors]     = useState({})
  const [saving, setSaving]     = useState(false)
  const [message, setMessage]   = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error)
  }, [])

  const validate = () => {
    const e = {}
    if (!form.title.trim())       e.title       = 'Title is required'
    if (!form.content.trim())     e.content     = 'Content is required'
    if (!form.author_name.trim()) e.author_name = 'Author name is required'
    return e
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (action) => {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    setMessage(null)
    try {
      const payload = {
        title: form.title.trim(),
        content: form.content.trim(),
        summary: form.summary.trim() || null,
        category_id: form.category_id ? Number(form.category_id) : null,
        author_name: form.author_name.trim(),
        tags: form.tags.trim() || null,
      }
      const article = await createArticle(payload)

      if (action === 'submit') {
        await submitArticle(article.article_id)
        setMessage({ type: 'success', text: 'Article submitted for review!' })
      } else {
        setMessage({ type: 'success', text: 'Article saved as draft.' })
      }

      setTimeout(() => navigate(`/articles/${article.article_id}`), 1200)
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save article. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title">Create New Article</h1>
        <button className="btn btn-gray" onClick={() => navigate('/articles')}>
          Cancel
        </button>
      </div>

      {message && (
        <div className={`alert alert-${message.type === 'error' ? 'error' : 'success'}`}>
          {message.text}
        </div>
      )}

      <div className="card">
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            id="title"
            name="title"
            className="form-control"
            placeholder="Article title"
            value={form.title}
            onChange={handleChange}
          />
          {errors.title && <span style={{ color: 'var(--danger)', fontSize: '.8rem' }}>{errors.title}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="summary">Summary</label>
          <textarea
            id="summary"
            name="summary"
            className="form-control"
            rows={2}
            placeholder="Short description of the article"
            value={form.summary}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">Content *</label>
          <textarea
            id="content"
            name="content"
            className="form-control"
            rows={12}
            placeholder="Write your article content here..."
            value={form.content}
            onChange={handleChange}
            style={{ minHeight: 220 }}
          />
          {errors.content && <span style={{ color: 'var(--danger)', fontSize: '.8rem' }}>{errors.content}</span>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label htmlFor="category_id">Category</label>
            <select
              id="category_id"
              name="category_id"
              className="form-control"
              value={form.category_id}
              onChange={handleChange}
            >
              <option value="">-- Select Category --</option>
              {categories.map(c => (
                <option key={c.category_id} value={c.category_id}>
                  {c.category_name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="author_name">Author Name *</label>
            <input
              id="author_name"
              name="author_name"
              className="form-control"
              placeholder="Your name"
              value={form.author_name}
              onChange={handleChange}
            />
            {errors.author_name && <span style={{ color: 'var(--danger)', fontSize: '.8rem' }}>{errors.author_name}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="tags">Tags <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(comma-separated)</span></label>
          <input
            id="tags"
            name="tags"
            className="form-control"
            placeholder="e.g. policy, onboarding, security"
            value={form.tags}
            onChange={handleChange}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '.5rem' }}>
          <button
            className="btn btn-gray"
            onClick={() => handleSubmit('draft')}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save as Draft'}
          </button>
          <button
            className="btn btn-primary"
            onClick={() => handleSubmit('submit')}
            disabled={saving}
          >
            {saving ? 'Submitting...' : 'Submit for Review'}
          </button>
        </div>
      </div>
    </div>
  )
}

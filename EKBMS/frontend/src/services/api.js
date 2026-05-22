import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// ── Articles ──────────────────────────────────────────────────────────────────

export const getArticles = (params = {}) =>
  api.get('/articles', { params }).then(r => r.data)

export const getArticle = (id) =>
  api.get(`/articles/${id}`).then(r => r.data)

export const createArticle = (data) =>
  api.post('/articles', data).then(r => r.data)

export const updateArticle = (id, data) =>
  api.put(`/articles/${id}`, data).then(r => r.data)

export const deleteArticle = (id) =>
  api.delete(`/articles/${id}`).then(r => r.data)

export const submitArticle = (id) =>
  api.post(`/articles/${id}/submit`).then(r => r.data)

export const approveArticle = (id, data) =>
  api.post(`/articles/${id}/approve`, data).then(r => r.data)

export const rateArticle = (id, rating) =>
  api.post(`/articles/${id}/rate`, { rating }).then(r => r.data)

export const searchArticles = (params = {}) =>
  api.get('/articles/search', { params }).then(r => r.data)

// ── Comments ──────────────────────────────────────────────────────────────────

export const getComments = (articleId) =>
  api.get(`/articles/${articleId}/comments`).then(r => r.data)

export const addComment = (articleId, data) =>
  api.post(`/articles/${articleId}/comments`, data).then(r => r.data)

// ── Categories ────────────────────────────────────────────────────────────────

export const getCategories = () =>
  api.get('/categories').then(r => r.data)

export const createCategory = (data) =>
  api.post('/categories', data).then(r => r.data)

export const updateCategory = (id, data) =>
  api.put(`/categories/${id}`, data).then(r => r.data)

export const deleteCategory = (id) =>
  api.delete(`/categories/${id}`).then(r => r.data)

export const getKBAnalyticsSummary = () => api.get('/analytics/summary').then(r => r.data);
export const getKBAnalyticsCategories = () => api.get('/analytics/categories').then(r => r.data);
export const getKBTopArticles = () => api.get('/analytics/top-articles').then(r => r.data);
export const getKBAuthors = () => api.get('/analytics/authors').then(r => r.data);
export const runKBETL = () => api.post('/analytics/etl/run').then(r => r.data);

export default api

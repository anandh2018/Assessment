import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept responses to normalize errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export const getAllTickets = (filters = {}) => {
  const params = {};
  if (filters.status) params.status = filters.status;
  if (filters.category) params.category = filters.category;
  if (filters.priority) params.priority = filters.priority;
  return apiClient.get('/tickets', { params });
};

export const getTicket = (id) => apiClient.get(`/tickets/${id}`);

export const createTicket = (data) => apiClient.post('/tickets', data);

export const updateTicket = (id, data) => apiClient.put(`/tickets/${id}`, data);

export const deleteTicket = (id) => apiClient.delete(`/tickets/${id}`);

export const searchTickets = (params = {}) => {
  const cleanParams = {};
  if (params.keyword) cleanParams.keyword = params.keyword;
  if (params.category) cleanParams.category = params.category;
  if (params.status) cleanParams.status = params.status;
  if (params.priority) cleanParams.priority = params.priority;
  return apiClient.get('/search', { params: cleanParams });
};

export const getAnalyticsSummary = () => apiClient.get('/analytics/summary').then(r => r.data);
export const getAnalyticsCategories = () => apiClient.get('/analytics/categories').then(r => r.data);
export const getAnalyticsDepartments = () => apiClient.get('/analytics/departments').then(r => r.data);
export const getAnalyticsPriorities = () => apiClient.get('/analytics/priorities').then(r => r.data);
export const runETL = () => apiClient.post('/analytics/etl/run').then(r => r.data);

export default apiClient;

import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getAllComplaints = async (filters = {}) => {
  const params = {};
  if (filters.status) params.status = filters.status;
  if (filters.category) params.category = filters.category;
  if (filters.priority) params.priority = filters.priority;
  if (filters.skip !== undefined) params.skip = filters.skip;
  if (filters.limit !== undefined) params.limit = filters.limit;
  const response = await api.get('/complaints', { params });
  return response.data;
};

export const getComplaint = async (id) => {
  const response = await api.get(`/complaints/${id}`);
  return response.data;
};

export const createComplaint = async (data) => {
  const response = await api.post('/complaints', data);
  return response.data;
};

export const updateComplaint = async (id, data) => {
  const response = await api.put(`/complaints/${id}`, data);
  return response.data;
};

export const deleteComplaint = async (id) => {
  const response = await api.delete(`/complaints/${id}`);
  return response.data;
};

export const searchComplaints = async (params = {}) => {
  const response = await api.get('/complaints/search', { params });
  return response.data;
};

export const getComplaintHistory = async (id) => {
  const response = await api.get(`/complaints/${id}/history`);
  return response.data;
};

export const getDashboardStats = async () => {
  const response = await api.get('/dashboard/stats');
  return response.data;
};

export const getAnalyticsSummary = async () => {
  const response = await api.get('/analytics/summary');
  return response.data;
};

export const getAnalyticsCategories = async () => {
  const response = await api.get('/analytics/categories');
  return response.data;
};

export const getAnalyticsAgents = async () => {
  const response = await api.get('/analytics/agents');
  return response.data;
};

export const runETL = async () => {
  const response = await api.post('/analytics/etl/run');
  return response.data;
};

export default api;

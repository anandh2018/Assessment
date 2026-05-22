import axios from 'axios';

const API_URL = 'http://localhost:8001';

const API = axios.create({ baseURL: API_URL });

export default API;

export const getAnalyticsSummary = () =>
  axios.get(`${API_URL}/analytics/summary`).then(r => r.data);

export const getAnalyticsPrograms = () =>
  axios.get(`${API_URL}/analytics/programs`).then(r => r.data);

export const getAnalyticsRatings = () =>
  axios.get(`${API_URL}/analytics/ratings`).then(r => r.data);

export const runETL = () =>
  axios.post(`${API_URL}/analytics/etl/run`).then(r => r.data);

import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:8000' });

export default API;

export const getLMSAnalyticsSummary = () => API.get('/analytics/summary').then(r => r.data);
export const getLMSPopularBooks = () => API.get('/analytics/popular-books').then(r => r.data);
export const getLMSCategoryStats = () => API.get('/analytics/categories').then(r => r.data);
export const getLMSMonthlyTrends = () => API.get('/analytics/monthly-trends').then(r => r.data);
export const runLMSETL = () => API.post('/analytics/etl/run').then(r => r.data);

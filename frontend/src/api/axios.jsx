import axios from 'axios';

const AUTH_BASE = 'http://localhost:8001/api/v1';
const TASK_BASE = 'http://localhost:8002/api/v1/tasks';

const api = axios.create();

// Interceptor to add Token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  register: (data) => api.post(`${AUTH_BASE}/register`, data),
  login: (formData) => api.post(`${AUTH_BASE}/login`, formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  }),
};

export const taskApi = {
  getAll: () => api.get(`${TASK_BASE}/`),
  create: (data) => api.post(`${TASK_BASE}/`, data),
  update: (id, data) => api.put(`${TASK_BASE}/${id}`, data),
  delete: (id) => api.delete(`${TASK_BASE}/${id}`),
};

export default api;
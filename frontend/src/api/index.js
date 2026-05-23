import axios from 'axios';

export const API_BASE_URL = 'http://localhost:5005/api';
export const ASSET_BASE_URL = API_BASE_URL.replace('/api', '');

export const resolveAssetUrl = (path) => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return `${ASSET_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};

const API = axios.create({
  baseURL: API_BASE_URL
});

// Tự động gắn JWT token vào mỗi request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Xử lý response error (401 = hết hạn token)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ========== AUTH APIs ==========
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  changePassword: (data) => API.put('/auth/change-password', data),
};

// ========== SERVICE APIs ==========
export const serviceAPI = {
  getAll: (params) => API.get('/services', { params }),
  getById: (id) => API.get(`/services/${id}`),
  create: (data) => API.post('/services', data),
  update: (id, data) => API.put(`/services/${id}`, data),
  delete: (id) => API.delete(`/services/${id}`),
};

// ========== APPOINTMENT APIs ==========
export const appointmentAPI = {
  create: (data) => API.post('/appointments', data),
  getAll: (params) => API.get('/appointments', { params }),
  getById: (id) => API.get(`/appointments/${id}`),
  updateStatus: (id, status) => API.put(`/appointments/${id}/status`, { status }),
  assign: (id, technicianId) => API.put(`/appointments/${id}/assign`, { technicianId }),
  cancel: (id) => API.delete(`/appointments/${id}`),
};

// ========== USER APIs ==========
export const userAPI = {
  getAll: (params) => API.get('/users', { params }),
  getById: (id) => API.get(`/users/${id}`),
  update: (id, data) => API.put(`/users/${id}`, data),
  createTechnician: (data) => API.post('/users/technician', data),
};

// ========== STATS APIs ==========
export const statsAPI = {
  getDashboard: () => API.get('/stats/dashboard'),
  getByMonth: (year) => API.get('/stats/appointments-by-month', { params: { year } }),
  getByStatus: () => API.get('/stats/appointments-by-status'),
};

// ========== INVENTORY APIs ==========
export const inventoryAPI = {
  getAll: (params) => API.get('/inventory', { params }),
  getById: (id) => API.get(`/inventory/${id}`),
  create: (data) => API.post('/inventory', data),
  update: (id, data) => API.put(`/inventory/${id}`, data),
  delete: (id) => API.delete(`/inventory/${id}`),
};

// ========== AI CHAT APIs ==========
export const aiAPI = {
  chat: (data) => API.post('/ai/chat', data),
};

export default API;

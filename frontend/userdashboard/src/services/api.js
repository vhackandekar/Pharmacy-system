import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
};

export const agentAPI = {
  chat: (userMessage, history) => api.post('/agent/chat', { userMessage, history }),
};

export const medicineAPI = {
  getAll: () => api.get('/medicine'),
};

export const orderAPI = {
  place: (orderData) => api.post('/order/place', orderData),
  getHistory: (userId) => api.get(`/order/history/${userId}`),
};

export const adminAPI = {
  getStats: () => api.get('/admin/dashboard'),
  getInventory: () => api.get('/admin/inventory'),
  getAnalytics: () => api.get('/admin/analytics'),
  getActivity: () => api.get('/admin/activity'),
  getAllOrders: () => api.get('/admin/orders'),
  updateOrderStatus: (orderId, status) => api.put(`/admin/orders/${orderId}`, { status }),
};

export default api;

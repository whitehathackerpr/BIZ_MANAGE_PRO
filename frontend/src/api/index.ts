import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Update this to your backend base URL if needed
  withCredentials: true,
});

// Add a request interceptor to attach JWT token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export default api; 
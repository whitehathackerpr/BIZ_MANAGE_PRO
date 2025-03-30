import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor for authentication
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized access
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Branch Management API methods
export const branchApi = {
    getAll: () => api.get('/branches'),
    getById: (id) => api.get(`/branches/${id}`),
    create: (data) => api.post('/branches', data),
    update: (id, data) => api.put(`/branches/${id}`, data),
    delete: (id) => api.delete(`/branches/${id}`),
    getInventory: (id) => api.get(`/branches/${id}/inventory`),
    getPerformance: (id) => api.get(`/branches/${id}/performance`),
    getEmployees: (id) => api.get(`/branches/${id}/employees`),
};

// User Management API methods
export const userApi = {
    getAll: () => api.get('/users'),
    getById: (id) => api.get(`/users/${id}`),
    create: (data) => api.post('/users', data),
    update: (id, data) => api.put(`/users/${id}`, data),
    delete: (id) => api.delete(`/users/${id}`),
    getProfile: () => api.get('/users/profile'),
    updateProfile: (data) => api.put('/users/profile', data),
};

// Inventory Management API methods
export const inventoryApi = {
    getAll: () => api.get('/inventory'),
    getById: (id) => api.get(`/inventory/${id}`),
    create: (data) => api.post('/inventory', data),
    update: (id, data) => api.put(`/inventory/${id}`, data),
    delete: (id) => api.delete(`/inventory/${id}`),
    getLowStock: () => api.get('/inventory/low-stock'),
    getStockHistory: (id) => api.get(`/inventory/${id}/history`),
};

// Sales Management API methods
export const salesApi = {
    getAll: () => api.get('/sales'),
    getById: (id) => api.get(`/sales/${id}`),
    create: (data) => api.post('/sales', data),
    update: (id, data) => api.put(`/sales/${id}`, data),
    delete: (id) => api.delete(`/sales/${id}`),
    getDailySales: () => api.get('/sales/daily'),
    getMonthlySales: () => api.get('/sales/monthly'),
};

// Analytics API methods
export const analyticsApi = {
    getDashboard: () => api.get('/analytics/dashboard'),
    getSalesAnalytics: () => api.get('/analytics/sales'),
    getInventoryAnalytics: () => api.get('/analytics/inventory'),
    getCustomerAnalytics: () => api.get('/analytics/customers'),
};

// Business Profile API methods
export const businessApi = {
    getProfile: () => api.get('/business/profile'),
    updateProfile: (data) => api.put('/business/profile', data),
    getSettings: () => api.get('/business/settings'),
    updateSettings: (data) => api.put('/business/settings', data),
};

// Export the base api instance as well
export { api }; 
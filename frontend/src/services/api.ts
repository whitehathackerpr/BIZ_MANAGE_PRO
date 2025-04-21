import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { showToast } from '../components/Toast';
import useStore from '../store/useStore';
import { ApiResponse } from '../types';

const API_URL = process.env['REACT_APP_API_URL'] || 'http://localhost:8000/api';

// Create the api instance
const api: AxiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
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

// Response interceptor
api.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
        if (error.response) {
            const { status, data } = error.response;
            
            switch (status) {
                case 401:
                    showToast({
                        message: 'Unauthorized access. Please login again.',
                        type: 'error',
                    });
                    // Redirect to login
                    window.location.href = '/login';
                    break;
                case 403:
                    showToast({
                        message: 'You do not have permission to perform this action.',
                        type: 'error',
                    });
                    break;
                case 404:
                    showToast({
                        message: 'The requested resource was not found.',
                        type: 'error',
                    });
                    break;
                case 500:
                    showToast({
                        message: 'An internal server error occurred.',
                        type: 'error',
                    });
                    break;
                default:
                    showToast({
                        message: (data as any)?.message || 'An error occurred',
                        type: 'error',
                    });
            }
        } else if (error.request) {
            showToast({
                message: 'No response received from server. Please check your connection.',
                type: 'error',
            });
        } else {
            showToast({
                message: 'An error occurred while setting up the request.',
                type: 'error',
            });
        }
        
        return Promise.reject(error);
    }
);

interface LoginCredentials {
    email: string;
    password: string;
}

interface RegisterData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

interface ResetPasswordData {
    token: string;
    password: string;
}

interface ChangePasswordData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

interface ProfileData {
    name: string;
    email: string;
    phone?: string;
    address?: string;
}

// Define services after api is initialized
const authService = {
    login: (credentials: LoginCredentials) => api.post<ApiResponse<{ access_token: string; refresh_token: string }>>('/auth/login', credentials),
    register: (userData: RegisterData) => api.post<ApiResponse<{ message: string }>>('/auth/register', userData),
    logout: () => api.post<ApiResponse<{ message: string }>>('/auth/logout'),
    refreshToken: () => api.post<ApiResponse<{ access_token: string }>>('/auth/refresh'),
    forgotPassword: (email: string) => api.post<ApiResponse<{ message: string }>>('/auth/forgot-password', { email }),
    resetPassword: (data: ResetPasswordData) => api.post<ApiResponse<{ message: string }>>('/auth/reset-password', data),
    getProfile: () => api.get<ApiResponse<ProfileData>>('/auth/profile'),
    updateProfile: (data: ProfileData) => api.put<ApiResponse<ProfileData>>('/auth/profile', data),
    changePassword: (data: ChangePasswordData) => api.put<ApiResponse<{ message: string }>>('/auth/change-password', data),
    uploadAvatar: (formData: FormData) =>
        api.post<ApiResponse<{ avatar_url: string }>>('/auth/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }),
    deleteAccount: () => api.delete<ApiResponse<{ message: string }>>('/auth/account'),
};

const userService = {
    getProfile: () => api.get<ApiResponse<ProfileData>>('/user/profile'),
    updateProfile: (data: ProfileData) => api.put<ApiResponse<ProfileData>>('/user/profile', data),
    changePassword: (data: ChangePasswordData) => api.put<ApiResponse<{ message: string }>>('/user/change-password', data),
    updateSettings: (settings: Record<string, any>) => api.put<ApiResponse<Record<string, any>>>('/user/settings', settings),
};

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    stock: number;
    min_stock: number;
}

const productService = {
    getAll: (params?: Record<string, any>) => api.get<ApiResponse<Product[]>>('/products', { params }),
    getById: (id: string) => api.get<ApiResponse<Product>>(`/products/${id}`),
    create: (data: Omit<Product, 'id'>) => api.post<ApiResponse<Product>>('/products', data),
    update: (id: string, data: Partial<Product>) => api.put<ApiResponse<Product>>(`/products/${id}`, data),
    delete: (id: string) => api.delete<ApiResponse<{ message: string }>>(`/products/${id}`),
    getCategories: () => api.get<ApiResponse<string[]>>('/products/categories'),
    getInventory: () => api.get<ApiResponse<Product[]>>('/products/inventory'),
};

interface Sale {
    id: string;
    created_at: string;
    invoice_number: string;
    customer_name: string;
    total_amount: number;
    payment_method: string;
    status: string;
}

const salesService = {
    getAll: (params?: Record<string, any>) => api.get<ApiResponse<Sale[]>>('/sales', { params }),
    getById: (id: string) => api.get<ApiResponse<Sale>>(`/sales/${id}`),
    create: (data: Omit<Sale, 'id' | 'created_at'>) => api.post<ApiResponse<Sale>>('/sales', data),
    update: (id: string, data: Partial<Sale>) => api.put<ApiResponse<Sale>>(`/sales/${id}`, data),
    delete: (id: string) => api.delete<ApiResponse<{ message: string }>>(`/sales/${id}`),
    getStats: () => api.get<ApiResponse<Record<string, any>>>('/sales/stats'),
};

interface InventoryItem {
    id: string;
    product_id: string;
    quantity: number;
    location: string;
    last_updated: string;
}

const inventoryService = {
    getAll: (params?: Record<string, any>) => api.get<ApiResponse<InventoryItem[]>>('/inventory', { params }),
    getById: (id: string) => api.get<ApiResponse<InventoryItem>>(`/inventory/${id}`),
    create: (data: Omit<InventoryItem, 'id' | 'last_updated'>) => api.post<ApiResponse<InventoryItem>>('/inventory', data),
    update: (id: string, data: Partial<InventoryItem>) => api.put<ApiResponse<InventoryItem>>(`/inventory/${id}`, data),
    delete: (id: string) => api.delete<ApiResponse<{ message: string }>>(`/inventory/${id}`),
    getStockLevels: () => api.get<ApiResponse<InventoryItem[]>>('/inventory/stock-levels'),
};

interface Employee {
    id: string;
    name: string;
    email: string;
    role: string;
    department: string;
    join_date: string;
}

const employeeService = {
    getAll: (params?: Record<string, any>) => api.get<ApiResponse<Employee[]>>('/employees', { params }),
    getById: (id: string) => api.get<ApiResponse<Employee>>(`/employees/${id}`),
    create: (data: Omit<Employee, 'id'>) => api.post<ApiResponse<Employee>>('/employees', data),
    update: (id: string, data: Partial<Employee>) => api.put<ApiResponse<Employee>>(`/employees/${id}`, data),
    delete: (id: string) => api.delete<ApiResponse<{ message: string }>>(`/employees/${id}`),
    getAttendance: (id: string) => api.get<ApiResponse<Record<string, any>>>(`/employees/${id}/attendance`),
};

const analyticsService = {
    getSalesAnalytics: (params?: Record<string, any>) => api.get<ApiResponse<Record<string, any>>>('/analytics/sales', { params }),
    getInventoryAnalytics: (params?: Record<string, any>) => api.get<ApiResponse<Record<string, any>>>('/analytics/inventory', { params }),
    getEmployeeAnalytics: (params?: Record<string, any>) => api.get<ApiResponse<Record<string, any>>>('/analytics/employees', { params }),
    getCustomerAnalytics: (params?: Record<string, any>) => api.get<ApiResponse<Record<string, any>>>('/analytics/customers', { params }),
};

interface Notification {
    id: string;
    type: string;
    message: string;
    read: boolean;
    created_at: string;
}

const notificationService = {
    getAll: (params?: Record<string, any>) => api.get<ApiResponse<Notification[]>>('/notifications', { params }),
    markAsRead: (id: string) => api.put<ApiResponse<Notification>>(`/notifications/${id}/read`),
    markAllAsRead: () => api.put<ApiResponse<{ message: string }>>('/notifications/read-all'),
    delete: (id: string) => api.delete<ApiResponse<{ message: string }>>(`/notifications/${id}`),
};

const settingsService = {
    getSettings: () => api.get<ApiResponse<Record<string, any>>>('/settings'),
    updateSettings: (data: Record<string, any>) => api.put<ApiResponse<Record<string, any>>>('/settings', data),
    getBusinessProfile: () => api.get<ApiResponse<Record<string, any>>>('/settings/business-profile'),
    updateBusinessProfile: (data: Record<string, any>) => api.put<ApiResponse<Record<string, any>>>('/settings/business-profile', data),
};

// Dashboard APIs
export const dashboardApi = {
    getSalesOverview: () => api.get<ApiResponse<Record<string, any>>>('/dashboard/sales-overview'),
    getInventoryStatus: () => api.get<ApiResponse<Record<string, any>>>('/dashboard/inventory-status'),
    getCustomerStats: () => api.get<ApiResponse<Record<string, any>>>('/dashboard/customer-stats'),
    getFinancialOverview: () => api.get<ApiResponse<Record<string, any>>>('/dashboard/financial-overview'),
    getRecentActivities: () => api.get<ApiResponse<Record<string, any>[]>>('/dashboard/recent-activities'),
    getProductCategories: () => api.get<ApiResponse<Record<string, any>[]>>('/dashboard/product-categories'),
};

// Sales APIs
export const salesApi = {
    getSalesData: (params?: Record<string, any>) => api.get<ApiResponse<Sale[]>>('/sales', { params }),
    getSalesByCategory: () => api.get<ApiResponse<Record<string, any>[]>>('/sales/by-category'),
    getSalesPerformance: (params?: Record<string, any>) => api.get<ApiResponse<Record<string, any>>>('/sales/performance', { params }),
};

// Inventory APIs
export const inventoryApi = {
    getInventoryStatus: () => api.get<ApiResponse<Record<string, any>>>('/inventory/status'),
    getLowStockItems: () => api.get<ApiResponse<InventoryItem[]>>('/inventory/low-stock'),
    getInventoryByCategory: () => api.get<ApiResponse<Record<string, any>[]>>('/inventory/by-category'),
};

// Customer APIs
export const customerApi = {
    getCustomerOverview: () => api.get<ApiResponse<Record<string, any>>>('/customers/overview'),
    getCustomerFeedback: () => api.get<ApiResponse<Record<string, any>[]>>('/customers/feedback'),
    getCustomerGrowth: () => api.get<ApiResponse<Record<string, any>>>('/customers/growth'),
};

// Financial APIs
export const financialApi = {
    getFinancialOverview: () => api.get<ApiResponse<Record<string, any>>>('/financial/overview'),
    getRevenueData: (params?: Record<string, any>) => api.get<ApiResponse<Record<string, any>[]>>('/financial/revenue', { params }),
    getExpenseData: (params?: Record<string, any>) => api.get<ApiResponse<Record<string, any>[]>>('/financial/expenses', { params }),
};

// Export everything
export {
    authService,
    userService,
    productService,
    salesService,
    inventoryService,
    employeeService,
    analyticsService,
    notificationService,
    settingsService,
};

export default api; 
import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig, AxiosError } from 'axios';
import { API_CONFIG } from '../config';

// Define response interface
interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

// Define error interface
interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}

class ApiClient {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Get token from localStorage
        const token = localStorage.getItem('auth_token');
        
        // If token exists, add it to the request headers
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        // Handle token expiration
        if (error.response?.status === 401) {
          // Clear authentication data
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_info');
          
          // Redirect to login
          window.location.href = '/login';
        }
        
        // Create a standardized error object
        const apiError: ApiError = {
          message: error.response?.data?.message || 'An unexpected error occurred',
          status: error.response?.status,
          errors: error.response?.data?.errors
        };
        
        return Promise.reject(apiError);
      }
    );
  }

  // GET request
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.get(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // POST request
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.post(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // PUT request
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.put(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // PATCH request
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.patch(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // DELETE request
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.delete(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

// Create instance with base URL from config
const apiClient = new ApiClient(API_CONFIG.BASE_URL);

export default apiClient; 
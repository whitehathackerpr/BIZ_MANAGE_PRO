/**
 * API client with interceptors for authentication and error handling
 */
import axios, { 
  AxiosError, 
  AxiosInstance, 
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosRequestConfig
} from 'axios';
import { TokenResponse } from '../types/api/responses/auth';
import { message } from 'antd';

// Define custom type for ImportMeta.env
interface ImportMetaEnv {
  VITE_API_URL?: string;
}

// Get API URL from environment variables or use default
const baseURL = (import.meta.env as ImportMetaEnv).VITE_API_URL || 'http://localhost:8000/api';

class ApiClient {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.api.interceptors.request.use(
      (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: AxiosError): Promise<AxiosError> => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse): AxiosResponse => response,
      async (error: AxiosError): Promise<any> => {
        const originalRequest = error.config;

        // Handle token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            const response = await axios.post(`${baseURL}/auth/refresh`, {
              refresh_token: refreshToken,
            });

            const { access_token } = response.data;
            localStorage.setItem('token', access_token);

            originalRequest.headers.Authorization = `Bearer ${access_token}`;
            return this.api(originalRequest);
          } catch (refreshError) {
            // If refresh fails, logout user
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        // Handle other errors
        this.handleError(error);
        return Promise.reject(error);
      }
    );
  }

  private handleError(error: any): void {
    const errorMessage = error.response?.data?.message || 'An error occurred';
    message.error(errorMessage);

    if (error.response?.status === 403) {
      message.error('You do not have permission to perform this action');
    } else if (error.response?.status === 404) {
      message.error('Resource not found');
    } else if (error.response?.status === 500) {
      message.error('Internal server error');
    }
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.get<T>(url, config);
    return response.data;
  }

  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.post<T>(url, data, config);
    return response.data;
  }

  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.put<T>(url, data, config);
    return response.data;
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.delete<T>(url, config);
    return response.data;
  }

  public async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.patch<T>(url, data, config);
    return response.data;
  }

  public async upload(url: string, file: File, onProgress?: (progress: number) => void): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    };

    const response = await this.api.post(url, formData, config);
    return response.data;
  }

  public async downloadFile(url: string, filename: string): Promise<void> {
    const response = await this.api.get(url, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  }

  public setAuthToken(token: string): void {
    localStorage.setItem('token', token);
  }

  public clearAuthToken(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }

  public isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
}

const apiClient = new ApiClient();
export default apiClient; 
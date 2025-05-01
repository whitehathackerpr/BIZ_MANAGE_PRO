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
import { TokenResponse, RefreshTokenResponse } from '../types/api/responses/auth';

// Extend AxiosRequestConfig to include metadata
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  metadata?: {
    startTime: Date;
  };
}

// Define custom type for ImportMeta.env
interface ImportMetaEnv {
  VITE_API_URL?: string;
  VITE_API_TIMEOUT?: string;
  VITE_MAX_RETRIES?: string;
}

// Get API URL from environment variables or use default
const baseURL = (import.meta.env as ImportMetaEnv).VITE_API_URL || 'http://localhost:8000/api/v1';
const API_TIMEOUT = parseInt((import.meta.env as ImportMetaEnv).VITE_API_TIMEOUT || '30000', 10);
const MAX_RETRIES = parseInt((import.meta.env as ImportMetaEnv).VITE_MAX_RETRIES || '3', 10);

class ApiClient {
  private api: AxiosInstance;
  private tokenKey = 'token';
  private refreshTokenKey = 'refresh_token';
  private csrfToken: string | null = null;
  private retryCount: number = 0;
  private rateLimitResetTime: number | null = null;

  constructor() {
    this.api = axios.create({
      baseURL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Enable sending cookies with requests
    });

    this.setupInterceptors();
  }

  // Expose the underlying Axios instance
  public get axiosInstance(): AxiosInstance {
    return this.api;
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.api.interceptors.request.use(
      (config: ExtendedAxiosRequestConfig): ExtendedAxiosRequestConfig => {
        // Check rate limit before making request
        if (this.rateLimitResetTime && Date.now() < this.rateLimitResetTime) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }

        const token = localStorage.getItem(this.tokenKey);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add CSRF token if available
        if (this.csrfToken) {
          config.headers['X-CSRF-Token'] = this.csrfToken;
        }

        // Add request timestamp for timeout handling
        config.metadata = { startTime: new Date() };

        return config;
      },
      (error: AxiosError): Promise<AxiosError> => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse): AxiosResponse => {
        // Reset retry count on successful response
        this.retryCount = 0;

        // Store CSRF token if provided
        const csrfToken = response.headers['x-csrf-token'];
        if (csrfToken) {
          this.csrfToken = csrfToken;
        }

        return response;
      },
      async (error: AxiosError): Promise<any> => {
        const originalRequest = error.config as ExtendedAxiosRequestConfig & { _retry?: boolean };

        // Handle rate limiting
        if (error.response?.status === 429) {
          const resetTime = error.response.headers['x-ratelimit-reset'];
          if (resetTime) {
            this.rateLimitResetTime = parseInt(resetTime, 10) * 1000; // Convert to milliseconds
            const waitTime = Math.ceil((this.rateLimitResetTime - Date.now()) / 1000);
            console.error(`Rate limit exceeded. Please try again in ${waitTime} seconds.`);
          }
          return Promise.reject(error);
        }

        // Handle token refresh
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          if (this.retryCount >= MAX_RETRIES) {
            this.clearAuthToken();
            window.location.href = '/login';
            return Promise.reject(new Error('Maximum retry attempts exceeded'));
          }

          try {
            originalRequest._retry = true;
            this.retryCount++;

            const refreshToken = localStorage.getItem(this.refreshTokenKey);
            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            const response = await axios.post<RefreshTokenResponse>(
              `${baseURL}/auth/refresh`,
              { refresh_token: refreshToken },
              { headers: { 'X-CSRF-Token': this.csrfToken || '' } }
            );

            const { accessToken } = response.data.tokens;
            localStorage.setItem(this.tokenKey, accessToken);

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return this.api(originalRequest);
          } catch (refreshError) {
            this.clearAuthToken();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        // Handle request timeout
        if (error.code === 'ECONNABORTED' && originalRequest) {
          const startTime = originalRequest.metadata?.startTime;
          if (startTime) {
            const timeElapsed = new Date().getTime() - startTime.getTime();
            console.error(`Request timed out after ${timeElapsed}ms:`, originalRequest.url);
          }
        }

        // Handle other errors
        this.handleError(error);
        return Promise.reject(error);
      }
    );
  }

  private handleError(error: any): void {
    if (error.response) {
      const status = error.response.status;
      const errorMessage = error.response.data.detail || error.response.data.message || 'An error occurred';

      switch (status) {
        case 400:
          console.error('Invalid request. Please check your input.');
          break;
        case 403:
          console.error('You do not have permission to perform this action');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 422:
          console.error('Validation error. Please check your input.');
          break;
        case 429:
          // Rate limit error handled in interceptor
          break;
        case 500:
          console.error('Internal server error. Please try again later.');
          break;
        default:
          console.error(errorMessage);
      }

      console.error('API Error Response:', {
        status,
        url: error.config?.url,
        message: errorMessage,
        data: error.response.data
      });
    } else if (error.request) {
      console.error('No response received from server. Please check your connection.');
      console.error('API Request Error:', error.request);
    } else {
      console.error('An error occurred while setting up the request');
      console.error('API Error:', error.message);
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
    localStorage.setItem(this.tokenKey, token);
  }

  public clearAuthToken(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    this.csrfToken = null;
  }

  public isAuthenticated(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }
}

const apiClient = new ApiClient();
export default apiClient; 
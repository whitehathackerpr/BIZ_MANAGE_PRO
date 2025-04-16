# TypeScript Improvement Implementation Plan

## Current Issues

1. Multiple type-related issues identified in the TypeScript migration documentation:
   - Excessive use of `any` type in services and components
   - Missing interfaces for API responses
   - Inconsistent type definitions across files
   - No centralized type directory structure

2. Vite configuration duplication:
   - Both vite.config.js and vite.config.ts exist

## Implementation Plan

### 1. Standardize Vite Configuration

1. Compare vite.config.js and vite.config.ts to ensure all configurations are migrated
2. Update vite.config.ts with any missing configurations from vite.config.js
3. Remove vite.config.js

### 2. Create Centralized Type Directory Structure

Create a proper types directory structure:

```
frontend/src/types/
  api/
    responses/      # API response types
    requests/       # API request types
    index.ts        # Export all API types
  models/
    user.ts         # User-related types
    product.ts      # Product-related types
    order.ts        # Order-related types
    ...
    index.ts        # Export all model types
  components/       # Component prop types
    index.ts        # Export all component types
  store/            # State management types
    index.ts        # Export all store types
  utils/            # Utility types
    index.ts        # Export all utility types
  index.ts          # Root barrel file to export all types
```

### 3. Implement Shared API Response Types

Create common API response types in `src/types/api/responses/common.ts`:

```typescript
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ErrorResponse {
  statusCode: number;
  message: string;
  errors?: Record<string, string[]>;
}
```

### 4. Implement Core Model Types

Create core model types in respective files:

#### src/types/models/user.ts

```typescript
export interface User {
  id: number;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  address?: string;
  company?: string;
  position?: string;
  isActive: boolean;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
}

export interface UserCredentials {
  email: string;
  password: string;
}

export interface UserRegistration {
  email: string;
  name: string;
  password: string;
}

export interface UserUpdate {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  company?: string;
  position?: string;
}
```

#### src/types/models/notification.ts

```typescript
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  link?: string;
  data?: Record<string, unknown>;
}

export interface WebSocketNotification {
  type: 'notification';
  payload: Notification;
}

export interface WebSocketEvent {
  type: string;
  payload: unknown;
}
```

### 5. Implement API Client Types

#### src/types/api/requests/auth.ts

```typescript
import { UserCredentials, UserRegistration } from '../../models/user';

export type LoginRequest = UserCredentials;
export type RegisterRequest = UserRegistration;

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordUpdateRequest {
  password: string;
  token: string;
}
```

#### src/types/api/responses/auth.ts

```typescript
import { User } from '../../models/user';

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: User;
  tokens: TokenResponse;
}
```

### 6. Update API Services

Refactor API services to use the new types:

#### src/services/authService.ts

```typescript
import { apiClient } from './apiClient';
import { LoginRequest, RegisterRequest, PasswordResetRequest, PasswordUpdateRequest } from '../types/api/requests/auth';
import { ApiResponse, ErrorResponse } from '../types/api/responses/common';
import { AuthResponse, TokenResponse } from '../types/api/responses/auth';
import { User } from '../types/models/user';

export const authService = {
  login: async (credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    try {
      const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  register: async (userData: RegisterRequest): Promise<ApiResponse<User>> => {
    try {
      const response = await apiClient.post<ApiResponse<User>>('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  refreshToken: async (refreshToken: string): Promise<ApiResponse<TokenResponse>> => {
    try {
      const response = await apiClient.post<ApiResponse<TokenResponse>>('/auth/refresh', { refreshToken });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  resetPassword: async (email: string): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.post<ApiResponse<void>>('/auth/password-reset', { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updatePassword: async (data: PasswordUpdateRequest): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.post<ApiResponse<void>>(`/auth/password-reset/${data.token}`, { password: data.password });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    // Just clear local storage, no API call needed
    localStorage.removeItem('auth_tokens');
    localStorage.removeItem('user');
  }
};
```

### 7. Update WebSocket Service

Refactor WebSocket service to use proper types:

#### src/services/websocketService.ts

```typescript
import { WebSocketEvent, WebSocketNotification, Notification } from '../types/models/notification';

type MessageHandler = (payload: unknown) => void;

export class WebSocketService {
  private socket: WebSocket | null = null;
  private messageHandlers = new Map<string, MessageHandler[]>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  public connect(token: string): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      return;
    }

    this.socket = new WebSocket(`${this.url}?token=${token}`);

    this.socket.onopen = this.handleOpen.bind(this);
    this.socket.onmessage = this.handleMessage.bind(this);
    this.socket.onclose = this.handleClose.bind(this);
    this.socket.onerror = this.handleError.bind(this);
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  public addMessageHandler(type: string, handler: MessageHandler): void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    this.messageHandlers.get(type)?.push(handler);
  }

  public removeMessageHandler(type: string, handler: MessageHandler): void {
    const handlers = this.messageHandlers.get(type);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  public sendMessage(type: string, payload: unknown): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, payload }));
    }
  }

  private handleOpen(event: Event): void {
    console.log('WebSocket connection established');
    this.reconnectAttempts = 0;
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data) as WebSocketEvent;
      const handlers = this.messageHandlers.get(data.type);
      if (handlers) {
        handlers.forEach(handler => handler(data.payload));
      }
    } catch (error) {
      console.error('Error parsing WebSocket message', error);
    }
  }

  private handleClose(event: CloseEvent): void {
    console.log('WebSocket connection closed', event.code, event.reason);
    this.socket = null;

    // Attempt to reconnect
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      setTimeout(() => {
        const token = localStorage.getItem('auth_tokens') 
          ? JSON.parse(localStorage.getItem('auth_tokens') || '{}').accessToken 
          : '';
        if (token) {
          this.connect(token);
        }
      }, delay);
    }
  }

  private handleError(event: Event): void {
    console.error('WebSocket error', event);
  }
}

// Create and export singleton instance
export const websocketService = new WebSocketService(
  import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws'
);
```

### 8. Update State Management with Zustand

Implement typed state management with Zustand:

#### src/types/store/auth.ts

```typescript
import { User } from '../models/user';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  updateUser: (user: Partial<User>) => void;
  clearError: () => void;
}
```

#### src/store/authStore.ts

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState } from '../types/store/auth';
import { authService } from '../services/authService';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login({ email, password });
          const { user, tokens } = response.data;
          localStorage.setItem('auth_tokens', JSON.stringify(tokens));
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Login failed', 
            isLoading: false 
          });
          throw error;
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
          await authService.register({ name, email, password });
          await get().login(email, password);
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Registration failed', 
            isLoading: false 
          });
          throw error;
        }
      },

      logout: () => {
        authService.logout();
        localStorage.removeItem('auth_tokens');
        set({ user: null, isAuthenticated: false });
      },

      refreshToken: async () => {
        try {
          const tokens = JSON.parse(localStorage.getItem('auth_tokens') || '{}');
          if (!tokens.refreshToken) return false;
          
          const response = await authService.refreshToken(tokens.refreshToken);
          localStorage.setItem('auth_tokens', JSON.stringify(response.data));
          return true;
        } catch (error) {
          get().logout();
          return false;
        }
      },

      updateUser: (userData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null
        }));
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
```

### 9. Clean Up Existing Files

1. Update all existing services to use the new types
2. Remove duplicate type definitions
3. Update component prop types

### 10. Update API Client with Axios Interceptors

Enhance the API client with typed interceptors for authentication and error handling:

#### src/services/apiClient.ts

```typescript
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ErrorResponse } from '../types/api/responses/common';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const apiClient: AxiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: AxiosRequestConfig): AxiosRequestConfig => {
    const tokens = JSON.parse(localStorage.getItem('auth_tokens') || '{}');
    if (tokens.accessToken) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${tokens.accessToken}`,
      };
    }
    return config;
  },
  (error: AxiosError): Promise<AxiosError> => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    return response;
  },
  async (error: AxiosError<ErrorResponse>): Promise<any> => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't tried refreshing yet
    if (
      error.response?.status === 401 &&
      !originalRequest?.headers?.['X-Retry']
    ) {
      try {
        // Try to refresh the token
        const tokens = JSON.parse(localStorage.getItem('auth_tokens') || '{}');
        const refreshResponse = await axios.post(
          `${baseURL}/auth/refresh`,
          { refreshToken: tokens.refreshToken }
        );
        
        // If refresh successful, update tokens
        localStorage.setItem('auth_tokens', JSON.stringify(refreshResponse.data.data));
        
        // Retry the original request with new token
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${refreshResponse.data.data.accessToken}`,
          'X-Retry': 'true',
        };
        
        return apiClient(originalRequest);
      } catch (refreshError) {
        // If refresh fails, log out user
        localStorage.removeItem('auth_tokens');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export { apiClient };
```

## Testing Plan

1. Update unit tests to use the new types
2. Test authentication flow with the updated API client
3. Test WebSocket functionality with proper type safety
4. Test state management with Zustand

## Implementation Steps

1. Create centralized type directory structure
2. Implement common API response types
3. Implement core model types
4. Update API client with proper types
5. Update WebSocket service
6. Implement state management with Zustand
7. Clean up existing files
8. Remove vite.config.js and standardize on vite.config.ts

## Expected Benefits

1. Better type safety throughout the application
2. Improved IDE experience with better autocompletion
3. Easier refactoring and maintenance
4. Reduced runtime errors due to type mismatches
5. Better documentation through types
6. More consistent codebase style 
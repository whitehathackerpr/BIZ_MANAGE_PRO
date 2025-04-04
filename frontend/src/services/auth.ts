import api from './api';
import { User } from '../types';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: string;
}

interface ProfileData {
  name?: string;
  email?: string;
  avatar?: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
}

interface ResetPasswordData {
  token: string;
  new_password: string;
}

export const authService = {
  // Login user
  login: async (credentials: LoginCredentials): Promise<{ user: User; token: string }> => {
    const response = await api.post<{ data: { user: User; token: string } }>('/auth/login', credentials);
    return response.data.data;
  },

  // Register new user
  register: async (userData: RegisterData): Promise<{ user: User; token: string }> => {
    const response = await api.post<{ data: { user: User; token: string } }>('/auth/register', userData);
    return response.data.data;
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<{ data: User }>('/auth/me');
    return response.data.data;
  },

  // Update user profile
  updateProfile: async (profileData: ProfileData): Promise<User> => {
    const response = await api.put<{ data: User }>('/auth/update-profile', profileData);
    return response.data.data;
  },

  // Change password
  changePassword: async (passwordData: PasswordData): Promise<void> => {
    await api.post('/auth/change-password', passwordData);
  },

  // Request password reset
  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/auth/reset-password-request', { email });
  },

  // Reset password with token
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await api.post('/auth/reset-password', {
      token,
      new_password: newPassword,
    });
  },

  // Refresh token
  refreshToken: async (): Promise<{ token: string }> => {
    const response = await api.post<{ data: { token: string } }>('/auth/refresh');
    return response.data.data;
  },
}; 
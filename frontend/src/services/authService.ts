import apiClient from './apiClient';
import { User } from '../store/useStore';

// Interface definitions
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
}

export interface RegisterResponse {
  user: User;
  token: string;
}

export interface PasswordChangeData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface ResetPasswordData {
  token: string;
  email: string;
  password: string;
  confirm_password: string;
}

export interface ForgotPasswordData {
  email: string;
}

// Auth service class
class AuthService {
  /**
   * Login a user
   * @param credentials User login credentials (email, password)
   * @returns The logged in user data and JWT token
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    return await apiClient.post<LoginResponse>('/auth/login', credentials);
  }

  /**
   * Register a new user
   * @param userData User registration data
   * @returns The registered user data and JWT token
   */
  async register(userData: RegisterData): Promise<RegisterResponse> {
    return await apiClient.post<RegisterResponse>('/auth/register', userData);
  }

  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    // Remove token from localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    
    // Call logout endpoint to invalidate token on server
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  /**
   * Change password for authenticated user
   * @param passwordData Password change data
   */
  async changePassword(passwordData: PasswordChangeData): Promise<void> {
    await apiClient.post('/auth/change-password', passwordData);
  }

  /**
   * Request password reset
   * @param data Object containing user email
   */
  async forgotPassword(data: ForgotPasswordData): Promise<void> {
    await apiClient.post('/auth/forgot-password', data);
  }

  /**
   * Reset password using token
   * @param data Reset password data including token
   */
  async resetPassword(data: ResetPasswordData): Promise<void> {
    await apiClient.post('/auth/reset-password', data);
  }

  /**
   * Validate auth token
   * @returns True if token is valid
   */
  async validateToken(): Promise<boolean> {
    try {
      await apiClient.get('/auth/verify');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get current user profile
   * @returns User profile data
   */
  async getProfile(): Promise<User> {
    return await apiClient.get<User>('/auth/profile');
  }
}

export const authService = new AuthService();
export default authService; 
import apiClient from './apiClient';
import type { User, LoginCredentials, LoginResponse, RegisterRequest, RegisterResponse, UserRole, Role } from '../types/auth';
import { jwtDecode } from 'jwt-decode';

// Define custom type for ImportMeta.env
interface ImportMetaEnv {
  VITE_API_URL?: string;
  VITE_TOKEN_REFRESH_THRESHOLD?: string;
}

// Get API URL from environment variables or use default
const baseURL = (import.meta.env as ImportMetaEnv).VITE_API_URL || 'http://localhost:8000/api/v1';
const TOKEN_REFRESH_THRESHOLD = parseInt((import.meta.env as ImportMetaEnv).VITE_TOKEN_REFRESH_THRESHOLD || '300', 10); // 5 minutes in seconds

class AuthService {
  private baseUrl = `${baseURL}/auth`;
  private tokenKey = 'token';
  private refreshTokenKey = 'refresh_token';
  private userKey = 'user';

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>(`${this.baseUrl}/login`, credentials);
      this.setSession(response);
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    try {
      console.log('Sending registration request:', data);
      const response = await apiClient.post<RegisterResponse>(`${this.baseUrl}/register`, data);
      console.log('Registration response:', response);
      return response;
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.response?.data?.detail) {
        throw error.response.data.detail;
      }
      throw new Error('Registration failed. Please try again.');
    }
  }

  async logout(): Promise<void> {
    try {
      const token = this.getToken();
      if (token) {
        await apiClient.post(`${this.baseUrl}/logout`, {}, {
          headers: {
            'X-CSRF-Token': this.generateCSRFToken(),
          }
        });
      }
    } finally {
      this.clearSession();
    }
  }

  async getCurrentUser(): Promise<User> {
    await this.checkTokenExpiration();
    const response = await apiClient.get<User>(`${this.baseUrl}/me`);
    return response;
  }

  async refreshToken(): Promise<{ token: string }> {
    const refresh_token = this.getRefreshToken();
    if (!refresh_token) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await apiClient.post<{ token: string }>(`${this.baseUrl}/refresh`, {
        refresh_token,
      }, {
        headers: {
          'X-CSRF-Token': this.generateCSRFToken(),
        }
      });
      
      this.setToken(response.token);
      return response;
    } catch (error) {
      this.clearSession();
      throw error;
    }
  }

  private async checkTokenExpiration(): Promise<void> {
    const token = this.getToken();
    if (!token) return;

    try {
      const decoded = jwtDecode<{ exp: number }>(token);
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (decoded.exp - currentTime < TOKEN_REFRESH_THRESHOLD) {
        await this.refreshToken();
      }
    } catch (error) {
      console.error('Error checking token expiration:', error);
      this.clearSession();
    }
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await apiClient.put<User>(`${this.baseUrl}/profile`, data);
    const currentUser = this.getUser();
    if (currentUser) {
      this.setUser({ ...currentUser, ...response });
    }
    return response;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.put(`${this.baseUrl}/password`, {
      current_password: currentPassword,
      new_password: newPassword,
    });
  }

  async requestPasswordReset(email: string): Promise<void> {
    await apiClient.post(`${this.baseUrl}/reset-password-request`, { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiClient.post(`${this.baseUrl}/reset-password`, {
      token,
      password: newPassword,
    });
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded = jwtDecode<{ exp: number }>(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp > currentTime;
    } catch {
      return false;
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  getUser(): User | null {
    const userStr = localStorage.getItem(this.userKey);
    console.log('Retrieved user from localStorage:', userStr);
    if (!userStr) return null;
    try {
      const parsedUser = JSON.parse(userStr);
      console.log('Parsed user:', parsedUser);
      return parsedUser;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  hasPermission(permission: keyof User['permissions']): boolean {
    const user = this.getUser();
    return user?.permissions?.[permission] || false;
  }

  hasRole(role: UserRole): boolean {
    const user = this.getUser();
    return user?.roles?.some(r => r.name === role) || false;
  }

  private setSession(response: LoginResponse): void {
    console.log('Setting session with response:', response);
    
    if (!response.access_token || !response.refresh_token || !response.user) {
      console.error('Invalid login response: missing tokens or user data');
      throw new Error('Invalid login response');
    }
    
    this.setToken(response.access_token);
    this.setRefreshToken(response.refresh_token);
    this.setUser(response.user);
    
    apiClient.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.access_token}`;
  }

  private clearSession(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
    delete apiClient.axiosInstance.defaults.headers.common['Authorization'];
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private setRefreshToken(token: string): void {
    localStorage.setItem(this.refreshTokenKey, token);
  }

  private setUser(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  private generateCSRFToken(): string {
    // Generate a random token for CSRF protection
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}

export const authService = new AuthService();
export default authService; 
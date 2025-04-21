import apiClient from './apiClient';
import type { User, LoginCredentials, LoginResponse, RegisterRequest, RegisterResponse, UserRole, Role } from '../types/auth';

// Define custom type for ImportMeta.env
interface ImportMetaEnv {
  VITE_API_URL?: string;
}

// Get API URL from environment variables or use default
const baseURL = (import.meta.env as ImportMetaEnv).VITE_API_URL || 'http://localhost:8000/api/v1';

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
      await apiClient.post(`${this.baseUrl}/logout`);
    } finally {
      this.clearSession();
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>(`${this.baseUrl}/me`);
    return response;
  }

  async refreshToken(): Promise<{ token: string }> {
    const refresh_token = localStorage.getItem(this.refreshTokenKey);
    const response = await apiClient.post<{ token: string }>(`${this.baseUrl}/refresh`, {
      refresh_token,
    });
    localStorage.setItem(this.tokenKey, response.token);
    return response;
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
    return !!this.getToken() && !!this.getUser();
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
    
    if (!response.access_token || !response.refresh_token) {
      console.error('Invalid login response: missing tokens');
      throw new Error('Invalid login response');
    }
    
    // Set tokens in localStorage
    localStorage.setItem(this.tokenKey, response.access_token);
    localStorage.setItem(this.refreshTokenKey, response.refresh_token);
    
    // Set authorization header in apiClient
    apiClient.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.access_token}`;
    
    // Ensure user data is properly set
    if (response.user) {
      const userData = {
        id: response.user.id,
        email: response.user.email,
        full_name: response.user.full_name,
        is_active: response.user.is_active,
        is_superuser: response.user.is_superuser,
        created_at: response.user.created_at,
        updated_at: response.user.updated_at,
        roles: response.user.roles || [],
        profile: response.user.profile
      };
      localStorage.setItem(this.userKey, JSON.stringify(userData));
    } else {
      console.error('Invalid login response: missing user data');
      throw new Error('Invalid login response: missing user data');
    }
  }

  private clearSession(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
    delete apiClient.axiosInstance.defaults.headers.common['Authorization'];
  }

  private setUser(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }
}

export const authService = new AuthService();
export default authService; 
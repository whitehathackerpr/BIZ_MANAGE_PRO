import apiClient from './apiClient';
import type { User, LoginCredentials, LoginResponse, RegisterRequest, RegisterResponse } from '../types/auth';

class AuthService {
  private baseUrl = '/auth';
  private tokenKey = 'token';
  private refreshTokenKey = 'refresh_token';
  private userKey = 'user';

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const formattedCredentials = {
      email: credentials.email,
      password: credentials.password
    };
    
    try {
      const response = await apiClient.post<LoginResponse>(`${this.baseUrl}/login`, formattedCredentials);
      this.setSession(response);
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
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
    await apiClient.post(`${this.baseUrl}/forgot-password`, { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiClient.post(`${this.baseUrl}/reset-password`, {
      token,
      password: newPassword,
    });
  }

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    try {
      const formattedData = {
        email: data.email,
        name: data.name,
        password: data.password
      };
      
      const response = await apiClient.post<RegisterResponse>(`${this.baseUrl}/register`, formattedData);
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
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
    return userStr ? JSON.parse(userStr) : null;
  }

  hasPermission(permission: keyof User['permissions']): boolean {
    const user = this.getUser();
    return user?.permissions[permission] || false;
  }

  hasRole(role: User['role']): boolean {
    const user = this.getUser();
    return user?.role === role;
  }

  private setSession(response: LoginResponse): void {
    localStorage.setItem(this.tokenKey, response.token);
    localStorage.setItem(this.refreshTokenKey, response.refresh_token);
    localStorage.setItem(this.userKey, JSON.stringify(response.user));
  }

  private clearSession(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
  }

  private setUser(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }
}

export const authService = new AuthService();
export default authService; 
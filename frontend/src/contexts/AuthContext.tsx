import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import { User } from '../types';

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

interface ProfileData {
  name?: string;
  email?: string;
  avatar?: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (profileData: ProfileData) => Promise<void>;
  changePassword: (passwordData: PasswordData) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  enableBiometric: () => Promise<void>;
  verifyBiometric: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async (): Promise<void> => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const userResponse = await authService.getCurrentUser();
        setUser(userResponse);
      }
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setError(error instanceof Error ? error.message : 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      const { email, password } = credentials;
      const response = await authService.login({ email, password });
      localStorage.setItem('token', response.token);
      setUser(response.user);
      setError(null);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const register = async (userData: RegisterData): Promise<void> => {
    try {
      const { confirmPassword, ...registrationData } = userData;
      const response = await authService.register(registrationData);
      localStorage.setItem('token', response.token);
      setUser(response.user);
      setError(null);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
    setError(null);
    navigate('/login');
  };

  const updateProfile = async (profileData: ProfileData): Promise<void> => {
    try {
      const updatedUser = await authService.updateProfile(profileData);
      setUser(prev => prev ? { ...prev, ...updatedUser } : updatedUser);
      setError(null);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Profile update failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const changePassword = async (passwordData: PasswordData): Promise<void> => {
    try {
      const { confirmPassword, ...passwordChangeData } = passwordData;
      await authService.changePassword(passwordChangeData);
      setError(null);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Password change failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const forgotPassword = async (email: string): Promise<void> => {
    try {
      await authService.forgotPassword(email);
      setError(null);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Password reset request failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    try {
      await authService.resetPassword(token, newPassword);
      setError(null);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Password reset failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const enableBiometric = async (): Promise<void> => {
    try {
      // Here would be the actual implementation to register biometric credentials
      // This is a placeholder - the actual implementation would depend on your biometric library or API
      setError(null);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to enable biometric authentication';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const verifyBiometric = async (): Promise<void> => {
    try {
      // Here would be the actual implementation to verify biometric credentials
      // This is a placeholder - the actual implementation would depend on your biometric library or API
      setError(null);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Biometric verification failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const value: AuthContextProps = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    enableBiometric,
    verifyBiometric,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext; 
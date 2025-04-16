import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { authService } from '../services/authService';
import { User } from '../types/auth';
import { LoginCredentials, RegisterRequest } from '../types/auth';
import { AxiosError } from 'axios';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Initialize auth state on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = authService.getUser();
      if (storedUser && authService.isAuthenticated()) {
        try {
          // Verify the token is still valid by getting current user
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser as User);
        } catch (err) {
          // If token is invalid, clear stored data
          await authService.logout();
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
      setIsInitialized(true);
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.login(credentials);
      setUser(response.user as User);
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        setError(err.response.data.message || 'Login failed. Please check your credentials.');
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterRequest): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.register(userData);
      setUser(response.user as User);
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        setError(err.response.data.message || 'Registration failed. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    
    try {
      await authService.logout();
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearError = (): void => {
    setError(null);
  };

  // Don't render children until auth is initialized to prevent flashing content
  if (!isInitialized) {
    return <div className="auth-loading">Initializing application...</div>;
  }

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 
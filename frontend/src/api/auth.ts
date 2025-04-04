import api from './api';

// Mock user data
const mockUser = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  avatar: 'https://via.placeholder.com/150',
};

// API endpoints
export const authApi = {
  getCurrentUser: async () => {
    try {
      const response = await api.get('/api/auth/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  },

  login: async (credentials) => {
    try {
      const response = await api.post('/api/auth/login', credentials);
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/api/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    delete api.defaults.headers.common['Authorization'];
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      // Get current token for header
      const currentToken = localStorage.getItem('token');
      api.defaults.headers.common['Authorization'] = `Bearer ${refreshToken}`;
      
      const response = await api.post('/api/auth/refresh');
      const { access_token, refresh_token } = response.data;
      
      localStorage.setItem('token', access_token);
      if (refresh_token) {
        localStorage.setItem('refresh_token', refresh_token);
      }
      
      // Reset authorization header with new token
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      return response.data;
    } catch (error) {
      console.error('Token refresh error:', error);
      // If refresh fails, log the user out
      this.logout();
      throw error;
    }
  }
}; 
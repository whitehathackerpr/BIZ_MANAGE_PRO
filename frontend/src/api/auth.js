import api from './api';

// Mock user data
const mockUser = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  avatar: 'https://via.placeholder.com/150',
};

// Mock auth API
export const authApi = {
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  login: async (credentials) => {
    // In a real app, this would make an API call
    // For now, we'll just simulate a successful login
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.setItem('user', JSON.stringify(mockUser));
        resolve({ user: mockUser });
      }, 1000);
    });
  },

  register: async (userData) => {
    // In a real app, this would make an API call
    // For now, we'll just simulate a successful registration
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 1000);
    });
  },

  logout: () => {
    localStorage.removeItem('user');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
}; 
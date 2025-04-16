/**
 * User-related type definitions
 */

/**
 * User entity from the API
 */
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

/**
 * User preferences for application settings
 */
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
}

/**
 * Login credentials
 */
export interface UserCredentials {
  email: string;
  password: string;
}

/**
 * Registration data
 */
export interface UserRegistration {
  email: string;
  name: string;
  password: string;
}

/**
 * User profile update data
 */
export interface UserUpdate {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  company?: string;
  position?: string;
} 
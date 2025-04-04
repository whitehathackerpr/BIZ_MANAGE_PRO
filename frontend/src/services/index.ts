// Export API client
import apiClient from './apiClient';

// Import services
import authService, {
  LoginCredentials,
  LoginResponse,
  RegisterData,
  RegisterResponse,
  PasswordChangeData,
  ResetPasswordData,
  ForgotPasswordData
} from './authService';

import userService, {
  ProfileUpdateData,
  UserSettings,
  PreferencesData
} from './userService';

// Export services
export {
  apiClient,
  authService,
  userService
};

// Export types
export type {
  // Auth types
  LoginCredentials,
  LoginResponse,
  RegisterData,
  RegisterResponse,
  PasswordChangeData,
  ResetPasswordData,
  ForgotPasswordData,
  
  // User types
  ProfileUpdateData,
  UserSettings,
  PreferencesData
}; 
import apiClient from './apiClient';
import { User } from '../store/useStore';

// Interface definitions
export interface ProfileUpdateData {
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string | File;
  bio?: string;
}

export interface UserSettings {
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  theme: 'light' | 'dark';
  display_currency: string;
}

export interface PreferencesData {
  settings?: Partial<UserSettings>;
}

// User service class
class UserService {
  /**
   * Get current user profile
   * @returns User profile data
   */
  async getProfile(): Promise<User> {
    return await apiClient.get<User>('/users/profile');
  }

  /**
   * Update user profile
   * @param profileData Profile data to update
   * @returns Updated user data
   */
  async updateProfile(profileData: ProfileUpdateData): Promise<User> {
    // Handle file uploads using FormData
    if (profileData.avatar && profileData.avatar instanceof File) {
      const formData = new FormData();
      
      Object.entries(profileData).forEach(([key, value]) => {
        if (value !== undefined) {
          if (key === 'avatar' && value instanceof File) {
            formData.append(key, value);
          } else if (typeof value === 'string') {
            formData.append(key, value);
          }
        }
      });
      
      return await apiClient.put<User>('/users/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    }
    
    // Regular JSON request for non-file updates
    return await apiClient.put<User>('/users/profile', profileData);
  }

  /**
   * Get user settings
   * @returns User settings
   */
  async getSettings(): Promise<UserSettings> {
    return await apiClient.get<UserSettings>('/users/settings');
  }

  /**
   * Update user settings
   * @param settingsData Settings data to update
   * @returns Updated settings
   */
  async updateSettings(settingsData: Partial<UserSettings>): Promise<UserSettings> {
    return await apiClient.put<UserSettings>('/users/settings', settingsData);
  }

  /**
   * Get user activity log
   * @param page Page number for pagination
   * @param limit Number of results per page
   * @returns Activity log entries
   */
  async getActivityLog(page = 1, limit = 10): Promise<{ items: any[], total: number }> {
    return await apiClient.get('/users/activity', {
      params: { page, limit }
    });
  }

  /**
   * Delete user account
   * @param password Current password for verification
   */
  async deleteAccount(password: string): Promise<void> {
    await apiClient.post('/users/delete-account', { password });
  }
}

export const userService = new UserService();
export default userService; 
import { apiService } from './api';

export interface AppSettings {
  general: {
    siteName: string;
    siteDescription: string;
    contactEmail: string;
    timezone: string;
    dateFormat: string;
    timeFormat: string;
    currency: string;
    language: string;
  };
  security: {
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
    };
    sessionTimeout: number;
    maxLoginAttempts: number;
    twoFactorAuth: {
      enabled: boolean;
      required: boolean;
    };
  };
  email: {
    provider: string;
    fromName: string;
    fromEmail: string;
    smtp: {
      host: string;
      port: number;
      username: string;
      password: string;
      encryption: string;
    };
  };
  storage: {
    provider: string;
    s3: {
      bucket: string;
      region: string;
      accessKey: string;
      secretKey: string;
    };
    local: {
      path: string;
    };
  };
  notifications: {
    email: boolean;
    push: boolean;
    webhook: boolean;
    webhookUrl: string;
  };
}

export const settingsService = {
  getSettings: async (): Promise<AppSettings> => {
    const response = await apiService.get<AppSettings>('/settings');
    return response.data;
  },

  updateSettings: async (settings: Partial<AppSettings>): Promise<AppSettings> => {
    const response = await apiService.put<AppSettings>('/settings', settings);
    return response.data;
  },

  getGeneralSettings: async (): Promise<AppSettings['general']> => {
    const response = await apiService.get<AppSettings['general']>('/settings/general');
    return response.data;
  },

  updateGeneralSettings: async (settings: Partial<AppSettings['general']>): Promise<AppSettings['general']> => {
    const response = await apiService.put<AppSettings['general']>('/settings/general', settings);
    return response.data;
  },

  getSecuritySettings: async (): Promise<AppSettings['security']> => {
    const response = await apiService.get<AppSettings['security']>('/settings/security');
    return response.data;
  },

  updateSecuritySettings: async (settings: Partial<AppSettings['security']>): Promise<AppSettings['security']> => {
    const response = await apiService.put<AppSettings['security']>('/settings/security', settings);
    return response.data;
  },

  getEmailSettings: async (): Promise<AppSettings['email']> => {
    const response = await apiService.get<AppSettings['email']>('/settings/email');
    return response.data;
  },

  updateEmailSettings: async (settings: Partial<AppSettings['email']>): Promise<AppSettings['email']> => {
    const response = await apiService.put<AppSettings['email']>('/settings/email', settings);
    return response.data;
  },

  getStorageSettings: async (): Promise<AppSettings['storage']> => {
    const response = await apiService.get<AppSettings['storage']>('/settings/storage');
    return response.data;
  },

  updateStorageSettings: async (settings: Partial<AppSettings['storage']>): Promise<AppSettings['storage']> => {
    const response = await apiService.put<AppSettings['storage']>('/settings/storage', settings);
    return response.data;
  },

  getNotificationSettings: async (): Promise<AppSettings['notifications']> => {
    const response = await apiService.get<AppSettings['notifications']>('/settings/notifications');
    return response.data;
  },

  updateNotificationSettings: async (settings: Partial<AppSettings['notifications']>): Promise<AppSettings['notifications']> => {
    const response = await apiService.put<AppSettings['notifications']>('/settings/notifications', settings);
    return response.data;
  },

  testEmailSettings: async (): Promise<{ success: boolean; message: string }> => {
    const response = await apiService.post<{ success: boolean; message: string }>('/settings/email/test');
    return response.data;
  },

  testStorageSettings: async (): Promise<{ success: boolean; message: string }> => {
    const response = await apiService.post<{ success: boolean; message: string }>('/settings/storage/test');
    return response.data;
  },

  testWebhookSettings: async (): Promise<{ success: boolean; message: string }> => {
    const response = await apiService.post<{ success: boolean; message: string }>('/settings/notifications/test-webhook');
    return response.data;
  },
}; 
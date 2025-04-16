import apiClient from './apiClient';
import type {
  BusinessSettings,
  SystemSettings,
  EmailSettings,
  StorageSettings,
  BackupSettings,
} from '../types/settings';

class SettingsService {
  private baseUrl = '/settings';

  async getBusinessSettings(): Promise<BusinessSettings> {
    return apiClient.get(`${this.baseUrl}/business`);
  }

  async updateBusinessSettings(settings: Partial<BusinessSettings>): Promise<BusinessSettings> {
    return apiClient.put(`${this.baseUrl}/business`, settings);
  }

  async getSystemSettings(): Promise<SystemSettings> {
    return apiClient.get(`${this.baseUrl}/system`);
  }

  async updateSystemSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
    return apiClient.put(`${this.baseUrl}/system`, settings);
  }

  async getEmailSettings(): Promise<EmailSettings> {
    return apiClient.get(`${this.baseUrl}/email`);
  }

  async updateEmailSettings(settings: Partial<EmailSettings>): Promise<EmailSettings> {
    return apiClient.put(`${this.baseUrl}/email`, settings);
  }

  async testEmailSettings(settings: EmailSettings): Promise<{ success: boolean; message: string }> {
    return apiClient.post(`${this.baseUrl}/email/test`, settings);
  }

  async getStorageSettings(): Promise<StorageSettings> {
    return apiClient.get(`${this.baseUrl}/storage`);
  }

  async updateStorageSettings(settings: Partial<StorageSettings>): Promise<StorageSettings> {
    return apiClient.put(`${this.baseUrl}/storage`, settings);
  }

  async testStorageConnection(settings: StorageSettings): Promise<{ success: boolean; message: string }> {
    return apiClient.post(`${this.baseUrl}/storage/test`, settings);
  }

  async getBackupSettings(): Promise<BackupSettings> {
    return apiClient.get(`${this.baseUrl}/backup`);
  }

  async updateBackupSettings(settings: Partial<BackupSettings>): Promise<BackupSettings> {
    return apiClient.put(`${this.baseUrl}/backup`, settings);
  }

  async triggerBackup(): Promise<{ success: boolean; message: string }> {
    return apiClient.post(`${this.baseUrl}/backup/trigger`);
  }

  async getBackupHistory(): Promise<Array<{ id: string; date: string; size: number; status: string }>> {
    return apiClient.get(`${this.baseUrl}/backup/history`);
  }

  async restoreBackup(backupId: string): Promise<{ success: boolean; message: string }> {
    return apiClient.post(`${this.baseUrl}/backup/restore/${backupId}`);
  }

  async uploadLogo(file: File): Promise<{ logo_url: string }> {
    const formData = new FormData();
    formData.append('logo', file);
    return apiClient.post(`${this.baseUrl}/business/logo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async deleteLogo(): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/business/logo`);
  }
}

export const settingsService = new SettingsService();
export default settingsService; 
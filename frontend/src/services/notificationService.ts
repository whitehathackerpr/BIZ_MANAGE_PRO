import apiClient from './apiClient';
import type { Notification, NotificationPreferences, NotificationStats } from '../types/notification';

class NotificationService {
  private baseUrl = '/notifications';

  async getAll(params?: Record<string, any>): Promise<Notification[]> {
    return apiClient.get(this.baseUrl, { params });
  }

  async getUnread(): Promise<Notification[]> {
    return apiClient.get(`${this.baseUrl}/unread`);
  }

  async markAsRead(id: string): Promise<Notification> {
    return apiClient.put(`${this.baseUrl}/${id}/read`);
  }

  async markAllAsRead(): Promise<void> {
    return apiClient.put(`${this.baseUrl}/read-all`);
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }

  async deleteAll(): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/all`);
  }

  async getPreferences(): Promise<NotificationPreferences> {
    return apiClient.get(`${this.baseUrl}/preferences`);
  }

  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    return apiClient.put(`${this.baseUrl}/preferences`, preferences);
  }

  async getStats(): Promise<NotificationStats> {
    return apiClient.get(`${this.baseUrl}/stats`);
  }

  async create(notification: Omit<Notification, 'id' | 'created_at' | 'read'>): Promise<Notification> {
    return apiClient.post(this.baseUrl, notification);
  }

  async getByType(type: string): Promise<Notification[]> {
    return apiClient.get(`${this.baseUrl}/type/${type}`);
  }

  async getByPriority(priority: Notification['priority']): Promise<Notification[]> {
    return apiClient.get(`${this.baseUrl}/priority/${priority}`);
  }
}

export const notificationService = new NotificationService();
export default notificationService; 
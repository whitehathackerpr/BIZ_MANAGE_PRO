import { apiService } from './api';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  data?: Record<string, any>;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  marketing: boolean;
}

export const notificationService = {
  getNotifications: async (params?: {
    page?: number;
    limit?: number;
    read?: boolean;
  }): Promise<{
    items: Notification[];
    total: number;
    page: number;
    limit: number;
  }> => {
    const response = await apiService.get('/notifications', { params });
    return response.data;
  },

  markAsRead: async (id: string): Promise<Notification> => {
    const response = await apiService.put<Notification>(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async (): Promise<void> => {
    await apiService.put('/notifications/read-all');
  },

  deleteNotification: async (id: string): Promise<void> => {
    await apiService.delete(`/notifications/${id}`);
  },

  deleteAllNotifications: async (): Promise<void> => {
    await apiService.delete('/notifications');
  },

  getPreferences: async (): Promise<NotificationPreferences> => {
    const response = await apiService.get<NotificationPreferences>('/notifications/preferences');
    return response.data;
  },

  updatePreferences: async (preferences: NotificationPreferences): Promise<NotificationPreferences> => {
    const response = await apiService.put<NotificationPreferences>('/notifications/preferences', preferences);
    return response.data;
  },

  subscribeToPush: async (subscription: PushSubscription): Promise<void> => {
    await apiService.post('/notifications/push/subscribe', {
      endpoint: subscription.endpoint,
      keys: subscription.toJSON().keys,
    });
  },

  unsubscribeFromPush: async (endpoint: string): Promise<void> => {
    await apiService.delete(`/notifications/push/subscribe/${endpoint}`);
  },

  getPushSubscriptions: async (): Promise<Array<{
    endpoint: string;
    createdAt: string;
  }>> => {
    const response = await apiService.get('/notifications/push/subscriptions');
    return response.data;
  },
}; 
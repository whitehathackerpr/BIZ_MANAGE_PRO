import api from '../../api';

export interface Notification {
  id: number;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  created_at: string;
  user_id: number;
}

export const fetchNotifications = async (): Promise<Notification[]> => {
  const res = await api.get<Notification[]>('/notifications');
  return res.data;
};

export const markNotificationRead = async (id: number): Promise<Notification> => {
  const res = await api.patch<Notification>(`/notifications/${id}/read`);
  return res.data;
};

export const deleteNotification = async (id: number): Promise<Notification> => {
  const res = await api.delete<Notification>(`/notifications/${id}`);
  return res.data;
}; 
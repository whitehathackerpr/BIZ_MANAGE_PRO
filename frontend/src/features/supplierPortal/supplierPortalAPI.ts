import api from '../../api';

export interface SupplierProfile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
}

export interface SupplierOrder {
  id: number;
  order_number: string;
  date: string;
  status: string;
  total: number;
}

export interface SupplierFeedback {
  message: string;
  date: string;
}

export interface SupplierLoyalty {
  points: number;
  tier: string;
}

export interface SupplierMessage {
  id: number;
  sender: string;
  recipient: string;
  content: string;
  timestamp: string;
}

export interface SupplierAnalytics {
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  recentActivity: string[];
}

export interface SupplierNotification {
  id: number;
  message: string;
  read: boolean;
  timestamp: string;
}

export const getSupplierProfile = async (): Promise<SupplierProfile> => {
  const res = await api.get<SupplierProfile>('/supplier-portal/profile');
  return res.data;
};

export const getSupplierOrderHistory = async (): Promise<SupplierOrder[]> => {
  const res = await api.get<SupplierOrder[]>('/supplier-portal/orders');
  return res.data;
};

export const submitSupplierFeedback = async (message: string): Promise<{ success: boolean }> => {
  const res = await api.post('/supplier-portal/feedback', { message });
  return res.data;
};

export const getSupplierLoyalty = async (): Promise<SupplierLoyalty> => {
  const res = await api.get<SupplierLoyalty>('/supplier-portal/loyalty');
  return res.data;
};

export const getSupplierMessages = async (): Promise<SupplierMessage[]> => {
  const res = await api.get<SupplierMessage[]>('/supplier-portal/messages');
  return res.data;
};

export const sendSupplierMessage = async (content: string): Promise<{ success: boolean }> => {
  const res = await api.post('/supplier-portal/messages', { content });
  return res.data;
};

export const getSupplierAnalytics = async (): Promise<SupplierAnalytics> => {
  const res = await api.get<SupplierAnalytics>('/supplier-portal/analytics');
  return res.data;
};

export const getSupplierNotifications = async (): Promise<SupplierNotification[]> => {
  const res = await api.get<SupplierNotification[]>('/supplier-portal/notifications');
  return res.data;
}; 
import api from '../../api';

export interface CustomerProfile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface CustomerOrder {
  id: number;
  order_number: string;
  date: string;
  status: string;
  total: number;
}

export interface CustomerFeedback {
  message: string;
  date: string;
}

export interface CustomerLoyalty {
  points: number;
  tier: string;
}

export interface CustomerMessage {
  id: number;
  sender: string;
  recipient: string;
  content: string;
  timestamp: string;
}

export interface CustomerAnalytics {
  totalOrders: number;
  totalSpent: number;
  avgOrderValue: number;
  recentActivity: string[];
}

export interface CustomerNotification {
  id: number;
  message: string;
  read: boolean;
  timestamp: string;
}

export const getCustomerProfile = async (): Promise<CustomerProfile> => {
  const res = await api.get<CustomerProfile>('/customer-portal/profile');
  return res.data;
};

export const getCustomerOrderHistory = async (): Promise<CustomerOrder[]> => {
  const res = await api.get<CustomerOrder[]>('/customer-portal/orders');
  return res.data;
};

export const submitCustomerFeedback = async (message: string): Promise<{ success: boolean }> => {
  const res = await api.post('/customer-portal/feedback', { message });
  return res.data;
};

export const getCustomerLoyalty = async (): Promise<CustomerLoyalty> => {
  const res = await api.get<CustomerLoyalty>('/customer-portal/loyalty');
  return res.data;
};

export const getCustomerMessages = async (): Promise<CustomerMessage[]> => {
  const res = await api.get<CustomerMessage[]>('/customer-portal/messages');
  return res.data;
};

export const sendCustomerMessage = async (content: string): Promise<{ success: boolean }> => {
  const res = await api.post('/customer-portal/messages', { content });
  return res.data;
};

export const getCustomerAnalytics = async (): Promise<CustomerAnalytics> => {
  const res = await api.get<CustomerAnalytics>('/customer-portal/analytics');
  return res.data;
};

export const getCustomerNotifications = async (): Promise<CustomerNotification[]> => {
  const res = await api.get<CustomerNotification[]>('/customer-portal/notifications');
  return res.data;
}; 
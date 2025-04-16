export interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  created_at: string;
  data?: Record<string, any>;
  priority: 'low' | 'medium' | 'high';
  action_url?: string;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  categories: {
    sales: boolean;
    inventory: boolean;
    orders: boolean;
    system: boolean;
  };
}

export interface NotificationStats {
  total: number;
  unread: number;
  by_type: Record<string, number>;
  by_priority: {
    low: number;
    medium: number;
    high: number;
  };
} 
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  role: string;
  created_at: string;
}

interface UserProfileUpdateData {
  name?: string;
  email?: string;
  phone?: string;
}

interface BusinessSettings {
  name: string;
  logo?: string;
  address?: string;
  phone?: string;
  email?: string;
  tax_id?: string;
  currency: string;
  timezone: string;
  business_hours?: {
    [day: string]: { open: string; close: string; closed: boolean };
  };
}

interface SystemSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  date_format: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  security: {
    two_factor_enabled: boolean;
    session_timeout: number;
    password_expiry_days: number;
  };
}

// User Profile
export const getUserProfile = async (): Promise<UserProfile> => {
  const response = await axios.get<{ data: UserProfile }>(`${API_URL}/settings/users/me`);
  return response.data.data;
};

export const updateUserProfile = async (data: UserProfileUpdateData): Promise<UserProfile> => {
  const response = await axios.put<{ data: UserProfile }>(`${API_URL}/settings/users/me`, data);
  return response.data.data;
};

export const uploadAvatar = async (file: File): Promise<{ avatar: string }> => {
  const formData = new FormData();
  formData.append('avatar', file);
  
  const response = await axios.post<{ data: { avatar: string } }>(`${API_URL}/settings/users/avatar`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.data;
};

// Business Settings
export const getBusinessSettings = async (): Promise<BusinessSettings> => {
  const response = await axios.get<{ data: BusinessSettings }>(`${API_URL}/settings/business`);
  return response.data.data;
};

export const updateBusinessSettings = async (data: Partial<BusinessSettings>): Promise<BusinessSettings> => {
  const response = await axios.put<{ data: BusinessSettings }>(`${API_URL}/settings/business`, data);
  return response.data.data;
};

// System Settings
export const getSystemSettings = async (): Promise<SystemSettings> => {
  const response = await axios.get<{ data: SystemSettings }>(`${API_URL}/settings/system`);
  return response.data.data;
};

export const updateSystemSettings = async (data: Partial<SystemSettings>): Promise<SystemSettings> => {
  const response = await axios.put<{ data: SystemSettings }>(`${API_URL}/settings/system`, data);
  return response.data.data;
};

// Account Management
export const deleteAccount = async (): Promise<{ message: string }> => {
  const response = await axios.delete<{ data: { message: string } }>(`${API_URL}/settings/users/me`);
  return response.data.data;
}; 
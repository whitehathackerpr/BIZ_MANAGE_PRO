import api from '../../api';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  created_at: string;
  updated_at?: string;
}

export interface UserProfileUpdate {
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

export const fetchProfile = async (): Promise<UserProfile> => {
  const res = await api.get<UserProfile>('/profile');
  return res.data;
};

export const updateProfile = async (data: UserProfileUpdate): Promise<UserProfile> => {
  const res = await api.put<UserProfile>('/profile', data);
  return res.data;
};

export const uploadAvatar = async (formData: FormData): Promise<{ avatar: string }> => {
  const res = await api.post<{ avatar: string }>('/profile/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}; 
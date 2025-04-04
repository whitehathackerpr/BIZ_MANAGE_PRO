import axios from 'axios';
import { API_BASE_URL } from '../config';
import { User } from '../types';

interface UserData {
  name: string;
  email: string;
  password?: string;
  role?: string;
  status?: 'active' | 'inactive';
}

interface ProfileData {
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  address?: string;
}

const userApi = {
    getUsers: async (): Promise<User[]> => {
        const response = await axios.get<{ data: User[] }>(`${API_BASE_URL}/api/users`);
        return response.data.data;
    },

    getUser: async (id: string): Promise<User> => {
        const response = await axios.get<{ data: User }>(`${API_BASE_URL}/api/users/${id}`);
        return response.data.data;
    },

    createUser: async (userData: UserData): Promise<User> => {
        const response = await axios.post<{ data: User }>(`${API_BASE_URL}/api/users`, userData);
        return response.data.data;
    },

    updateUser: async (id: string, userData: Partial<UserData>): Promise<User> => {
        const response = await axios.put<{ data: User }>(`${API_BASE_URL}/api/users/${id}`, userData);
        return response.data.data;
    },

    deleteUser: async (id: string): Promise<{ message: string }> => {
        const response = await axios.delete<{ message: string }>(`${API_BASE_URL}/api/users/${id}`);
        return response.data;
    },

    updateUserStatus: async (id: string, status: 'active' | 'inactive'): Promise<User> => {
        const response = await axios.patch<{ data: User }>(`${API_BASE_URL}/api/users/${id}/status`, { status });
        return response.data.data;
    },

    updateUserRole: async (id: string, role: string): Promise<User> => {
        const response = await axios.patch<{ data: User }>(`${API_BASE_URL}/api/users/${id}/role`, { role });
        return response.data.data;
    },

    getUserProfile: async (): Promise<User> => {
        const response = await axios.get<{ data: User }>(`${API_BASE_URL}/api/users/profile`);
        return response.data.data;
    },

    updateUserProfile: async (profileData: ProfileData): Promise<User> => {
        const response = await axios.put<{ data: User }>(`${API_BASE_URL}/api/users/profile`, profileData);
        return response.data.data;
    }
};

export default userApi; 
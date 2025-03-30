import axios from 'axios';
import { API_BASE_URL } from '../config';

const userApi = {
    getUsers: async () => {
        const response = await axios.get(`${API_BASE_URL}/api/users`);
        return response.data;
    },

    getUser: async (id) => {
        const response = await axios.get(`${API_BASE_URL}/api/users/${id}`);
        return response.data;
    },

    createUser: async (userData) => {
        const response = await axios.post(`${API_BASE_URL}/api/users`, userData);
        return response.data;
    },

    updateUser: async (id, userData) => {
        const response = await axios.put(`${API_BASE_URL}/api/users/${id}`, userData);
        return response.data;
    },

    deleteUser: async (id) => {
        const response = await axios.delete(`${API_BASE_URL}/api/users/${id}`);
        return response.data;
    },

    updateUserStatus: async (id, status) => {
        const response = await axios.patch(`${API_BASE_URL}/api/users/${id}/status`, { status });
        return response.data;
    },

    updateUserRole: async (id, role) => {
        const response = await axios.patch(`${API_BASE_URL}/api/users/${id}/role`, { role });
        return response.data;
    },

    getUserProfile: async () => {
        const response = await axios.get(`${API_BASE_URL}/api/users/profile`);
        return response.data;
    },

    updateUserProfile: async (profileData) => {
        const response = await axios.put(`${API_BASE_URL}/api/users/profile`, profileData);
        return response.data;
    }
};

export default userApi; 
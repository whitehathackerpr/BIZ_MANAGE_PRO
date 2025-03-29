import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// User Profile
export const getUserProfile = async () => {
  const response = await axios.get(`${API_URL}/settings/users/me`);
  return response.data;
};

export const updateUserProfile = async (data) => {
  const response = await axios.put(`${API_URL}/settings/users/me`, data);
  return response.data;
};

export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  
  const response = await axios.post(`${API_URL}/settings/users/avatar`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Business Settings
export const getBusinessSettings = async () => {
  const response = await axios.get(`${API_URL}/settings/business`);
  return response.data;
};

export const updateBusinessSettings = async (data) => {
  const response = await axios.put(`${API_URL}/settings/business`, data);
  return response.data;
};

// System Settings
export const getSystemSettings = async () => {
  const response = await axios.get(`${API_URL}/settings/system`);
  return response.data;
};

export const updateSystemSettings = async (data) => {
  const response = await axios.put(`${API_URL}/settings/system`, data);
  return response.data;
};

// Account Management
export const deleteAccount = async () => {
  const response = await axios.delete(`${API_URL}/settings/users/me`);
  return response.data;
}; 
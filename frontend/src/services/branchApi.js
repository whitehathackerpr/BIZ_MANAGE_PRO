import axios from 'axios';
import { API_BASE_URL } from '../config';

const branchApi = {
    getBranches: async () => {
        const response = await axios.get(`${API_BASE_URL}/api/branches`);
        return response.data;
    },

    getBranch: async (id) => {
        const response = await axios.get(`${API_BASE_URL}/api/branches/${id}`);
        return response.data;
    },

    createBranch: async (branchData) => {
        const response = await axios.post(`${API_BASE_URL}/api/branches`, branchData);
        return response.data;
    },

    updateBranch: async (id, branchData) => {
        const response = await axios.put(`${API_BASE_URL}/api/branches/${id}`, branchData);
        return response.data;
    },

    deleteBranch: async (id) => {
        const response = await axios.delete(`${API_BASE_URL}/api/branches/${id}`);
        return response.data;
    },

    getBranchPerformance: async (id) => {
        const response = await axios.get(`${API_BASE_URL}/api/branches/${id}/performance`);
        return response.data;
    },

    getBranchInventory: async (id) => {
        const response = await axios.get(`${API_BASE_URL}/api/branches/${id}/inventory`);
        return response.data;
    },

    getBranchEmployees: async (id) => {
        const response = await axios.get(`${API_BASE_URL}/api/branches/${id}/employees`);
        return response.data;
    }
};

export default branchApi; 
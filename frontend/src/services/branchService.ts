import api from './api';
import { Branch, Employee, Product, Sale } from '../types';

interface BranchData {
    name: string;
    address: string;
    phone: string;
    email: string;
    manager_id?: string;
    status?: 'active' | 'inactive';
}

const branchService = {
    getBranches: async (page = 1): Promise<{ data: Branch[]; total: number }> => {
        const response = await api.get<{ data: Branch[]; total: number }>(`/branches?page=${page}`);
        return response.data;
    },

    getBranch: async (id: string): Promise<Branch> => {
        const response = await api.get<{ data: Branch }>(`/branches/${id}`);
        return response.data.data;
    },

    createBranch: async (branchData: BranchData): Promise<Branch> => {
        const response = await api.post<{ data: Branch }>('/branches', branchData);
        return response.data.data;
    },

    updateBranch: async (id: string, branchData: Partial<BranchData>): Promise<Branch> => {
        const response = await api.put<{ data: Branch }>(`/branches/${id}`, branchData);
        return response.data.data;
    },

    deleteBranch: async (id: string): Promise<void> => {
        await api.delete(`/branches/${id}`);
    },

    getBranchEmployees: async (id: string): Promise<{ data: Employee[]; total: number }> => {
        const response = await api.get<{ data: Employee[]; total: number }>(`/branches/${id}/employees`);
        return response.data;
    },

    getBranchProducts: async (id: string): Promise<{ data: Product[]; total: number }> => {
        const response = await api.get<{ data: Product[]; total: number }>(`/branches/${id}/products`);
        return response.data;
    },

    getBranchSales: async (id: string): Promise<{ data: Sale[]; total: number }> => {
        const response = await api.get<{ data: Sale[]; total: number }>(`/branches/${id}/sales`);
        return response.data;
    },
};

export default branchService; 
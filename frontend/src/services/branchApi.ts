import axios from 'axios';
import { API_CONFIG } from '../config';
import { Branch, Employee, Product } from '../types';

interface BranchData {
    name: string;
    address: string;
    phone: string;
    email: string;
    manager_id?: string;
    status?: 'active' | 'inactive';
}

interface BranchPerformance {
    sales: number;
    revenue: number;
    customers: number;
    orders: number;
    time_period: string;
    comparison?: {
        sales: number;
        revenue: number;
        customers: number;
        orders: number;
    };
}

interface BranchInventoryItem extends Product {
    stock_level: 'low' | 'medium' | 'high';
    last_restock_date: string;
}

const branchApi = {
    getBranches: async (): Promise<Branch[]> => {
        const response = await axios.get<{ data: Branch[] }>(`${API_CONFIG.BASE_URL}/api/branches`);
        return response.data.data;
    },

    getBranch: async (id: string): Promise<Branch> => {
        const response = await axios.get<{ data: Branch }>(`${API_CONFIG.BASE_URL}/api/branches/${id}`);
        return response.data.data;
    },

    createBranch: async (branchData: BranchData): Promise<Branch> => {
        const response = await axios.post<{ data: Branch }>(`${API_CONFIG.BASE_URL}/api/branches`, branchData);
        return response.data.data;
    },

    updateBranch: async (id: string, branchData: Partial<BranchData>): Promise<Branch> => {
        const response = await axios.put<{ data: Branch }>(`${API_CONFIG.BASE_URL}/api/branches/${id}`, branchData);
        return response.data.data;
    },

    deleteBranch: async (id: string): Promise<{ message: string }> => {
        const response = await axios.delete<{ message: string }>(`${API_CONFIG.BASE_URL}/api/branches/${id}`);
        return response.data;
    },

    getBranchPerformance: async (id: string): Promise<BranchPerformance> => {
        const response = await axios.get<{ data: BranchPerformance }>(`${API_CONFIG.BASE_URL}/api/branches/${id}/performance`);
        return response.data.data;
    },

    getBranchInventory: async (id: string): Promise<BranchInventoryItem[]> => {
        const response = await axios.get<{ data: BranchInventoryItem[] }>(`${API_CONFIG.BASE_URL}/api/branches/${id}/inventory`);
        return response.data.data;
    },

    getBranchEmployees: async (id: string): Promise<Employee[]> => {
        const response = await axios.get<{ data: Employee[] }>(`${API_CONFIG.BASE_URL}/api/branches/${id}/employees`);
        return response.data.data;
    }
};

export default branchApi; 
import api from './api';
import { Employee } from '../types';

interface EmployeeData {
    name: string;
    email: string;
    phone: string;
    role: string;
    branch_id: string;
    status?: 'active' | 'inactive';
}

const employeeService = {
    getEmployees: async (page = 1): Promise<{ data: Employee[]; total: number }> => {
        const response = await api.get<{ data: Employee[]; total: number }>(`/employees?page=${page}`);
        return response.data;
    },

    getEmployee: async (id: string): Promise<Employee> => {
        const response = await api.get<{ data: Employee }>(`/employees/${id}`);
        return response.data.data;
    },

    createEmployee: async (employeeData: EmployeeData): Promise<Employee> => {
        const response = await api.post<{ data: Employee }>('/employees', employeeData);
        return response.data.data;
    },

    updateEmployee: async (id: string, employeeData: Partial<EmployeeData>): Promise<Employee> => {
        const response = await api.put<{ data: Employee }>(`/employees/${id}`, employeeData);
        return response.data.data;
    },

    deleteEmployee: async (id: string): Promise<void> => {
        await api.delete(`/employees/${id}`);
    },
};

export default employeeService; 
import apiClient from './apiClient';
import type { Employee, EmployeeAttendance, EmployeeLeave, EmployeePerformance } from '../types/employee';

class EmployeeService {
  private baseUrl = '/employees';

  async getAll(params?: Record<string, any>): Promise<Employee[]> {
    return apiClient.get(this.baseUrl, { params });
  }

  async getById(id: string): Promise<Employee> {
    return apiClient.get(`${this.baseUrl}/${id}`);
  }

  async create(employee: Omit<Employee, 'id'>): Promise<Employee> {
    return apiClient.post(this.baseUrl, employee);
  }

  async update(id: string, employee: Partial<Employee>): Promise<Employee> {
    return apiClient.put(`${this.baseUrl}/${id}`, employee);
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }

  async getAttendance(id: string, params?: Record<string, any>): Promise<EmployeeAttendance[]> {
    return apiClient.get(`${this.baseUrl}/${id}/attendance`, { params });
  }

  async recordAttendance(id: string, attendance: Omit<EmployeeAttendance, 'id' | 'employee_id'>): Promise<EmployeeAttendance> {
    return apiClient.post(`${this.baseUrl}/${id}/attendance`, attendance);
  }

  async updateAttendance(id: string, attendanceId: string, attendance: Partial<EmployeeAttendance>): Promise<EmployeeAttendance> {
    return apiClient.put(`${this.baseUrl}/${id}/attendance/${attendanceId}`, attendance);
  }

  async getLeaves(id: string, params?: Record<string, any>): Promise<EmployeeLeave[]> {
    return apiClient.get(`${this.baseUrl}/${id}/leaves`, { params });
  }

  async requestLeave(id: string, leave: Omit<EmployeeLeave, 'id' | 'employee_id' | 'status'>): Promise<EmployeeLeave> {
    return apiClient.post(`${this.baseUrl}/${id}/leaves`, leave);
  }

  async updateLeaveStatus(id: string, leaveId: string, status: EmployeeLeave['status']): Promise<EmployeeLeave> {
    return apiClient.put(`${this.baseUrl}/${id}/leaves/${leaveId}/status`, { status });
  }

  async getPerformance(id: string, params?: Record<string, any>): Promise<EmployeePerformance[]> {
    return apiClient.get(`${this.baseUrl}/${id}/performance`, { params });
  }

  async addPerformance(id: string, performance: Omit<EmployeePerformance, 'id' | 'employee_id'>): Promise<EmployeePerformance> {
    return apiClient.post(`${this.baseUrl}/${id}/performance`, performance);
  }

  async updatePerformance(id: string, performanceId: string, performance: Partial<EmployeePerformance>): Promise<EmployeePerformance> {
    return apiClient.put(`${this.baseUrl}/${id}/performance/${performanceId}`, performance);
  }

  async getByDepartment(department: string): Promise<Employee[]> {
    return apiClient.get(`${this.baseUrl}/department/${department}`);
  }

  async getByStatus(status: Employee['status']): Promise<Employee[]> {
    return apiClient.get(`${this.baseUrl}/status/${status}`);
  }

  async export(): Promise<Blob> {
    return apiClient.get(`${this.baseUrl}/export`, {
      responseType: 'blob',
    });
  }
}

export const employeeService = new EmployeeService();
export default employeeService; 
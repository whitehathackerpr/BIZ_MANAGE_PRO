import api from '../../api';

export interface Employee {
  id: number;
  name: string;
  email: string;
  role: string;
  branch_id: number;
  business_id: number;
  position: string;
  status: 'active' | 'inactive';
  hire_date: string;
  salary?: number;
  department?: string;
}

export interface EmployeeCreate {
  name: string;
  email: string;
  role: string;
  branch_id: number;
  business_id: number;
  position: string;
  status: 'active' | 'inactive';
  hire_date: string;
  salary?: number;
  department?: string;
  password: string;
}

export interface EmployeeUpdate {
  name?: string;
  email?: string;
  role?: string;
  branch_id?: number;
  position?: string;
  status?: 'active' | 'inactive';
  salary?: number;
  department?: string;
}

export interface PerformanceMetric {
  id: number;
  employee_id: number;
  metric_type: string;
  value: number;
  date: string;
  notes?: string;
}

export const fetchEmployees = async (business_id: number): Promise<Employee[]> => {
  const res = await api.get<Employee[]>(`/employees?business_id=${business_id}`);
  return res.data;
};

export const fetchEmployee = async (id: number): Promise<Employee> => {
  const res = await api.get<Employee>(`/employees/${id}`);
  return res.data;
};

export const createEmployee = async (data: EmployeeCreate): Promise<Employee> => {
  const res = await api.post<Employee>('/employees', data);
  return res.data;
};

export const updateEmployee = async (id: number, data: EmployeeUpdate): Promise<Employee> => {
  const res = await api.put<Employee>(`/employees/${id}`, data);
  return res.data;
};

export const deleteEmployee = async (id: number): Promise<Employee> => {
  const res = await api.delete<Employee>(`/employees/${id}`);
  return res.data;
};

export const fetchPerformanceMetrics = async (employee_id: number): Promise<PerformanceMetric[]> => {
  const res = await api.get<PerformanceMetric[]>(`/performance/metrics?employee_id=${employee_id}`);
  return res.data;
}; 
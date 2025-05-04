import api from '../../api';

export interface Branch {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  manager_id?: number;
  business_id: number;
  created_at: string;
}

export interface BranchCreate {
  name: string;
  address?: string;
  phone?: string;
  manager_id?: number;
  business_id: number;
}

export interface BranchUpdate {
  name?: string;
  address?: string;
  phone?: string;
  manager_id?: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export const fetchBranches = async (business_id: number): Promise<Branch[]> => {
  const res = await api.get<Branch[]>(`/business/${business_id}/branches/`);
  return res.data;
};

export const fetchBranch = async (business_id: number, branch_id: number): Promise<Branch> => {
  const res = await api.get<Branch>(`/business/${business_id}/branches/${branch_id}`);
  return res.data;
};

export const createBranch = async (business_id: number, data: BranchCreate): Promise<Branch> => {
  const res = await api.post<Branch>(`/business/${business_id}/branches/`, data);
  return res.data;
};

export const updateBranch = async (business_id: number, branch_id: number, data: BranchUpdate): Promise<Branch> => {
  const res = await api.put<Branch>(`/business/${business_id}/branches/${branch_id}`, data);
  return res.data;
};

export const deleteBranch = async (business_id: number, branch_id: number): Promise<Branch> => {
  const res = await api.delete<Branch>(`/business/${business_id}/branches/${branch_id}`);
  return res.data;
};

export const fetchManagers = async (): Promise<User[]> => {
  const res = await api.get<User[]>('/users?role=manager');
  return res.data;
}; 
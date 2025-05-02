import api from '../../api';

export interface Business {
  id: number;
  name: string;
  description?: string;
  registration_number?: string;
  tax_id?: string;
  is_active: boolean;
  owner_id: number;
  created_at: string;
  updated_at?: string;
  branch_count: number;
  active_branch_count: number;
}

export interface BusinessCreate {
  name: string;
  description?: string;
  registration_number?: string;
  tax_id?: string;
  is_active?: boolean;
  owner_id: number;
}

export interface BusinessUpdate {
  name?: string;
  description?: string;
  registration_number?: string;
  tax_id?: string;
  is_active?: boolean;
}

export const fetchBusinesses = async (): Promise<Business[]> => {
  const res = await api.get<Business[]>('/businesses');
  return res.data;
};

export const fetchBusiness = async (id: number): Promise<Business> => {
  const res = await api.get<Business>(`/businesses/${id}`);
  return res.data;
};

export const createBusiness = async (data: BusinessCreate): Promise<Business> => {
  const res = await api.post<Business>('/businesses', data);
  return res.data;
};

export const updateBusiness = async (id: number, data: BusinessUpdate): Promise<Business> => {
  const res = await api.put<Business>(`/businesses/${id}`, data);
  return res.data;
};

export const deleteBusiness = async (id: number): Promise<Business> => {
  const res = await api.delete<Business>(`/businesses/${id}`);
  return res.data;
}; 
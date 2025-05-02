import api from '../../api';

export interface Supplier {
  id: number;
  name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  business_id: number;
}

export interface SupplierCreate {
  name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  is_active?: boolean;
  business_id: number;
}

export interface SupplierUpdate {
  name?: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  is_active?: boolean;
}

export const fetchSuppliers = async (business_id: number): Promise<Supplier[]> => {
  const res = await api.get<Supplier[]>(`/suppliers?business_id=${business_id}`);
  return res.data;
};

export const fetchSupplier = async (id: number): Promise<Supplier> => {
  const res = await api.get<Supplier>(`/suppliers/${id}`);
  return res.data;
};

export const createSupplier = async (data: SupplierCreate): Promise<Supplier> => {
  const res = await api.post<Supplier>('/suppliers', data);
  return res.data;
};

export const updateSupplier = async (id: number, data: SupplierUpdate): Promise<Supplier> => {
  const res = await api.put<Supplier>(`/suppliers/${id}`, data);
  return res.data;
};

export const deleteSupplier = async (id: number): Promise<Supplier> => {
  const res = await api.delete<Supplier>(`/suppliers/${id}`);
  return res.data;
}; 
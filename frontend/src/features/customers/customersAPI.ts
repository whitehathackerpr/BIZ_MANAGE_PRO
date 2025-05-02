import api from '../../api';

export interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  loyalty_points: number;
  created_at: string;
  updated_at?: string;
  business_id: number;
}

export interface CustomerCreate {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  loyalty_points?: number;
  business_id: number;
}

export interface CustomerUpdate {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  loyalty_points?: number;
}

export const fetchCustomers = async (business_id: number): Promise<Customer[]> => {
  const res = await api.get<Customer[]>(`/customers?business_id=${business_id}`);
  return res.data;
};

export const fetchCustomer = async (id: number): Promise<Customer> => {
  const res = await api.get<Customer>(`/customers/${id}`);
  return res.data;
};

export const createCustomer = async (data: CustomerCreate): Promise<Customer> => {
  const res = await api.post<Customer>('/customers', data);
  return res.data;
};

export const updateCustomer = async (id: number, data: CustomerUpdate): Promise<Customer> => {
  const res = await api.put<Customer>(`/customers/${id}`, data);
  return res.data;
};

export const deleteCustomer = async (id: number): Promise<Customer> => {
  const res = await api.delete<Customer>(`/customers/${id}`);
  return res.data;
}; 
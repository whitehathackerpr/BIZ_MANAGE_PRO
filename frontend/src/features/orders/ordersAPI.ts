import api from '../../api';

export interface Order {
  id: number;
  order_number: string;
  customer_id: number;
  business_id: number;
  branch_id: number;
  status: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
  // Add more fields as needed (e.g., items, payment info)
}

export interface OrderCreate {
  order_number: string;
  customer_id: number;
  business_id: number;
  branch_id: number;
  status: string;
  total_amount: number;
  // Add more fields as needed
}

export interface OrderUpdate {
  status?: string;
  total_amount?: number;
  // Add more fields as needed
}

export const fetchOrders = async (business_id: number): Promise<Order[]> => {
  const res = await api.get<Order[]>(`/business/${business_id}/orders/`);
  return res.data;
};

export const fetchOrder = async (business_id: number, order_id: number): Promise<Order> => {
  const res = await api.get<Order>(`/business/${business_id}/orders/${order_id}`);
  return res.data;
};

export const createOrder = async (business_id: number, data: OrderCreate): Promise<Order> => {
  const res = await api.post<Order>(`/business/${business_id}/orders/`, data);
  return res.data;
};

export const updateOrder = async (business_id: number, order_id: number, data: OrderUpdate): Promise<Order> => {
  const res = await api.put<Order>(`/business/${business_id}/orders/${order_id}`, data);
  return res.data;
};

export const deleteOrder = async (business_id: number, order_id: number): Promise<Order> => {
  const res = await api.delete<Order>(`/business/${business_id}/orders/${order_id}`);
  return res.data;
}; 
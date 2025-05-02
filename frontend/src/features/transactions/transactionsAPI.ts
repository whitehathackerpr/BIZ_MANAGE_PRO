import api from '../../api';

export interface TransactionItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
}

export interface Transaction {
  id: number;
  type: 'sale' | 'purchase' | 'return';
  date: string;
  amount: number;
  status: string;
  customer_id?: number;
  business_id: number;
  branch_id: number;
  items: TransactionItem[];
  created_at: string;
  updated_at?: string;
}

export interface TransactionCreate {
  type: 'sale' | 'purchase' | 'return';
  date: string;
  amount: number;
  status: string;
  customer_id?: number;
  business_id: number;
  branch_id: number;
  items: Omit<TransactionItem, 'id'>[];
}

export interface TransactionUpdate {
  type?: 'sale' | 'purchase' | 'return';
  date?: string;
  amount?: number;
  status?: string;
  customer_id?: number;
  items?: Omit<TransactionItem, 'id'>[];
}

export const fetchTransactions = async (business_id: number): Promise<Transaction[]> => {
  const res = await api.get<Transaction[]>(`/transactions?business_id=${business_id}`);
  return res.data;
};

export const fetchTransaction = async (id: number): Promise<Transaction> => {
  const res = await api.get<Transaction>(`/transactions/${id}`);
  return res.data;
};

export const createTransaction = async (data: TransactionCreate): Promise<Transaction> => {
  const res = await api.post<Transaction>('/transactions', data);
  return res.data;
};

export const updateTransaction = async (id: number, data: TransactionUpdate): Promise<Transaction> => {
  const res = await api.put<Transaction>(`/transactions/${id}`, data);
  return res.data;
};

export const deleteTransaction = async (id: number): Promise<Transaction> => {
  const res = await api.delete<Transaction>(`/transactions/${id}`);
  return res.data;
}; 
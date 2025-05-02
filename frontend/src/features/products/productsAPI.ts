import api from '../../api';

export interface Product {
  id: number;
  name: string;
  price: number;
  stock_level: number;
  expiry_date?: string;
  category?: string;
  supplier_id?: number;
  business_id: number;
}

export interface ProductCreate {
  name: string;
  price: number;
  stock_level: number;
  expiry_date?: string;
  category?: string;
  supplier_id?: number;
  business_id: number;
}

export interface ProductUpdate {
  name?: string;
  price?: number;
  stock_level?: number;
  expiry_date?: string;
  category?: string;
  supplier_id?: number;
}

export const fetchProducts = async (business_id: number): Promise<Product[]> => {
  const res = await api.get<Product[]>(`/products?business_id=${business_id}`);
  return res.data;
};

export const createProduct = async (data: ProductCreate): Promise<Product> => {
  const res = await api.post<Product>('/products', data);
  return res.data;
};

export const updateProduct = async (id: number, data: ProductUpdate): Promise<Product> => {
  const res = await api.put<Product>(`/products/${id}`, data);
  return res.data;
};

export const deleteProduct = async (id: number): Promise<Product> => {
  const res = await api.delete<Product>(`/products/${id}`);
  return res.data;
}; 
import api from '../../api';

export interface SalesTrend {
  date: string;
  sales: number;
  revenue: number;
}

export interface TopProduct {
  product_id: number;
  name: string;
  sales: number;
  revenue: number;
}

export interface InventoryTrend {
  date: string;
  stock: number;
}

export interface KPI {
  label: string;
  value: number;
}

export const getSalesTrends = async (business_id: number): Promise<SalesTrend[]> => {
  const res = await api.get<SalesTrend[]>(`/business/${business_id}/dashboard/sales-trends`);
  return res.data;
};

export const getTopProducts = async (business_id: number): Promise<TopProduct[]> => {
  const res = await api.get<TopProduct[]>(`/business/${business_id}/dashboard/top-products`);
  return res.data;
};

export const getInventoryTrends = async (business_id: number): Promise<InventoryTrend[]> => {
  const res = await api.get<InventoryTrend[]>(`/business/${business_id}/dashboard/inventory-trends`);
  return res.data;
};

export const getKPIs = async (business_id: number): Promise<KPI[]> => {
  const res = await api.get<KPI[]>(`/business/${business_id}/dashboard/kpis`);
  return res.data;
}; 
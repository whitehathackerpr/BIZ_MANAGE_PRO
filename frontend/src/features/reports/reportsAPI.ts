import api from '../../api';

export interface Report {
  id: number;
  type: 'sales' | 'inventory' | 'financial';
  data: any;
  start_date: string;
  end_date: string;
  business_id: number;
  created_at: string;
}

export const fetchSalesReport = async (business_id: number, start_date: string, end_date: string): Promise<Report> => {
  const res = await api.get<Report>(`/reports/sales?business_id=${business_id}&start_date=${start_date}&end_date=${end_date}`);
  return res.data;
};

export const fetchInventoryReport = async (business_id: number, start_date: string, end_date: string): Promise<Report> => {
  const res = await api.get<Report>(`/reports/inventory?business_id=${business_id}&start_date=${start_date}&end_date=${end_date}`);
  return res.data;
};

export const fetchFinancialReport = async (business_id: number, start_date: string, end_date: string): Promise<Report> => {
  const res = await api.get<Report>(`/reports/financial?business_id=${business_id}&start_date=${start_date}&end_date=${end_date}`);
  return res.data;
}; 
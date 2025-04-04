import api from './api';

export interface ReportParams {
  startDate?: string;
  endDate?: string;
  branch_id?: string;
  category?: string;
  [key: string]: any;
}

export interface SalesReportData {
  total_sales: number;
  sales_by_period: Array<{
    period: string;
    amount: number;
  }>;
  sales_by_payment_method: Record<string, number>;
  average_order_value: number;
}

export interface InventoryReportData {
  total_products: number;
  low_stock_items: Array<{
    id: string;
    name: string;
    quantity: number;
    threshold: number;
  }>;
  product_turnover: Array<{
    id: string;
    name: string;
    turnover_rate: number;
  }>;
}

export interface CustomerReportData {
  total_customers: number;
  new_customers: number;
  active_customers: number;
  customers_by_region: Record<string, number>;
  top_customers: Array<{
    id: string;
    name: string;
    total_spent: number;
  }>;
}

export interface FinancialReportData {
  revenue: number;
  expenses: number;
  profit: number;
  revenue_by_period: Array<{
    period: string;
    amount: number;
  }>;
  expenses_by_category: Record<string, number>;
}

export interface ProductPerformanceData {
  top_selling_products: Array<{
    id: string;
    name: string;
    quantity_sold: number;
    revenue: number;
  }>;
  product_sales_trends: Array<{
    period: string;
    data: Record<string, number>;
  }>;
}

export interface OrderAnalyticsData {
  total_orders: number;
  orders_by_status: Record<string, number>;
  order_fulfillment_time: number;
  orders_by_period: Array<{
    period: string;
    count: number;
  }>;
}

export interface ReportTemplate {
  id: string;
  name: string;
  type: string;
  config: Record<string, any>;
  created_at: string;
}

export interface ReportSchedule {
  id: string;
  report_type: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  last_sent?: string;
  next_scheduled?: string;
  config: Record<string, any>;
  active: boolean;
}

export interface ReportHistoryItem {
  id: string;
  type: string;
  generated_at: string;
  parameters: Record<string, any>;
  filename?: string;
  download_url?: string;
}

export const reportService = {
  // Get sales report
  getSalesReport: async (params: ReportParams = {}): Promise<SalesReportData> => {
    const response = await api.get<{ data: SalesReportData }>('/reports/sales', { params });
    return response.data.data;
  },

  // Get inventory report
  getInventoryReport: async (params: ReportParams = {}): Promise<InventoryReportData> => {
    const response = await api.get<{ data: InventoryReportData }>('/reports/inventory', { params });
    return response.data.data;
  },

  // Get customer report
  getCustomerReport: async (params: ReportParams = {}): Promise<CustomerReportData> => {
    const response = await api.get<{ data: CustomerReportData }>('/reports/customers', { params });
    return response.data.data;
  },

  // Get financial report
  getFinancialReport: async (params: ReportParams = {}): Promise<FinancialReportData> => {
    const response = await api.get<{ data: FinancialReportData }>('/reports/financial', { params });
    return response.data.data;
  },

  // Get product performance report
  getProductPerformanceReport: async (params: ReportParams = {}): Promise<ProductPerformanceData> => {
    const response = await api.get<{ data: ProductPerformanceData }>('/reports/products/performance', { params });
    return response.data.data;
  },

  // Get order analytics report
  getOrderAnalyticsReport: async (params: ReportParams = {}): Promise<OrderAnalyticsData> => {
    const response = await api.get<{ data: OrderAnalyticsData }>('/reports/orders/analytics', { params });
    return response.data.data;
  },

  // Get revenue report
  getRevenueReport: async (params: ReportParams = {}): Promise<any> => {
    const response = await api.get<{ data: any }>('/reports/revenue', { params });
    return response.data.data;
  },

  // Get profit report
  getProfitReport: async (params: ReportParams = {}): Promise<any> => {
    const response = await api.get<{ data: any }>('/reports/profit', { params });
    return response.data.data;
  },

  // Get employee performance report
  getEmployeePerformanceReport: async (params: ReportParams = {}): Promise<any> => {
    const response = await api.get<{ data: any }>('/reports/employees/performance', { params });
    return response.data.data;
  },

  // Get branch performance report
  getBranchPerformanceReport: async (params: ReportParams = {}): Promise<any> => {
    const response = await api.get<{ data: any }>('/reports/branches/performance', { params });
    return response.data.data;
  },

  // Export report
  exportReport: async (reportType: string, format: 'pdf' | 'csv' | 'excel', params: ReportParams = {}): Promise<Blob> => {
    const response = await api.get(`/reports/${reportType}/export`, {
      params: { ...params, format },
      responseType: 'blob',
    });
    return response.data;
  },

  // Generate custom report
  generateCustomReport: async (reportConfig: Record<string, any>): Promise<any> => {
    const response = await api.post<{ data: any }>('/reports/custom', reportConfig);
    return response.data.data;
  },

  // Get report templates
  getReportTemplates: async (): Promise<ReportTemplate[]> => {
    const response = await api.get<{ data: ReportTemplate[] }>('/reports/templates');
    return response.data.data;
  },

  // Save report template
  saveReportTemplate: async (templateData: Omit<ReportTemplate, 'id' | 'created_at'>): Promise<ReportTemplate> => {
    const response = await api.post<{ data: ReportTemplate }>('/reports/templates', templateData);
    return response.data.data;
  },

  // Get report schedule
  getReportSchedule: async (): Promise<ReportSchedule[]> => {
    const response = await api.get<{ data: ReportSchedule[] }>('/reports/schedule');
    return response.data.data;
  },

  // Schedule report
  scheduleReport: async (scheduleData: Omit<ReportSchedule, 'id' | 'last_sent' | 'next_scheduled'>): Promise<ReportSchedule> => {
    const response = await api.post<{ data: ReportSchedule }>('/reports/schedule', scheduleData);
    return response.data.data;
  },

  // Get report history
  getReportHistory: async (params: Record<string, any> = {}): Promise<ReportHistoryItem[]> => {
    const response = await api.get<{ data: ReportHistoryItem[] }>('/reports/history', { params });
    return response.data.data;
  },
}; 
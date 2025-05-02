import api from '../../api';

export interface PerformanceMetric {
  id: number;
  employee_id: number;
  metric_type: string;
  value: number;
  date: string;
}

export interface PerformanceReview {
  id: number;
  employee_id: number;
  reviewer: string;
  review_text: string;
  date: string;
}

export interface PerformanceSummary {
  employee_id: number;
  period: number;
  summary: any;
}

export interface PerformanceDashboard {
  employee_id: number;
  period: number;
  dashboard_data: any;
}

export const fetchMetrics = async (employee_id?: number, metric_type?: string, start_date?: string, end_date?: string): Promise<PerformanceMetric[]> => {
  const params: any = {};
  if (employee_id) params.employee_id = employee_id;
  if (metric_type) params.metric_type = metric_type;
  if (start_date) params.start_date = start_date;
  if (end_date) params.end_date = end_date;
  const res = await api.get<PerformanceMetric[]>('/performance/metrics', { params });
  return res.data;
};

export const fetchReviews = async (employee_id?: number, start_date?: string, end_date?: string): Promise<PerformanceReview[]> => {
  const params: any = {};
  if (employee_id) params.employee_id = employee_id;
  if (start_date) params.start_date = start_date;
  if (end_date) params.end_date = end_date;
  const res = await api.get<PerformanceReview[]>('/performance/reviews', { params });
  return res.data;
};

export const fetchSummary = async (employee_id: number, period: number = 3): Promise<PerformanceSummary> => {
  const res = await api.get<PerformanceSummary>(`/performance/summary/${employee_id}?period=${period}`);
  return res.data;
};

export const fetchDashboard = async (employee_id: number, period: number = 12): Promise<PerformanceDashboard> => {
  const res = await api.get<PerformanceDashboard>(`/performance/dashboard/${employee_id}?period=${period}`);
  return res.data;
}; 
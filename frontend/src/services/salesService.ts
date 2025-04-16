import apiClient from './apiClient';
import type { Sale, SaleItem, SalePayment, SaleStats } from '../types/sale';

class SalesService {
  private baseUrl = '/sales';

  async getAll(params?: Record<string, any>): Promise<Sale[]> {
    return apiClient.get(this.baseUrl, { params });
  }

  async getById(id: string): Promise<Sale> {
    return apiClient.get(`${this.baseUrl}/${id}`);
  }

  async create(sale: Omit<Sale, 'id' | 'created_at'>): Promise<Sale> {
    return apiClient.post(this.baseUrl, sale);
  }

  async update(id: string, sale: Partial<Sale>): Promise<Sale> {
    return apiClient.put(`${this.baseUrl}/${id}`, sale);
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }

  async getStats(startDate?: string, endDate?: string): Promise<SaleStats> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const response = await apiClient.get<SaleStats>(`${this.baseUrl}/stats?${params.toString()}`);
      return response;
    } catch (error) {
      console.error('Error fetching sales stats:', error);
      throw error;
    }
  }

  async getItems(saleId: string): Promise<SaleItem[]> {
    return apiClient.get(`${this.baseUrl}/${saleId}/items`);
  }

  async addItem(saleId: string, item: Omit<SaleItem, 'id' | 'sale_id'>): Promise<SaleItem> {
    return apiClient.post(`${this.baseUrl}/${saleId}/items`, item);
  }

  async updateItem(saleId: string, itemId: string, item: Partial<SaleItem>): Promise<SaleItem> {
    return apiClient.put(`${this.baseUrl}/${saleId}/items/${itemId}`, item);
  }

  async deleteItem(saleId: string, itemId: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${saleId}/items/${itemId}`);
  }

  async getPayments(saleId: string): Promise<SalePayment[]> {
    return apiClient.get(`${this.baseUrl}/${saleId}/payments`);
  }

  async addPayment(saleId: string, payment: Omit<SalePayment, 'id' | 'sale_id'>): Promise<SalePayment> {
    return apiClient.post(`${this.baseUrl}/${saleId}/payments`, payment);
  }

  async updatePayment(saleId: string, paymentId: string, payment: Partial<SalePayment>): Promise<SalePayment> {
    return apiClient.put(`${this.baseUrl}/${saleId}/payments/${paymentId}`, payment);
  }

  async deletePayment(saleId: string, paymentId: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${saleId}/payments/${paymentId}`);
  }

  async getByDateRange(startDate: string, endDate: string): Promise<Sale[]> {
    return apiClient.get(`${this.baseUrl}/date-range`, {
      params: { startDate, endDate },
    });
  }

  async getByStatus(status: string): Promise<Sale[]> {
    return apiClient.get(`${this.baseUrl}/status`, {
      params: { status },
    });
  }

  async export(format: 'excel' | 'pdf'): Promise<Blob> {
    try {
      const response = await apiClient.get<Blob>(`${this.baseUrl}/export`, {
        params: { format },
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  }
}

export const salesService = new SalesService();
export default salesService; 
import apiClient from './apiClient';
import type { InventoryItem, InventoryTransaction, StockLevel } from '../types/inventory';

class InventoryService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = '/inventory';
  }

  async getStockLevels(params?: {
    branch_id?: number;
    category?: string;
    low_stock_only?: boolean;
  }): Promise<StockLevel[]> {
    return apiClient.get(`${this.baseUrl}/stock-levels`, { params });
  }

  async getTransactions(params?: {
    product_id?: number;
    type?: 'in' | 'out' | 'adjustment';
    start_date?: string;
    end_date?: string;
    branch_id?: number;
  }): Promise<InventoryTransaction[]> {
    return apiClient.get(`${this.baseUrl}/transactions`, { params });
  }

  async getTransaction(id: number): Promise<InventoryTransaction> {
    return apiClient.get(`${this.baseUrl}/transactions/${id}`);
  }

  async createTransaction(data: {
    product_id: number;
    quantity: number;
    type: 'in' | 'out' | 'adjustment';
    notes?: string;
    branch_id: number;
  }): Promise<InventoryTransaction> {
    return apiClient.post(`${this.baseUrl}/transactions`, data);
  }

  async adjustInventory(data: {
    product_id: number;
    quantity: number;
    notes?: string;
    branch_id: number;
  }): Promise<InventoryItem> {
    return apiClient.post(`${this.baseUrl}/adjust`, data);
  }

  async getLowStock(params?: {
    branch_id?: number;
    category?: string;
  }): Promise<StockLevel[]> {
    return apiClient.get(`${this.baseUrl}/low-stock`, { params });
  }

  async getInventoryValue(params?: {
    branch_id?: number;
    category?: string;
  }): Promise<{ total_value: number }> {
    return apiClient.get(`${this.baseUrl}/value`, { params });
  }
}

export const inventoryService = new InventoryService();
export default inventoryService; 
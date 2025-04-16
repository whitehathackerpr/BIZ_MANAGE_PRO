import apiClient from './apiClient';
import { Product, ProductSearchParams, ProductResponse } from '../types/product';

class ProductService {
  private baseUrl = '/products';

  async search(params: ProductSearchParams): Promise<ProductResponse> {
    return apiClient.get(this.baseUrl, { params });
  }

  async getById(id: string): Promise<Product> {
    return apiClient.get(`${this.baseUrl}/${id}`);
  }

  async create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    return apiClient.post(this.baseUrl, product);
  }

  async update(id: string, product: Partial<Product>): Promise<Product> {
    return apiClient.put(`${this.baseUrl}/${id}`, product);
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }

  async updateQuantity(id: string, quantity: number): Promise<Product> {
    return apiClient.patch(`${this.baseUrl}/${id}/quantity`, { quantity });
  }

  async getLowStock(): Promise<Product[]> {
    return apiClient.get(`${this.baseUrl}/low-stock`);
  }

  async bulkUpdate(products: { id: string; [key: string]: any }[]): Promise<Product[]> {
    return apiClient.patch(`${this.baseUrl}/bulk`, { products });
  }

  async export(): Promise<Blob> {
    return apiClient.get(`${this.baseUrl}/export`, {
      responseType: 'blob'
    });
  }
}

export const productService = new ProductService();
export default productService;
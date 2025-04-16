export interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  barcode?: string;
  price: number;
  quantity: number;
  category: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface ProductSearchParams {
  searchTerm?: string;
  category?: string;
  status?: string;
  priceRange?: {
    min?: number;
    max?: number;
  };
  stockLevel?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  page?: number;
  pageSize?: number;
}

export interface ProductResponse {
  data: Product[];
  total: number;
} 
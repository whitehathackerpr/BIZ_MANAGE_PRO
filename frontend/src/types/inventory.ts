export interface InventoryItem {
  id: number;
  product_id: number;
  product_name: string;
  sku: string;
  quantity: number;
  min_quantity: number;
  price: number;
  category: string;
  last_updated: string;
}

export interface InventoryTransaction {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  type: 'in' | 'out' | 'adjustment';
  notes?: string;
  created_at: string;
  user_id: number;
  user_name: string;
  branch_id: number;
  branch_name: string;
}

export interface StockLevel {
  product_id: number;
  product_name: string;
  sku: string;
  quantity: number;
  min_quantity: number;
  category: string;
  last_updated: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
} 
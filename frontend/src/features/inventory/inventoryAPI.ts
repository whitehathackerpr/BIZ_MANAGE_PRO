import api from '../../api';

export interface InventoryItem {
  id: number;
  product_id: number;
  product_name: string;
  stock_level: number;
  min_stock_level: number;
  expiry_date?: string;
  batch_number?: string;
  location?: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'expired';
  last_updated: string;
  business_id: number;
  branch_id: number;
}

export interface InventoryUpdate {
  stock_level?: number;
  min_stock_level?: number;
  expiry_date?: string;
  batch_number?: string;
  location?: string;
}

export interface StockMovement {
  id: number;
  inventory_id: number;
  quantity: number;
  type: 'receive' | 'issue' | 'transfer' | 'adjustment' | 'return';
  date: string;
  reason?: string;
  performed_by: number;
}

export const fetchInventory = async (business_id: number): Promise<InventoryItem[]> => {
  const res = await api.get<InventoryItem[]>(`/inventory?business_id=${business_id}`);
  return res.data;
};

export const updateInventoryItem = async (id: number, data: InventoryUpdate): Promise<InventoryItem> => {
  const res = await api.put<InventoryItem>(`/inventory/${id}`, data);
  return res.data;
};

export const fetchLowStockItems = async (business_id: number): Promise<InventoryItem[]> => {
  const res = await api.get<InventoryItem[]>(`/inventory/low-stock?business_id=${business_id}`);
  return res.data;
};

export const fetchExpiredProducts = async (business_id: number): Promise<InventoryItem[]> => {
  const res = await api.get<InventoryItem[]>(`/inventory/expired?business_id=${business_id}`);
  return res.data;
};

export const createStockMovement = async (data: Omit<StockMovement, 'id'>): Promise<StockMovement> => {
  const res = await api.post<StockMovement>('/inventory/movements', data);
  return res.data;
};

export const fetchStockMovements = async (inventory_id: number): Promise<StockMovement[]> => {
  const res = await api.get<StockMovement[]>(`/inventory/movements?inventory_id=${inventory_id}`);
  return res.data;
}; 
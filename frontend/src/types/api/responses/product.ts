export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DISCONTINUED = 'discontinued',
  OUT_OF_STOCK = 'out_of_stock'
}

export enum ProductCategory {
  RAW_MATERIAL = 'raw_material',
  FINISHED_GOOD = 'finished_good',
  CONSUMABLE = 'consumable',
  EQUIPMENT = 'equipment',
  SERVICE = 'service'
}

export interface ProductBase {
  name: string;
  sku: string;
  description?: string;
  price: number;
  cost: number;
  status: ProductStatus;
  category: ProductCategory;
  quantity: number;
  min_quantity: number;
  max_quantity: number;
  unit?: string;
  barcode?: string;
  weight?: number;
  dimensions?: string;
  branch_id?: number;
  supplier_id?: number;
}

export interface ProductCreate extends ProductBase {}

export interface ProductUpdate {
  name?: string;
  sku?: string;
  description?: string;
  price?: number;
  cost?: number;
  status?: ProductStatus;
  category?: ProductCategory;
  quantity?: number;
  min_quantity?: number;
  max_quantity?: number;
  unit?: string;
  barcode?: string;
  weight?: number;
  dimensions?: string;
  branch_id?: number;
  supplier_id?: number;
}

export interface Product extends ProductBase {
  id: number;
  created_at: string;
  updated_at: string;
}

export interface ProductList {
  items: Product[];
  total: number;
} 
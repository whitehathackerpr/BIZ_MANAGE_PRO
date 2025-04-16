export interface Sale {
  id: string;
  created_at: string;
  invoice_number: string;
  customer_name: string;
  total_amount: number;
  payment_method: string;
  status: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  price: number;
  discount?: number;
  total: number;
}

export interface SalePayment {
  id: string;
  sale_id: string;
  amount: number;
  method: string;
  status: string;
  transaction_id?: string;
  date: string;
}

export interface SaleStats {
  total_sales: number;
  total_revenue: number;
  average_order_value: number;
  total_orders: number;
  sales_trend: Array<{
    date: string;
    value: number;
    type: string;
  }>;
  category_distribution: Array<{
    category: string;
    value: number;
  }>;
  conversion_rate: number;
  customer_retention: number;
  average_order_size: number;
  top_products: Array<{
    product_id: number;
    name: string;
    quantity: number;
    revenue: number;
  }>;
  sales_growth: number;
  revenue_growth: number;
  top_customers: Array<{
    customer_id: number;
    name: string;
    total_purchases: number;
    total_spent: number;
  }>;
  inventory_status: {
    total_products: number;
    low_stock_items: number;
    out_of_stock_items: number;
    total_value: number;
  };
} 
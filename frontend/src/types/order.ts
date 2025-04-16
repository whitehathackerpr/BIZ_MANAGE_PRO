export interface Order {
  id: string;
  customer_id: string;
  date: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  total_amount: number;
  payment_status: 'paid' | 'unpaid' | 'partial';
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  discount?: number;
  total: number;
}

export interface OrderPayment {
  id: string;
  order_id: string;
  amount: number;
  method: string;
  status: string;
  transaction_id?: string;
  date: string;
}

export interface OrderShipping {
  id: string;
  order_id: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  tracking_number?: string;
  carrier?: string;
  status: string;
}

export interface OrderHistoryItem {
  id: string;
  order_id: string;
  status: string;
  notes?: string;
  created_at: string;
}

export interface OrderItemData {
  product_id: string;
  quantity: number;
  price?: number;
  discount?: number;
}

export interface OrderPaymentData {
  amount: number;
  method: string;
  transaction_id?: string;
}

export interface OrderShippingData {
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  tracking_number?: string;
  carrier?: string;
} 
import api from './api';

interface Order {
  id: string;
  customer_id: string;
  date: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  total_amount: number;
  payment_status: 'paid' | 'unpaid' | 'partial';
  created_at: string;
  updated_at: string;
}

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  discount?: number;
  total: number;
}

interface OrderPayment {
  id: string;
  order_id: string;
  amount: number;
  method: string;
  status: string;
  transaction_id?: string;
  date: string;
}

interface OrderShipping {
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

interface OrderHistoryItem {
  id: string;
  order_id: string;
  status: string;
  notes?: string;
  created_at: string;
}

interface OrderItemData {
  product_id: string;
  quantity: number;
  price?: number;
  discount?: number;
}

interface OrderPaymentData {
  amount: number;
  method: string;
  transaction_id?: string;
}

interface OrderShippingData {
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  tracking_number?: string;
  carrier?: string;
}

export const orderService = {
  // Get all orders
  getAllOrders: async (params: Record<string, any> = {}): Promise<{ data: Order[]; total: number }> => {
    const response = await api.get<{ data: Order[]; total: number }>('/orders', { params });
    return response.data;
  },

  // Get single order
  getOrder: async (id: string): Promise<Order> => {
    const response = await api.get<{ data: Order }>(`/orders/${id}`);
    return response.data.data;
  },

  // Create new order
  createOrder: async (orderData: Partial<Order>): Promise<Order> => {
    const response = await api.post<{ data: Order }>('/orders', orderData);
    return response.data.data;
  },

  // Update order
  updateOrder: async (id: string, orderData: Partial<Order>): Promise<Order> => {
    const response = await api.put<{ data: Order }>(`/orders/${id}`, orderData);
    return response.data.data;
  },

  // Delete order
  deleteOrder: async (id: string): Promise<void> => {
    await api.delete(`/orders/${id}`);
  },

  // Get order status
  getOrderStatus: async (id: string): Promise<{ status: string }> => {
    const response = await api.get<{ data: { status: string } }>(`/orders/${id}/status`);
    return response.data.data;
  },

  // Update order status
  updateOrderStatus: async (id: string, status: string): Promise<Order> => {
    const response = await api.put<{ data: Order }>(`/orders/${id}/status`, { status });
    return response.data.data;
  },

  // Get order items
  getOrderItems: async (id: string): Promise<OrderItem[]> => {
    const response = await api.get<{ data: OrderItem[] }>(`/orders/${id}/items`);
    return response.data.data;
  },

  // Add item to order
  addOrderItem: async (id: string, itemData: OrderItemData): Promise<OrderItem> => {
    const response = await api.post<{ data: OrderItem }>(`/orders/${id}/items`, itemData);
    return response.data.data;
  },

  // Update order item
  updateOrderItem: async (orderId: string, itemId: string, itemData: Partial<OrderItemData>): Promise<OrderItem> => {
    const response = await api.put<{ data: OrderItem }>(`/orders/${orderId}/items/${itemId}`, itemData);
    return response.data.data;
  },

  // Remove item from order
  removeOrderItem: async (orderId: string, itemId: string): Promise<void> => {
    await api.delete(`/orders/${orderId}/items/${itemId}`);
  },

  // Get order payment details
  getOrderPayment: async (id: string): Promise<OrderPayment> => {
    const response = await api.get<{ data: OrderPayment }>(`/orders/${id}/payment`);
    return response.data.data;
  },

  // Process order payment
  processOrderPayment: async (id: string, paymentData: OrderPaymentData): Promise<OrderPayment> => {
    const response = await api.post<{ data: OrderPayment }>(`/orders/${id}/payment`, paymentData);
    return response.data.data;
  },

  // Get order shipping details
  getOrderShipping: async (id: string): Promise<OrderShipping> => {
    const response = await api.get<{ data: OrderShipping }>(`/orders/${id}/shipping`);
    return response.data.data;
  },

  // Update order shipping
  updateOrderShipping: async (id: string, shippingData: OrderShippingData): Promise<OrderShipping> => {
    const response = await api.put<{ data: OrderShipping }>(`/orders/${id}/shipping`, shippingData);
    return response.data.data;
  },

  // Get order history
  getOrderHistory: async (id: string): Promise<OrderHistoryItem[]> => {
    const response = await api.get<{ data: OrderHistoryItem[] }>(`/orders/${id}/history`);
    return response.data.data;
  },

  // Get orders by date range
  getOrdersByDateRange: async (startDate: string, endDate: string): Promise<{ data: Order[]; total: number }> => {
    const response = await api.get<{ data: Order[]; total: number }>('/orders/date-range', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  // Get orders by status
  getOrdersByStatus: async (status: string): Promise<{ data: Order[]; total: number }> => {
    const response = await api.get<{ data: Order[]; total: number }>('/orders/status', {
      params: { status },
    });
    return response.data;
  },
}; 
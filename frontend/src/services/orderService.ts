import apiClient from './apiClient';
import type {
  Order,
  OrderItem,
  OrderPayment,
  OrderShipping,
  OrderHistoryItem,
  OrderItemData,
  OrderPaymentData,
  OrderShippingData
} from '../types/order';

export const orderService = {
  // Get all orders
  getAllOrders: async (params: Record<string, any> = {}): Promise<{ data: Order[]; total: number }> => {
    return apiClient.get('/orders', { params });
  },

  // Get single order
  getOrder: async (id: string): Promise<Order> => {
    const response = await apiClient.get<{ data: Order }>(`/orders/${id}`);
    return response.data;
  },

  // Create new order
  createOrder: async (orderData: Partial<Order>): Promise<Order> => {
    return apiClient.post('/orders', orderData);
  },

  // Update order
  updateOrder: async (id: string, orderData: Partial<Order>): Promise<Order> => {
    return apiClient.put(`/orders/${id}`, orderData);
  },

  // Delete order
  deleteOrder: async (id: string): Promise<void> => {
    return apiClient.delete(`/orders/${id}`);
  },

  // Get order status
  getOrderStatus: async (id: string): Promise<{ status: string }> => {
    return apiClient.get(`/orders/${id}/status`);
  },

  // Update order status
  updateOrderStatus: async (id: string, status: string): Promise<Order> => {
    return apiClient.put(`/orders/${id}/status`, { status });
  },

  // Get order items
  getOrderItems: async (id: string): Promise<OrderItem[]> => {
    return apiClient.get(`/orders/${id}/items`);
  },

  // Add item to order
  addOrderItem: async (id: string, itemData: OrderItemData): Promise<OrderItem> => {
    return apiClient.post(`/orders/${id}/items`, itemData);
  },

  // Update order item
  updateOrderItem: async (orderId: string, itemId: string, itemData: Partial<OrderItemData>): Promise<OrderItem> => {
    return apiClient.put(`/orders/${orderId}/items/${itemId}`, itemData);
  },

  // Remove item from order
  removeOrderItem: async (orderId: string, itemId: string): Promise<void> => {
    return apiClient.delete(`/orders/${orderId}/items/${itemId}`);
  },

  // Get order payment details
  getOrderPayment: async (id: string): Promise<OrderPayment> => {
    return apiClient.get(`/orders/${id}/payment`);
  },

  // Process order payment
  processOrderPayment: async (id: string, paymentData: OrderPaymentData): Promise<OrderPayment> => {
    return apiClient.post(`/orders/${id}/payment`, paymentData);
  },

  // Get order shipping details
  getOrderShipping: async (id: string): Promise<OrderShipping> => {
    return apiClient.get(`/orders/${id}/shipping`);
  },

  // Update order shipping
  updateOrderShipping: async (id: string, shippingData: OrderShippingData): Promise<OrderShipping> => {
    return apiClient.put(`/orders/${id}/shipping`, shippingData);
  },

  // Get order history
  getOrderHistory: async (id: string): Promise<OrderHistoryItem[]> => {
    return apiClient.get(`/orders/${id}/history`);
  },

  // Get orders by date range
  getOrdersByDateRange: async (startDate: string, endDate: string): Promise<{ data: Order[]; total: number }> => {
    return apiClient.get('/orders/date-range', {
      params: { startDate, endDate },
    });
  },

  // Get orders by status
  getOrdersByStatus: async (status: string): Promise<{ data: Order[]; total: number }> => {
    return apiClient.get('/orders/status', {
      params: { status },
    });
  },
}; 
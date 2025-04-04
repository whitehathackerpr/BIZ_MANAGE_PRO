import api from './api';

export const inventoryApi = {
  getProducts: async (params = {}) => {
    const response = await api.get('/inventory/products', { params });
    return response.data;
  },

  getProduct: async (id) => {
    const response = await api.get(`/inventory/products/${id}`);
    return response.data;
  },

  createProduct: async (productData) => {
    const response = await api.post('/inventory/products', productData);
    return response.data;
  },

  updateProduct: async (id, productData) => {
    const response = await api.put(`/inventory/products/${id}`, productData);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await api.delete(`/inventory/products/${id}`);
    return response.data;
  },

  adjustStock: async (adjustmentData) => {
    const response = await api.post('/inventory/adjust', adjustmentData);
    return response.data;
  },

  getStockHistory: async (productId) => {
    const response = await api.get(`/inventory/products/${productId}/history`);
    return response.data;
  },
}; 
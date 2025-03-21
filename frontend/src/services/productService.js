import axios from 'axios';
import Cache from '../utils/cache';

const API_URL = import.meta.env.VITE_API_URL;
const cache = new Cache(5 * 60 * 1000, 'product_cache'); // 5 minutes TTL

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token refresh or logout
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const productService = {
  // Get all products with advanced filtering and sorting
  getAllProducts: async ({ 
    page = 1, 
    limit = 10, 
    search = '', 
    category = '', 
    sortBy = 'name', 
    sortOrder = 'asc',
    minPrice,
    maxPrice,
    status
  } = {}) => {
    const cacheKey = `products:all:${page}:${limit}:${search}:${category}:${sortBy}:${sortOrder}:${minPrice}:${maxPrice}:${status}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) return cachedData;

    try {
      const response = await api.get('/products', {
        params: {
          page,
          limit,
          search,
          category,
          sortBy,
          sortOrder,
          minPrice,
          maxPrice,
          status
        }
      });
      cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      throw productService.handleError(error);
    }
  },

  // Get a single product with related products
  getProductById: async (id) => {
    const cacheKey = `products:${id}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) return cachedData;

    try {
      const response = await api.get(`/products/${id}`);
      cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      throw productService.handleError(error);
    }
  },

  // Create a new product with image upload support
  createProduct: async (productData) => {
    try {
      const formData = new FormData();
      Object.keys(productData).forEach(key => {
        if (key === 'images') {
          productData[key].forEach(image => {
            formData.append('images', image);
          });
        } else {
          formData.append(key, productData[key]);
        }
      });

      const response = await api.post('/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      // Invalidate all product-related caches
      cache.invalidate('products:');
      return response.data;
    } catch (error) {
      throw productService.handleError(error);
    }
  },

  // Update a product with image handling
  updateProduct: async (id, productData) => {
    try {
      const formData = new FormData();
      Object.keys(productData).forEach(key => {
        if (key === 'images') {
          productData[key].forEach(image => {
            formData.append('images', image);
          });
        } else {
          formData.append(key, productData[key]);
        }
      });

      const response = await api.put(`/products/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      // Invalidate specific product cache and all products cache
      cache.delete(`products:${id}`);
      cache.invalidate('products:all');
      return response.data;
    } catch (error) {
      throw productService.handleError(error);
    }
  },

  // Delete a single product
  deleteProduct: async (id) => {
    try {
      const response = await api.delete(`/products/${id}`);
      // Invalidate specific product cache and all products cache
      cache.delete(`products:${id}`);
      cache.invalidate('products:all');
      return response.data;
    } catch (error) {
      throw productService.handleError(error);
    }
  },

  // Bulk delete products
  bulkDeleteProducts: async (ids) => {
    try {
      const response = await api.post('/products/bulk-delete', { ids });
      // Invalidate all product-related caches
      cache.invalidate('products:');
      return response.data;
    } catch (error) {
      throw productService.handleError(error);
    }
  },

  // Bulk update product status
  bulkUpdateStatus: async (ids, status) => {
    try {
      const response = await api.post('/products/bulk-update-status', { ids, status });
      // Invalidate all product-related caches
      cache.invalidate('products:');
      return response.data;
    } catch (error) {
      throw productService.handleError(error);
    }
  },

  // Search products with advanced filtering
  searchProducts: async ({ query, category, minPrice, maxPrice, sortBy, sortOrder }) => {
    const cacheKey = `products:search:${query}:${category}:${minPrice}:${maxPrice}:${sortBy}:${sortOrder}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) return cachedData;

    try {
      const response = await api.get('/products/search', {
        params: { query, category, minPrice, maxPrice, sortBy, sortOrder }
      });
      cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      throw productService.handleError(error);
    }
  },

  // Filter products by category with pagination
  filterByCategory: async (category, page = 1, limit = 10) => {
    const cacheKey = `products:category:${category}:${page}:${limit}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) return cachedData;

    try {
      const response = await api.get(`/products/category/${category}`, {
        params: { page, limit }
      });
      cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      throw productService.handleError(error);
    }
  },

  // Get product statistics
  getProductStats: async () => {
    const cacheKey = 'products:stats';
    const cachedData = cache.get(cacheKey);
    if (cachedData) return cachedData;

    try {
      const response = await api.get('/products/stats');
      cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      throw productService.handleError(error);
    }
  },

  // Get related products
  getRelatedProducts: async (productId, limit = 4) => {
    const cacheKey = `products:related:${productId}:${limit}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) return cachedData;

    try {
      const response = await api.get(`/products/${productId}/related`, {
        params: { limit }
      });
      cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      throw productService.handleError(error);
    }
  },

  // Product Variants Management
  getProductVariants: async (productId) => {
    const cacheKey = `products:${productId}:variants`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) return cachedData;

    try {
      const response = await api.get(`/products/${productId}/variants`);
      cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      throw productService.handleError(error);
    }
  },

  createProductVariant: async (productId, variantData) => {
    try {
      const response = await api.post(`/products/${productId}/variants`, variantData);
      cache.delete(`products:${productId}:variants`);
      return response.data;
    } catch (error) {
      throw productService.handleError(error);
    }
  },

  updateProductVariant: async (productId, variantId, variantData) => {
    try {
      const response = await api.put(`/products/${productId}/variants/${variantId}`, variantData);
      cache.delete(`products:${productId}:variants`);
      return response.data;
    } catch (error) {
      throw productService.handleError(error);
    }
  },

  deleteProductVariant: async (productId, variantId) => {
    try {
      const response = await api.delete(`/products/${productId}/variants/${variantId}`);
      cache.delete(`products:${productId}:variants`);
      return response.data;
    } catch (error) {
      throw productService.handleError(error);
    }
  },

  // Inventory Management
  getInventory: async (productId) => {
    const cacheKey = `products:${productId}:inventory`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) return cachedData;

    try {
      const response = await api.get(`/products/${productId}/inventory`);
      cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      throw productService.handleError(error);
    }
  },

  updateInventory: async (productId, inventoryData) => {
    try {
      const response = await api.put(`/products/${productId}/inventory`, inventoryData);
      cache.delete(`products:${productId}:inventory`);
      return response.data;
    } catch (error) {
      throw productService.handleError(error);
    }
  },

  // Bulk Inventory Operations
  bulkUpdateInventory: async (updates) => {
    try {
      const response = await api.post('/products/bulk-inventory-update', updates);
      // Invalidate all inventory caches
      cache.invalidate('products:inventory');
      return response.data;
    } catch (error) {
      throw productService.handleError(error);
    }
  },

  // Product Reviews
  getProductReviews: async (productId, page = 1, limit = 10) => {
    const cacheKey = `products:${productId}:reviews:${page}:${limit}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) return cachedData;

    try {
      const response = await api.get(`/products/${productId}/reviews`, {
        params: { page, limit }
      });
      cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      throw productService.handleError(error);
    }
  },

  addProductReview: async (productId, reviewData) => {
    try {
      const response = await api.post(`/products/${productId}/reviews`, reviewData);
      cache.invalidate(`products:${productId}:reviews`);
      return response.data;
    } catch (error) {
      throw productService.handleError(error);
    }
  },

  // Product Categories
  getCategories: async () => {
    const cacheKey = 'products:categories';
    const cachedData = cache.get(cacheKey);
    if (cachedData) return cachedData;

    try {
      const response = await api.get('/products/categories');
      cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      throw productService.handleError(error);
    }
  },

  // Enhanced error handling with retry logic
  handleError(error, retryCount = 0) {
    const maxRetries = 3;
    const retryDelay = 1000; // 1 second

    if (error.response) {
      const errorMessage = error.response.data.message || 'An error occurred';
      const errorCode = error.response.status;
      const errorDetails = error.response.data.details;

      // Handle specific error cases
      switch (errorCode) {
        case 401:
          return new Error('Authentication required. Please log in.');
        case 403:
          return new Error('You do not have permission to perform this action.');
        case 404:
          return new Error('The requested resource was not found.');
        case 422:
          return new Error('Invalid data provided. Please check your input.');
        case 429:
          if (retryCount < maxRetries) {
            return new Promise((resolve) => {
              setTimeout(() => {
                resolve(productService.handleError(error, retryCount + 1));
              }, retryDelay * (retryCount + 1));
            });
          }
          return new Error('Too many requests. Please try again later.');
        case 500:
          if (retryCount < maxRetries) {
            return new Promise((resolve) => {
              setTimeout(() => {
                resolve(productService.handleError(error, retryCount + 1));
              }, retryDelay * (retryCount + 1));
            });
          }
          return new Error('Server error. Please try again later.');
        default:
          return new Error(errorMessage);
      }
    } else if (error.request) {
      if (retryCount < maxRetries) {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(productService.handleError(error, retryCount + 1));
          }, retryDelay * (retryCount + 1));
        });
      }
      return new Error('No response from server. Please check your connection.');
    } else {
      return new Error('Error setting up request. Please try again.');
    }
  }
};

export default productService;
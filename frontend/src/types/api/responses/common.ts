/**
 * Common API response types used across the application
 */

/**
 * Standard API response wrapper for any data type
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

/**
 * Paginated response wrapper for list data
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Error response from the API
 */
export interface ErrorResponse {
  statusCode: number;
  message: string;
  errors?: Record<string, string[]>;
} 
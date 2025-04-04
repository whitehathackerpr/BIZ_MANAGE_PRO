/**
 * Application Configuration
 * This file contains global configuration settings for the application.
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};

// Authentication Configuration
export const AUTH_CONFIG = {
  TOKEN_KEY: 'auth_token',
  REFRESH_TOKEN_KEY: 'refresh_token',
  TOKEN_EXPIRY_KEY: 'token_expiry',
  USER_INFO_KEY: 'user_info',
};

// Feature Flags
export const FEATURES = {
  ENABLE_BIOMETRIC_AUTH: process.env.REACT_APP_ENABLE_BIOMETRIC_AUTH === 'true' || false,
  ENABLE_DARK_MODE: process.env.REACT_APP_ENABLE_DARK_MODE === 'true' || true,
  ENABLE_NOTIFICATIONS: process.env.REACT_APP_ENABLE_NOTIFICATIONS === 'true' || true,
  ENABLE_OFFLINE_MODE: process.env.REACT_APP_ENABLE_OFFLINE_MODE === 'true' || false,
};

// UI Configuration
export const UI_CONFIG = {
  DEFAULT_THEME: 'light',
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [5, 10, 25, 50, 100],
  },
  DATE_FORMAT: 'MM/dd/yyyy',
  DATETIME_FORMAT: 'MM/dd/yyyy HH:mm',
  CURRENCY: 'USD',
};

// Business Settings
export const BUSINESS_CONFIG = {
  BUSINESS_NAME: process.env.REACT_APP_BUSINESS_NAME || 'BIZ MANAGE PRO',
  SUPPORT_EMAIL: process.env.REACT_APP_SUPPORT_EMAIL || 'support@bizmanagepro.com',
  SUPPORT_PHONE: process.env.REACT_APP_SUPPORT_PHONE || '+1-800-123-4567',
};

// Export default config
const config = {
  api: API_CONFIG,
  auth: AUTH_CONFIG,
  features: FEATURES,
  ui: UI_CONFIG,
  business: BUSINESS_CONFIG,
};

export default config; 
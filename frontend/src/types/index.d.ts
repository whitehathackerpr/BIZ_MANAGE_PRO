// User related types
export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  avatar?: string;
}

// Auth related types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

// Notification related types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  timestamp: string;
}

// Form related types
export interface FormField {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string;
  validation?: {
    pattern?: RegExp;
    message?: string;
  };
}

// API response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

// Component prop types
export interface BaseProps {
  className?: string;
  children?: React.ReactNode;
}

// Event handler types
export type ClickHandler = (e: React.MouseEvent<HTMLButtonElement>) => void;
export type ChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => void;
export type SubmitHandler = (e: React.FormEvent<HTMLFormElement>) => void;

// Theme types
export interface Theme {
  mode: 'light' | 'dark';
  primary: string;
  secondary: string;
  background: string;
  text: string;
}

// Store types
export interface StoreState {
  notifications: Notification[];
  theme: Theme;
}

export type StoreAction =
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'SET_THEME'; payload: Theme };

// Sales related types
export interface Sale {
  id: string;
  created_at: string;
  invoice_number: string;
  customer_name: string;
  total_amount: number;
  payment_method: string;
  status: string;
}

export interface SaleFormData {
  customer_id: string;
  payment_method: string;
  notes: string;
}

export interface SaleFilters {
  startDate: Date | null;
  endDate: Date | null;
  minAmount: string;
  maxAmount: string;
}

export interface SortConfig {
  key: keyof Sale;
  direction: 'asc' | 'desc';
}

// Dashboard related types
export interface Metrics {
  total_revenue: number;
  total_customers: number;
  total_products: number;
  total_sales: number;
}

export interface StockItem {
  id: string;
  name: string;
  quantity: number;
  min_quantity: number;
}

export interface Feedback {
  id: string;
  product_name: string;
  rating: number;
  comment: string;
}

export interface SalesData {
  date: string;
  amount: number;
}

// Activity related types
export interface Activity {
  id: string;
  type: string;
  description: string;
  created_at: string;
  metadata?: Record<string, any>;
}

// Security settings types
export interface SecuritySettings {
  two_factor_enabled: boolean;
  last_password_change: string;
  login_attempts: number;
  last_login: string;
  ip_whitelist: string[];
  device_whitelist: string[];
}

// Session types
export interface Session {
  id: string;
  device: string;
  ip: string;
  last_activity: string;
  created_at: string;
}

// Notification settings types
export interface NotificationSettings {
    email: boolean;
    push: boolean;
    sms: boolean;
    web3: boolean;
    realtime: boolean;
    preferences: {
        [key: string]: boolean;
    };
}

// Branch related types
export interface Branch {
    id: string;
    name: string;
    address: string;
    phone: string;
    email: string;
    manager_id?: string;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
}

// Employee related types
export interface Employee {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    branch_id: string;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
}

// Product related types
export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    cost: number;
    quantity: number;
    category: string;
    branch_id: string;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
} 
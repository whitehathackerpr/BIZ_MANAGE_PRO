export type UserRole = 'business_owner' | 'super_admin' | 'customer' | 'supplier' | 'employee';

export interface Permission {
  id: string;
  name: string;
  description: string;
  code: string;
}

export interface UserPermissions {
  canViewDashboard: boolean;
  canViewSales: boolean;
  canViewInventory: boolean;
  canViewCustomers: boolean;
  canViewSuppliers: boolean;
  canViewEmployees: boolean;
  canViewReports: boolean;
  canManageSettings: boolean;
  canManageUsers: boolean;
  canManageProducts: boolean;
  canManageOrders: boolean;
  canManagePayments: boolean;
}

export interface User {
  id: number;
  email: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  roles?: UserRole[];
  permissions?: UserPermissions;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  id: number;
  email: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
} 
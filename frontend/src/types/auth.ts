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
  name: string;
  email: string;
  role: UserRole;
  permissions: UserPermissions;
  business_id?: number;
  supplier_id?: number;
  employee_id?: number;
  created_at: string;
  updated_at: string;
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
  remember?: boolean;
}

export interface LoginResponse {
  success: boolean;
  user: User;
  token: string;
  refresh_token: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  business_name?: string;
  supplier_name?: string;
  employee_id?: string;
}

export interface RegisterResponse {
  success: boolean;
  user: User;
  token: string;
  refresh_token: string;
} 
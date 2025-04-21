export type UserRole = 'admin' | 'manager' | 'employee' | 'customer' | 'business_owner' | 'super_admin' | 'supplier';

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
  canManageInventory: boolean;
}

export interface User {
  id: number;
  email: string;
  full_name: string | null;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at: string;
  roles?: Role[];
  permissions?: UserPermissions;
  profile?: UserProfile;
}

export interface Role {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  permissions?: string[];
}

export interface UserProfile {
  id: number;
  user_id: number;
  phone: string | null;
  address: string | null;
  avatar: string | null;
  bio: string | null;
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
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
}

export interface RegisterResponse {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at: string;
  roles: Role[];
} 
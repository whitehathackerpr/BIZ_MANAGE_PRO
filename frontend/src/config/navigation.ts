import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  ShoppingCartOutlined,
  ShopOutlined,
  TeamOutlined,
  UserOutlined,
  BarChartOutlined,
  SettingOutlined,
  FileTextOutlined,
  ShoppingOutlined,
  WalletOutlined,
} from '@ant-design/icons';

export const roleNavigation: Record<string, MenuProps['items']> = {
  business_owner: [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'sales',
      icon: <ShoppingCartOutlined />,
      label: 'Sales',
      children: [
        { key: 'sales/orders', label: 'Orders' },
        { key: 'sales/transactions', label: 'Transactions' },
        { key: 'sales/customers', label: 'Customers' },
      ],
    },
    {
      key: 'inventory',
      icon: <ShopOutlined />,
      label: 'Inventory',
      children: [
        { key: 'inventory/products', label: 'Products' },
        { key: 'inventory/suppliers', label: 'Suppliers' },
        { key: 'inventory/categories', label: 'Categories' },
      ],
    },
    {
      key: 'employees',
      icon: <TeamOutlined />,
      label: 'Employees',
    },
    {
      key: 'reports',
      icon: <BarChartOutlined />,
      label: 'Reports',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ],
  super_admin: [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'users',
      icon: <UserOutlined />,
      label: 'Users',
    },
    {
      key: 'businesses',
      icon: <ShopOutlined />,
      label: 'Businesses',
    },
    {
      key: 'reports',
      icon: <BarChartOutlined />,
      label: 'Reports',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ],
  customer: [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'orders',
      icon: <ShoppingCartOutlined />,
      label: 'My Orders',
    },
    {
      key: 'products',
      icon: <ShopOutlined />,
      label: 'Products',
    },
    {
      key: 'payments',
      icon: <WalletOutlined />,
      label: 'Payments',
    },
  ],
  supplier: [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'products',
      icon: <ShopOutlined />,
      label: 'My Products',
    },
    {
      key: 'orders',
      icon: <ShoppingCartOutlined />,
      label: 'Orders',
    },
    {
      key: 'reports',
      icon: <BarChartOutlined />,
      label: 'Reports',
    },
  ],
  employee: [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'sales',
      icon: <ShoppingCartOutlined />,
      label: 'Sales',
      children: [
        { key: 'sales/orders', label: 'Orders' },
        { key: 'sales/customers', label: 'Customers' },
      ],
    },
    {
      key: 'inventory',
      icon: <ShopOutlined />,
      label: 'Inventory',
      children: [
        { key: 'inventory/products', label: 'Products' },
        { key: 'inventory/suppliers', label: 'Suppliers' },
      ],
    },
    {
      key: 'reports',
      icon: <BarChartOutlined />,
      label: 'Reports',
    },
  ],
}; 
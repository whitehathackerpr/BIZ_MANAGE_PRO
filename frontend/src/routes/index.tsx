import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import BusinessList from '../pages/BusinessList';
import ProductList from '../pages/ProductList';
import EmployeeList from '../pages/EmployeeList';
import InventoryList from '../pages/InventoryList';
import SupplierList from '../pages/SupplierList';
import CustomerList from '../pages/CustomerList';
import TransactionList from '../pages/TransactionList';
import ReportsPage from '../pages/ReportsPage';
import NotificationsList from '../pages/NotificationsList';
import RolesPage from '../pages/RolesPage';
import PermissionsPage from '../pages/PermissionsPage';
import ProfilePage from '../pages/ProfilePage';
import PerformancePage from '../pages/PerformancePage';
import BranchesPage from '../pages/BranchesPage';
import OrdersPage from '../pages/OrdersPage';
import TwoFactorPage from '../pages/TwoFactorPage';
import EmailVerificationPage from '../pages/EmailVerificationPage';
import PasswordResetRequestPage from '../pages/PasswordResetRequestPage';
import PasswordResetVerifyPage from '../pages/PasswordResetVerifyPage';
import PasswordResetNewPage from '../pages/PasswordResetNewPage';
import DashboardAnalyticsPage from '../pages/DashboardAnalyticsPage';
import SupplierPortalPage from '../pages/SupplierPortalPage';
import CustomerPortalPage from '../pages/CustomerPortalPage';

const AppRoutes: React.FC = () => {
  // TODO: Replace with real authentication logic
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="reset-password" element={<PasswordResetRequestPage />} />
        <Route path="reset-password/verify" element={<PasswordResetVerifyPage />} />
        <Route path="reset-password/new" element={<PasswordResetNewPage />} />
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <MainLayout>
                <Routes>
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="business" element={<BusinessList />} />
                  <Route path="products" element={<ProductList businessId={1} />} />
                  <Route path="employees" element={<EmployeeList businessId={1} />} />
                  <Route path="inventory" element={<InventoryList businessId={1} />} />
                  <Route path="suppliers" element={<SupplierList businessId={1} />} />
                  <Route path="customers" element={<CustomerList businessId={1} />} />
                  <Route path="transactions" element={<TransactionList businessId={1} />} />
                  <Route path="reports" element={<ReportsPage />} />
                  <Route path="notifications" element={<NotificationsList />} />
                  <Route path="roles" element={<RolesPage />} />
                  <Route path="permissions" element={<PermissionsPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="performance" element={<PerformancePage />} />
                  <Route path="branches" element={<BranchesPage />} />
                  <Route path="orders" element={<OrdersPage />} />
                  <Route path="2fa" element={<TwoFactorPage />} />
                  <Route path="verify-email" element={<EmailVerificationPage />} />
                  <Route path="dashboard-analytics" element={<DashboardAnalyticsPage />} />
                  <Route path="supplier-portal" element={<SupplierPortalPage />} />
                  <Route path="customer-portal" element={<CustomerPortalPage />} />
                  {/* Add more protected routes here */}
                  <Route path="*" element={<Navigate to="/dashboard" />} />
                </Routes>
              </MainLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes; 
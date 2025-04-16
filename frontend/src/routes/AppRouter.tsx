import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import AuthRedirect from '../components/auth/AuthRedirect';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import UnauthorizedPage from '../pages/auth/UnauthorizedPage';

// Protected Pages
import DashboardPage from '../pages/dashboard/DashboardPage';
import ProfilePage from '../pages/profile/ProfilePage';

// Admin Pages
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';

// Layout Components
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';

const AppRouter: React.FC = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Auth Routes - Redirects to dashboard if user is already logged in */}
        <Route element={<AuthLayout />}>
          <Route element={<AuthRedirect />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          </Route>
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
        </Route>

        {/* Protected Routes - Requires authentication */}
        <Route element={<MainLayout />}>
          <Route element={<ProtectedRoute />}>
            {/* User Routes */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            
            {/* Admin Routes - Requires admin role */}
            <Route element={<ProtectedRoute requireAdmin />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
            </Route>
          </Route>
        </Route>

        {/* Default Route - Redirect to Dashboard or Login */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
};

export default AppRouter; 
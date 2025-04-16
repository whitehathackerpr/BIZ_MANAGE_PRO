import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/common/ProtectedRoute';
import Dashboard from '../components/Dashboard';
import Login from '../components/auth/Login';
import Unauthorized from '../components/auth/Unauthorized';
import Sales from '../components/sales/Sales';
import Inventory from '../components/inventory/Inventory';
import Employees from '../components/employees/Employees';
import Settings from '../components/settings/Settings';
import Profile from '../components/profile/Profile';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute
            requiredPermissions={['canViewDashboard']}
          >
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/sales/*"
        element={
          <ProtectedRoute
            requiredPermissions={['canViewSales']}
          >
            <Sales />
          </ProtectedRoute>
        }
      />

      <Route
        path="/inventory/*"
        element={
          <ProtectedRoute
            requiredPermissions={['canViewInventory']}
          >
            <Inventory />
          </ProtectedRoute>
        }
      />

      <Route
        path="/employees/*"
        element={
          <ProtectedRoute
            requiredPermissions={['canViewEmployees']}
            requiredRoles={['admin', 'manager']}
          >
            <Employees />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings/*"
        element={
          <ProtectedRoute
            requiredPermissions={['canManageSettings']}
            requiredRoles={['admin']}
          >
            <Settings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Default Routes */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes; 
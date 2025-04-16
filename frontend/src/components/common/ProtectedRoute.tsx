import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/authService';
import type { UserPermissions } from '../../types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: Array<keyof UserPermissions>;
  requiredRoles?: Array<'admin' | 'manager' | 'employee' | 'viewer'>;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermissions = [],
  requiredRoles = [],
}) => {
  const location = useLocation();

  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const hasRequiredPermissions = requiredPermissions.length === 0 || 
    requiredPermissions.every(permission => authService.hasPermission(permission));

  const hasRequiredRoles = requiredRoles.length === 0 || 
    requiredRoles.some(role => authService.hasRole(role));

  if (!hasRequiredPermissions || !hasRequiredRoles) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 
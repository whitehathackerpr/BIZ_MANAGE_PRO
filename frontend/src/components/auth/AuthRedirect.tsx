import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Spinner from '../common/Spinner';

/**
 * AuthRedirect handles redirecting authenticated users away from auth pages
 * For example, if user is logged in and tries to access /login, redirect to dashboard
 */
const AuthRedirect: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  
  // Get the intended destination from the state (if available)
  const from = location.state?.from?.pathname || '/dashboard';

  // Show spinner while checking auth status
  if (loading) {
    return <Spinner text="Checking authentication..." />;
  }

  // If user is authenticated, redirect to dashboard or the intended destination
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  // Render child routes for non-authenticated users
  return <Outlet />;
};

export default AuthRedirect; 
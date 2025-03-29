import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import theme from './theme';
import MainLayout from './components/layout/MainLayout';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Sales from './pages/Sales';
import Employees from './pages/Employees';
import Analytics from './pages/Analytics';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import NotificationSettings from './components/notifications/NotificationSettings';
import AdminNotificationPanel from './components/notifications/AdminNotificationPanel';
import UserManagement from './components/admin/UserManagement';
import BusinessProfile from './components/admin/BusinessProfile';
import BranchManagement from './components/admin/BranchManagement';

const queryClient = new QueryClient();

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <AuthProvider>
            <NotificationProvider>
              <Router>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Protected Routes */}
                  <Route
                    path="/"
                    element={
                      <PrivateRoute>
                        <MainLayout>
                          <Dashboard />
                        </MainLayout>
                      </PrivateRoute>
                    }
                  >
                    <Route index element={<Dashboard />} />
                    <Route
                      path="notifications/settings"
                      element={<NotificationSettings />}
                    />
                    <Route
                      path="admin/notifications"
                      element={
                        <AdminRoute>
                          <AdminNotificationPanel />
                        </AdminRoute>
                      }
                    />
                  </Route>
                  <Route
                    path="/inventory"
                    element={
                      <PrivateRoute>
                        <MainLayout>
                          <Inventory />
                        </MainLayout>
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/sales"
                    element={
                      <PrivateRoute>
                        <MainLayout>
                          <Sales />
                        </MainLayout>
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/employees"
                    element={
                      <PrivateRoute>
                        <MainLayout>
                          <Employees />
                        </MainLayout>
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/analytics"
                    element={
                      <PrivateRoute>
                        <MainLayout>
                          <Analytics />
                        </MainLayout>
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/notifications"
                    element={
                      <PrivateRoute>
                        <MainLayout>
                          <Notifications />
                        </MainLayout>
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <PrivateRoute>
                        <MainLayout>
                          <Settings />
                        </MainLayout>
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <PrivateRoute>
                        <MainLayout>
                          <Profile />
                        </MainLayout>
                      </PrivateRoute>
                    }
                  />

                  {/* Admin Routes */}
                  <Route
                    path="/admin/users"
                    element={
                      <AdminRoute>
                        <MainLayout>
                          <UserManagement />
                        </MainLayout>
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/business"
                    element={
                      <AdminRoute>
                        <MainLayout>
                          <BusinessProfile />
                        </MainLayout>
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/notifications"
                    element={
                      <AdminRoute>
                        <MainLayout>
                          <AdminNotificationPanel />
                        </MainLayout>
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/branches"
                    element={
                      <AdminRoute>
                        <MainLayout>
                          <BranchManagement />
                        </MainLayout>
                      </AdminRoute>
                    }
                  />

                  {/* Catch all route */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Router>
            </NotificationProvider>
          </AuthProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;

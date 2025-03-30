import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RtlProvider } from './components/RtlProvider';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import theme from './theme';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/admin/Dashboard';
import UserManagement from './components/admin/UserManagement';
import BranchManagement from './components/admin/branch/BranchManagement';
import BranchPerformance from './components/admin/branch/BranchPerformance';
import BranchInventory from './components/admin/branch/BranchInventory';
import BranchUsers from './components/admin/branch/BranchUsers';
import BusinessProfile from './components/admin/BusinessProfile';
import Settings from './components/admin/Settings';
import NotFound from './components/NotFound';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});

const App = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider theme={theme}>
                <RtlProvider>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <AuthProvider>
                            <NotificationProvider>
                                <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                                    <Routes>
                                        <Route path="/login" element={<Login />} />
                                        <Route path="/register" element={<Register />} />
                                        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
                                            <Route index element={<Navigate to="/dashboard" replace />} />
                                            <Route path="dashboard" element={<Dashboard />} />
                                            <Route path="profile" element={<BusinessProfile />} />
                                            <Route path="settings" element={<Settings />} />
                                            <Route path="*" element={<NotFound />} />
                                        </Route>
                                        <Route path="/admin" element={<AdminRoute><Layout /></AdminRoute>}>
                                            <Route index element={<Navigate to="/admin/dashboard" replace />} />
                                            <Route path="dashboard" element={<Dashboard />} />
                                            <Route path="users" element={<UserManagement />} />
                                            <Route path="branches" element={<BranchManagement />} />
                                            <Route path="branches/:id/performance" element={<BranchPerformance />} />
                                            <Route path="branches/:id/inventory" element={<BranchInventory />} />
                                            <Route path="branches/:id/users" element={<BranchUsers />} />
                                            <Route path="profile" element={<BusinessProfile />} />
                                            <Route path="settings" element={<Settings />} />
                                            <Route path="*" element={<NotFound />} />
                                        </Route>
                                    </Routes>
                                </Router>
                            </NotificationProvider>
                        </AuthProvider>
                    </LocalizationProvider>
                </RtlProvider>
            </ThemeProvider>
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
};

export default App;

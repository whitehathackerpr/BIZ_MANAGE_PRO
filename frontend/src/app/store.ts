import { configureStore } from '@reduxjs/toolkit';
import { businessReducer } from '../features/business';
import { authReducer } from '../features/auth';
import { productsReducer } from '../features/products';
import { employeesReducer } from '../features/employees';
import { inventoryReducer } from '../features/inventory';
import { suppliersReducer } from '../features/suppliers';
import { customersReducer } from '../features/customers';
import { transactionsReducer } from '../features/transactions';
import { reportsReducer } from '../features/reports';
import { notificationsReducer } from '../features/notifications';
import { rolesReducer, permissionsReducer } from '../features/roles';
import { profileReducer } from '../features/profile';
import { performanceReducer } from '../features/performance';
import { branchesReducer } from '../features/branches';
import { ordersReducer } from '../features/orders';
import { dashboardReducer } from '../features/dashboard';
import { supplierPortalReducer } from '../features/supplierPortal';
import { customerPortalReducer } from '../features/customerPortal';

const store = configureStore({
  reducer: {
    business: businessReducer,
    auth: authReducer,
    products: productsReducer,
    employees: employeesReducer,
    inventory: inventoryReducer,
    suppliers: suppliersReducer,
    customers: customersReducer,
    transactions: transactionsReducer,
    reports: reportsReducer,
    notifications: notificationsReducer,
    roles: rolesReducer,
    permissions: permissionsReducer,
    profile: profileReducer,
    performance: performanceReducer,
    branches: branchesReducer,
    orders: ordersReducer,
    dashboard: dashboardReducer,
    supplierPortal: supplierPortalReducer,
    customerPortal: customerPortalReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store; 
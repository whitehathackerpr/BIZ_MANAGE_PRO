import { useQuery } from '@tanstack/react-query';
import {
  dashboardApi,
  salesApi,
  inventoryApi,
  customerApi,
  financialApi,
} from '../services/api';

export const useDashboardData = () => {
  const { data: salesOverview, isLoading: salesLoading } = useQuery({
    queryKey: ['salesOverview'],
    queryFn: dashboardApi.getSalesOverview,
  });

  const { data: inventoryStatus, isLoading: inventoryLoading } = useQuery({
    queryKey: ['inventoryStatus'],
    queryFn: dashboardApi.getInventoryStatus,
  });

  const { data: customerStats, isLoading: customerLoading } = useQuery({
    queryKey: ['customerStats'],
    queryFn: dashboardApi.getCustomerStats,
  });

  const { data: financialOverview, isLoading: financialLoading } = useQuery({
    queryKey: ['financialOverview'],
    queryFn: dashboardApi.getFinancialOverview,
  });

  const { data: recentActivities, isLoading: activitiesLoading } = useQuery({
    queryKey: ['recentActivities'],
    queryFn: dashboardApi.getRecentActivities,
  });

  const { data: productCategories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['productCategories'],
    queryFn: dashboardApi.getProductCategories,
  });

  return {
    salesOverview,
    inventoryStatus,
    customerStats,
    financialOverview,
    recentActivities,
    productCategories,
    isLoading: salesLoading || inventoryLoading || customerLoading || 
               financialLoading || activitiesLoading || categoriesLoading,
  };
};

export const useSalesData = (params) => {
  const { data: salesData, isLoading } = useQuery({
    queryKey: ['salesData', params],
    queryFn: () => salesApi.getSalesData(params),
  });

  const { data: salesByCategory, isLoading: categoryLoading } = useQuery({
    queryKey: ['salesByCategory'],
    queryFn: salesApi.getSalesByCategory,
  });

  const { data: salesPerformance, isLoading: performanceLoading } = useQuery({
    queryKey: ['salesPerformance', params],
    queryFn: () => salesApi.getSalesPerformance(params),
  });

  return {
    salesData,
    salesByCategory,
    salesPerformance,
    isLoading: isLoading || categoryLoading || performanceLoading,
  };
};

export const useInventoryData = () => {
  const { data: inventoryStatus, isLoading } = useQuery({
    queryKey: ['inventoryStatus'],
    queryFn: inventoryApi.getInventoryStatus,
  });

  const { data: lowStockItems, isLoading: lowStockLoading } = useQuery({
    queryKey: ['lowStockItems'],
    queryFn: inventoryApi.getLowStockItems,
  });

  const { data: inventoryByCategory, isLoading: categoryLoading } = useQuery({
    queryKey: ['inventoryByCategory'],
    queryFn: inventoryApi.getInventoryByCategory,
  });

  return {
    inventoryStatus,
    lowStockItems,
    inventoryByCategory,
    isLoading: isLoading || lowStockLoading || categoryLoading,
  };
};

export const useCustomerData = () => {
  const { data: customerOverview, isLoading } = useQuery({
    queryKey: ['customerOverview'],
    queryFn: customerApi.getCustomerOverview,
  });

  const { data: customerFeedback, isLoading: feedbackLoading } = useQuery({
    queryKey: ['customerFeedback'],
    queryFn: customerApi.getCustomerFeedback,
  });

  const { data: customerGrowth, isLoading: growthLoading } = useQuery({
    queryKey: ['customerGrowth'],
    queryFn: customerApi.getCustomerGrowth,
  });

  return {
    customerOverview,
    customerFeedback,
    customerGrowth,
    isLoading: isLoading || feedbackLoading || growthLoading,
  };
};

export const useFinancialData = (params) => {
  const { data: financialOverview, isLoading } = useQuery({
    queryKey: ['financialOverview'],
    queryFn: financialApi.getFinancialOverview,
  });

  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ['revenueData', params],
    queryFn: () => financialApi.getRevenueData(params),
  });

  const { data: expenseData, isLoading: expenseLoading } = useQuery({
    queryKey: ['expenseData', params],
    queryFn: () => financialApi.getExpenseData(params),
  });

  return {
    financialOverview,
    revenueData,
    expenseData,
    isLoading: isLoading || revenueLoading || expenseLoading,
  };
}; 
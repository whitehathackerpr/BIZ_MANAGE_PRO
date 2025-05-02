import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  fetchSalesReport,
  fetchInventoryReport,
  fetchFinancialReport,
  Report
} from './reportsAPI';

interface ReportsState {
  salesReport: Report | null;
  inventoryReport: Report | null;
  financialReport: Report | null;
  loading: boolean;
  error: string | null;
}

const initialState: ReportsState = {
  salesReport: null,
  inventoryReport: null,
  financialReport: null,
  loading: false,
  error: null,
};

export const getSalesReport = createAsyncThunk('reports/sales', async (params: { business_id: number; start_date: string; end_date: string }) => {
  return await fetchSalesReport(params.business_id, params.start_date, params.end_date);
});

export const getInventoryReport = createAsyncThunk('reports/inventory', async (params: { business_id: number; start_date: string; end_date: string }) => {
  return await fetchInventoryReport(params.business_id, params.start_date, params.end_date);
});

export const getFinancialReport = createAsyncThunk('reports/financial', async (params: { business_id: number; start_date: string; end_date: string }) => {
  return await fetchFinancialReport(params.business_id, params.start_date, params.end_date);
});

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getSalesReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSalesReport.fulfilled, (state, action: PayloadAction<Report>) => {
        state.loading = false;
        state.salesReport = action.payload;
      })
      .addCase(getSalesReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch sales report';
      })
      .addCase(getInventoryReport.fulfilled, (state, action: PayloadAction<Report>) => {
        state.inventoryReport = action.payload;
      })
      .addCase(getFinancialReport.fulfilled, (state, action: PayloadAction<Report>) => {
        state.financialReport = action.payload;
      });
  },
});

export default reportsSlice.reducer; 
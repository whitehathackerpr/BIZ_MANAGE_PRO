import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  getSalesTrends,
  getTopProducts,
  getInventoryTrends,
  getKPIs,
  SalesTrend,
  TopProduct,
  InventoryTrend,
  KPI,
} from './dashboardAPI';

interface DashboardState {
  salesTrends: SalesTrend[];
  topProducts: TopProduct[];
  inventoryTrends: InventoryTrend[];
  kpis: KPI[];
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  salesTrends: [],
  topProducts: [],
  inventoryTrends: [],
  kpis: [],
  loading: false,
  error: null,
};

export const fetchSalesTrends = createAsyncThunk('dashboard/fetchSalesTrends', async (business_id: number) => {
  return await getSalesTrends(business_id);
});
export const fetchTopProducts = createAsyncThunk('dashboard/fetchTopProducts', async (business_id: number) => {
  return await getTopProducts(business_id);
});
export const fetchInventoryTrends = createAsyncThunk('dashboard/fetchInventoryTrends', async (business_id: number) => {
  return await getInventoryTrends(business_id);
});
export const fetchKPIs = createAsyncThunk('dashboard/fetchKPIs', async (business_id: number) => {
  return await getKPIs(business_id);
});

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSalesTrends.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSalesTrends.fulfilled, (state, action: PayloadAction<SalesTrend[]>) => {
        state.loading = false;
        state.salesTrends = action.payload;
      })
      .addCase(fetchSalesTrends.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch sales trends';
      })
      .addCase(fetchTopProducts.fulfilled, (state, action: PayloadAction<TopProduct[]>) => {
        state.topProducts = action.payload;
      })
      .addCase(fetchInventoryTrends.fulfilled, (state, action: PayloadAction<InventoryTrend[]>) => {
        state.inventoryTrends = action.payload;
      })
      .addCase(fetchKPIs.fulfilled, (state, action: PayloadAction<KPI[]>) => {
        state.kpis = action.payload;
      });
  },
});

export default dashboardSlice.reducer; 
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  fetchMetrics,
  fetchReviews,
  fetchSummary,
  fetchDashboard,
  PerformanceMetric,
  PerformanceReview,
  PerformanceSummary,
  PerformanceDashboard
} from './performanceAPI';

interface PerformanceState {
  metrics: PerformanceMetric[];
  reviews: PerformanceReview[];
  summary: PerformanceSummary | null;
  dashboard: PerformanceDashboard | null;
  loading: boolean;
  error: string | null;
}

const initialState: PerformanceState = {
  metrics: [],
  reviews: [],
  summary: null,
  dashboard: null,
  loading: false,
  error: null,
};

export const getMetrics = createAsyncThunk('performance/metrics', async (params: { employee_id?: number; metric_type?: string; start_date?: string; end_date?: string }) => {
  return await fetchMetrics(params.employee_id, params.metric_type, params.start_date, params.end_date);
});

export const getReviews = createAsyncThunk('performance/reviews', async (params: { employee_id?: number; start_date?: string; end_date?: string }) => {
  return await fetchReviews(params.employee_id, params.start_date, params.end_date);
});

export const getSummary = createAsyncThunk('performance/summary', async (params: { employee_id: number; period?: number }) => {
  return await fetchSummary(params.employee_id, params.period);
});

export const getDashboard = createAsyncThunk('performance/dashboard', async (params: { employee_id: number; period?: number }) => {
  return await fetchDashboard(params.employee_id, params.period);
});

const performanceSlice = createSlice({
  name: 'performance',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getMetrics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMetrics.fulfilled, (state, action: PayloadAction<PerformanceMetric[]>) => {
        state.loading = false;
        state.metrics = action.payload;
      })
      .addCase(getMetrics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch metrics';
      })
      .addCase(getReviews.fulfilled, (state, action: PayloadAction<PerformanceReview[]>) => {
        state.reviews = action.payload;
      })
      .addCase(getSummary.fulfilled, (state, action: PayloadAction<PerformanceSummary>) => {
        state.summary = action.payload;
      })
      .addCase(getDashboard.fulfilled, (state, action: PayloadAction<PerformanceDashboard>) => {
        state.dashboard = action.payload;
      });
  },
});

export default performanceSlice.reducer; 
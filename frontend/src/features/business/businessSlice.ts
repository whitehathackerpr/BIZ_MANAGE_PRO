import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Business, BusinessCreate, BusinessUpdate, fetchBusinesses, createBusiness, updateBusiness, deleteBusiness } from './businessAPI';

interface BusinessState {
  businesses: Business[];
  loading: boolean;
  error: string | null;
}

const initialState: BusinessState = {
  businesses: [],
  loading: false,
  error: null,
};

export const getBusinesses = createAsyncThunk('business/fetchAll', async () => {
  return await fetchBusinesses();
});

export const addBusiness = createAsyncThunk('business/create', async (data: BusinessCreate) => {
  return await createBusiness(data);
});

export const editBusiness = createAsyncThunk('business/update', async ({ id, data }: { id: number; data: BusinessUpdate }) => {
  return await updateBusiness(id, data);
});

export const removeBusiness = createAsyncThunk('business/delete', async (id: number) => {
  return await deleteBusiness(id);
});

const businessSlice = createSlice({
  name: 'business',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getBusinesses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBusinesses.fulfilled, (state, action: PayloadAction<Business[]>) => {
        state.loading = false;
        state.businesses = action.payload;
      })
      .addCase(getBusinesses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch businesses';
      })
      .addCase(addBusiness.fulfilled, (state, action: PayloadAction<Business>) => {
        state.businesses.push(action.payload);
      })
      .addCase(editBusiness.fulfilled, (state, action: PayloadAction<Business>) => {
        const idx = state.businesses.findIndex(b => b.id === action.payload.id);
        if (idx !== -1) state.businesses[idx] = action.payload;
      })
      .addCase(removeBusiness.fulfilled, (state, action: PayloadAction<Business>) => {
        state.businesses = state.businesses.filter(b => b.id !== action.payload.id);
      });
  },
});

export default businessSlice.reducer; 
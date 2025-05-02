import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  fetchSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  Supplier,
  SupplierCreate,
  SupplierUpdate
} from './suppliersAPI';

interface SuppliersState {
  suppliers: Supplier[];
  loading: boolean;
  error: string | null;
}

const initialState: SuppliersState = {
  suppliers: [],
  loading: false,
  error: null,
};

export const getSuppliers = createAsyncThunk('suppliers/fetchAll', async (business_id: number) => {
  return await fetchSuppliers(business_id);
});

export const addSupplier = createAsyncThunk('suppliers/create', async (data: SupplierCreate) => {
  return await createSupplier(data);
});

export const editSupplier = createAsyncThunk('suppliers/update', async ({ id, data }: { id: number; data: SupplierUpdate }) => {
  return await updateSupplier(id, data);
});

export const removeSupplier = createAsyncThunk('suppliers/delete', async (id: number) => {
  return await deleteSupplier(id);
});

const suppliersSlice = createSlice({
  name: 'suppliers',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getSuppliers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSuppliers.fulfilled, (state, action: PayloadAction<Supplier[]>) => {
        state.loading = false;
        state.suppliers = action.payload;
      })
      .addCase(getSuppliers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch suppliers';
      })
      .addCase(addSupplier.fulfilled, (state, action: PayloadAction<Supplier>) => {
        state.suppliers.push(action.payload);
      })
      .addCase(editSupplier.fulfilled, (state, action: PayloadAction<Supplier>) => {
        const idx = state.suppliers.findIndex(s => s.id === action.payload.id);
        if (idx !== -1) state.suppliers[idx] = action.payload;
      })
      .addCase(removeSupplier.fulfilled, (state, action: PayloadAction<Supplier>) => {
        state.suppliers = state.suppliers.filter(s => s.id !== action.payload.id);
      });
  },
});

export default suppliersSlice.reducer; 
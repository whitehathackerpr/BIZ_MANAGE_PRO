import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  fetchCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  Customer,
  CustomerCreate,
  CustomerUpdate
} from './customersAPI';

interface CustomersState {
  customers: Customer[];
  loading: boolean;
  error: string | null;
}

const initialState: CustomersState = {
  customers: [],
  loading: false,
  error: null,
};

export const getCustomers = createAsyncThunk('customers/fetchAll', async (business_id: number) => {
  return await fetchCustomers(business_id);
});

export const addCustomer = createAsyncThunk('customers/create', async (data: CustomerCreate) => {
  return await createCustomer(data);
});

export const editCustomer = createAsyncThunk('customers/update', async ({ id, data }: { id: number; data: CustomerUpdate }) => {
  return await updateCustomer(id, data);
});

export const removeCustomer = createAsyncThunk('customers/delete', async (id: number) => {
  return await deleteCustomer(id);
});

const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCustomers.fulfilled, (state, action: PayloadAction<Customer[]>) => {
        state.loading = false;
        state.customers = action.payload;
      })
      .addCase(getCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch customers';
      })
      .addCase(addCustomer.fulfilled, (state, action: PayloadAction<Customer>) => {
        state.customers.push(action.payload);
      })
      .addCase(editCustomer.fulfilled, (state, action: PayloadAction<Customer>) => {
        const idx = state.customers.findIndex(c => c.id === action.payload.id);
        if (idx !== -1) state.customers[idx] = action.payload;
      })
      .addCase(removeCustomer.fulfilled, (state, action: PayloadAction<Customer>) => {
        state.customers = state.customers.filter(c => c.id !== action.payload.id);
      });
  },
});

export default customersSlice.reducer; 
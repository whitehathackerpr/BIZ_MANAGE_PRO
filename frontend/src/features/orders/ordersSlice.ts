import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Order, OrderCreate, OrderUpdate, fetchOrders, fetchOrder, createOrder, updateOrder, deleteOrder } from './ordersAPI';

interface OrdersState {
  orders: Order[];
  selectedOrder: Order | null;
  loading: boolean;
  error: string | null;
}

const initialState: OrdersState = {
  orders: [],
  selectedOrder: null,
  loading: false,
  error: null,
};

export const getOrders = createAsyncThunk('orders/fetchAll', async (business_id: number) => {
  return await fetchOrders(business_id);
});

export const getOrder = createAsyncThunk('orders/fetchOne', async ({ business_id, order_id }: { business_id: number; order_id: number }) => {
  return await fetchOrder(business_id, order_id);
});

export const addOrder = createAsyncThunk('orders/create', async ({ business_id, data }: { business_id: number; data: OrderCreate }) => {
  return await createOrder(business_id, data);
});

export const editOrder = createAsyncThunk('orders/update', async ({ business_id, order_id, data }: { business_id: number; order_id: number; data: OrderUpdate }) => {
  return await updateOrder(business_id, order_id, data);
});

export const removeOrder = createAsyncThunk('orders/delete', async ({ business_id, order_id }: { business_id: number; order_id: number }) => {
  return await deleteOrder(business_id, order_id);
});

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearSelectedOrder(state) {
      state.selectedOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrders.fulfilled, (state, action: PayloadAction<Order[]>) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(getOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch orders';
      })
      .addCase(getOrder.fulfilled, (state, action: PayloadAction<Order>) => {
        state.selectedOrder = action.payload;
      })
      .addCase(addOrder.fulfilled, (state, action: PayloadAction<Order>) => {
        state.orders.push(action.payload);
      })
      .addCase(editOrder.fulfilled, (state, action: PayloadAction<Order>) => {
        const idx = state.orders.findIndex(o => o.id === action.payload.id);
        if (idx !== -1) state.orders[idx] = action.payload;
      })
      .addCase(removeOrder.fulfilled, (state, action: PayloadAction<Order>) => {
        state.orders = state.orders.filter(o => o.id !== action.payload.id);
      });
  },
});

export const { clearSelectedOrder } = ordersSlice.actions;
export default ordersSlice.reducer; 
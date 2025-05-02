import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  fetchInventory,
  updateInventoryItem,
  fetchLowStockItems,
  fetchExpiredProducts,
  fetchStockMovements,
  createStockMovement,
  InventoryItem,
  InventoryUpdate,
  StockMovement
} from './inventoryAPI';

interface InventoryState {
  items: InventoryItem[];
  loading: boolean;
  error: string | null;
  lowStock: InventoryItem[];
  expired: InventoryItem[];
  stockMovements: StockMovement[];
}

const initialState: InventoryState = {
  items: [],
  loading: false,
  error: null,
  lowStock: [],
  expired: [],
  stockMovements: [],
};

export const getInventory = createAsyncThunk('inventory/fetchAll', async (business_id: number) => {
  return await fetchInventory(business_id);
});

export const updateInventory = createAsyncThunk('inventory/update', async ({ id, data }: { id: number; data: InventoryUpdate }) => {
  return await updateInventoryItem(id, data);
});

export const getLowStock = createAsyncThunk('inventory/lowStock', async (business_id: number) => {
  return await fetchLowStockItems(business_id);
});

export const getExpired = createAsyncThunk('inventory/expired', async (business_id: number) => {
  return await fetchExpiredProducts(business_id);
});

export const getStockMovements = createAsyncThunk('inventory/stockMovements', async (inventory_id: number) => {
  return await fetchStockMovements(inventory_id);
});

export const addStockMovement = createAsyncThunk('inventory/addStockMovement', async (data: Omit<StockMovement, 'id'>) => {
  return await createStockMovement(data);
});

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getInventory.fulfilled, (state, action: PayloadAction<InventoryItem[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(getInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch inventory';
      })
      .addCase(updateInventory.fulfilled, (state, action: PayloadAction<InventoryItem>) => {
        const idx = state.items.findIndex(i => i.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(getLowStock.fulfilled, (state, action: PayloadAction<InventoryItem[]>) => {
        state.lowStock = action.payload;
      })
      .addCase(getExpired.fulfilled, (state, action: PayloadAction<InventoryItem[]>) => {
        state.expired = action.payload;
      })
      .addCase(getStockMovements.fulfilled, (state, action: PayloadAction<StockMovement[]>) => {
        state.stockMovements = action.payload;
      })
      .addCase(addStockMovement.fulfilled, (state, action: PayloadAction<StockMovement>) => {
        state.stockMovements.push(action.payload);
      });
  },
});

export default inventorySlice.reducer; 
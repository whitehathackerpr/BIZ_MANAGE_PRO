import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  fetchTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  Transaction,
  TransactionCreate,
  TransactionUpdate
} from './transactionsAPI';

interface TransactionsState {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
}

const initialState: TransactionsState = {
  transactions: [],
  loading: false,
  error: null,
};

export const getTransactions = createAsyncThunk('transactions/fetchAll', async (business_id: number) => {
  return await fetchTransactions(business_id);
});

export const addTransaction = createAsyncThunk('transactions/create', async (data: TransactionCreate) => {
  return await createTransaction(data);
});

export const editTransaction = createAsyncThunk('transactions/update', async ({ id, data }: { id: number; data: TransactionUpdate }) => {
  return await updateTransaction(id, data);
});

export const removeTransaction = createAsyncThunk('transactions/delete', async (id: number) => {
  return await deleteTransaction(id);
});

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTransactions.fulfilled, (state, action: PayloadAction<Transaction[]>) => {
        state.loading = false;
        state.transactions = action.payload;
      })
      .addCase(getTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch transactions';
      })
      .addCase(addTransaction.fulfilled, (state, action: PayloadAction<Transaction>) => {
        state.transactions.push(action.payload);
      })
      .addCase(editTransaction.fulfilled, (state, action: PayloadAction<Transaction>) => {
        const idx = state.transactions.findIndex(t => t.id === action.payload.id);
        if (idx !== -1) state.transactions[idx] = action.payload;
      })
      .addCase(removeTransaction.fulfilled, (state, action: PayloadAction<Transaction>) => {
        state.transactions = state.transactions.filter(t => t.id !== action.payload.id);
      });
  },
});

export default transactionsSlice.reducer; 
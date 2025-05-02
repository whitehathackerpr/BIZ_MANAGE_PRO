import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  getSupplierProfile,
  getSupplierOrderHistory,
  submitSupplierFeedback,
  getSupplierLoyalty,
  getSupplierMessages,
  sendSupplierMessage,
  getSupplierAnalytics,
  getSupplierNotifications,
  SupplierProfile,
  SupplierOrder,
  SupplierLoyalty,
  SupplierMessage,
  SupplierAnalytics,
  SupplierNotification,
} from './supplierPortalAPI';

interface SupplierPortalState {
  profile: SupplierProfile | null;
  orders: SupplierOrder[];
  loyalty: SupplierLoyalty | null;
  feedbackSuccess: boolean;
  messages: SupplierMessage[];
  messageSendSuccess: boolean;
  analytics: SupplierAnalytics | null;
  notifications: SupplierNotification[];
  loading: boolean;
  error: string | null;
}

const initialState: SupplierPortalState = {
  profile: null,
  orders: [],
  loyalty: null,
  feedbackSuccess: false,
  messages: [],
  messageSendSuccess: false,
  analytics: null,
  notifications: [],
  loading: false,
  error: null,
};

export const fetchSupplierProfile = createAsyncThunk('supplierPortal/fetchProfile', async () => {
  return await getSupplierProfile();
});
export const fetchSupplierOrderHistory = createAsyncThunk('supplierPortal/fetchOrders', async () => {
  return await getSupplierOrderHistory();
});
export const fetchSupplierLoyalty = createAsyncThunk('supplierPortal/fetchLoyalty', async () => {
  return await getSupplierLoyalty();
});
export const submitSupplierFeedbackThunk = createAsyncThunk('supplierPortal/submitFeedback', async (message: string) => {
  return await submitSupplierFeedback(message);
});
export const fetchSupplierMessages = createAsyncThunk('supplierPortal/fetchMessages', async () => {
  return await getSupplierMessages();
});
export const sendSupplierMessageThunk = createAsyncThunk('supplierPortal/sendMessage', async (content: string) => {
  return await sendSupplierMessage(content);
});
export const fetchSupplierAnalytics = createAsyncThunk('supplierPortal/fetchAnalytics', async () => {
  return await getSupplierAnalytics();
});
export const fetchSupplierNotifications = createAsyncThunk('supplierPortal/fetchNotifications', async () => {
  return await getSupplierNotifications();
});

const supplierPortalSlice = createSlice({
  name: 'supplierPortal',
  initialState,
  reducers: {
    clearFeedbackSuccess(state) {
      state.feedbackSuccess = false;
    },
    clearMessageSendSuccess(state) {
      state.messageSendSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSupplierProfile.fulfilled, (state, action: PayloadAction<SupplierProfile>) => {
        state.profile = action.payload;
      })
      .addCase(fetchSupplierOrderHistory.fulfilled, (state, action: PayloadAction<SupplierOrder[]>) => {
        state.orders = action.payload;
      })
      .addCase(fetchSupplierLoyalty.fulfilled, (state, action: PayloadAction<SupplierLoyalty>) => {
        state.loyalty = action.payload;
      })
      .addCase(submitSupplierFeedbackThunk.fulfilled, (state) => {
        state.feedbackSuccess = true;
      })
      .addCase(fetchSupplierMessages.fulfilled, (state, action: PayloadAction<SupplierMessage[]>) => {
        state.messages = action.payload;
      })
      .addCase(sendSupplierMessageThunk.fulfilled, (state) => {
        state.messageSendSuccess = true;
      })
      .addCase(fetchSupplierAnalytics.fulfilled, (state, action: PayloadAction<SupplierAnalytics>) => {
        state.analytics = action.payload;
      })
      .addCase(fetchSupplierNotifications.fulfilled, (state, action: PayloadAction<SupplierNotification[]>) => {
        state.notifications = action.payload;
      });
  },
});

export const { clearFeedbackSuccess, clearMessageSendSuccess } = supplierPortalSlice.actions;
export default supplierPortalSlice.reducer; 
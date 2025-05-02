import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  getCustomerProfile,
  getCustomerOrderHistory,
  submitCustomerFeedback,
  getCustomerLoyalty,
  getCustomerMessages,
  sendCustomerMessage,
  getCustomerAnalytics,
  getCustomerNotifications,
  CustomerProfile,
  CustomerOrder,
  CustomerLoyalty,
  CustomerMessage,
  CustomerAnalytics,
  CustomerNotification,
} from './customerPortalAPI';

interface CustomerPortalState {
  profile: CustomerProfile | null;
  orders: CustomerOrder[];
  loyalty: CustomerLoyalty | null;
  feedbackSuccess: boolean;
  messages: CustomerMessage[];
  messageSendSuccess: boolean;
  analytics: CustomerAnalytics | null;
  notifications: CustomerNotification[];
  loading: boolean;
  error: string | null;
}

const initialState: CustomerPortalState = {
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

export const fetchCustomerProfile = createAsyncThunk('customerPortal/fetchProfile', async () => {
  return await getCustomerProfile();
});
export const fetchCustomerOrderHistory = createAsyncThunk('customerPortal/fetchOrders', async () => {
  return await getCustomerOrderHistory();
});
export const fetchCustomerLoyalty = createAsyncThunk('customerPortal/fetchLoyalty', async () => {
  return await getCustomerLoyalty();
});
export const submitCustomerFeedbackThunk = createAsyncThunk('customerPortal/submitFeedback', async (message: string) => {
  return await submitCustomerFeedback(message);
});
export const fetchCustomerMessages = createAsyncThunk('customerPortal/fetchMessages', async () => {
  return await getCustomerMessages();
});
export const sendCustomerMessageThunk = createAsyncThunk('customerPortal/sendMessage', async (content: string) => {
  return await sendCustomerMessage(content);
});
export const fetchCustomerAnalytics = createAsyncThunk('customerPortal/fetchAnalytics', async () => {
  return await getCustomerAnalytics();
});
export const fetchCustomerNotifications = createAsyncThunk('customerPortal/fetchNotifications', async () => {
  return await getCustomerNotifications();
});

const customerPortalSlice = createSlice({
  name: 'customerPortal',
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
      .addCase(fetchCustomerProfile.fulfilled, (state, action: PayloadAction<CustomerProfile>) => {
        state.profile = action.payload;
      })
      .addCase(fetchCustomerOrderHistory.fulfilled, (state, action: PayloadAction<CustomerOrder[]>) => {
        state.orders = action.payload;
      })
      .addCase(fetchCustomerLoyalty.fulfilled, (state, action: PayloadAction<CustomerLoyalty>) => {
        state.loyalty = action.payload;
      })
      .addCase(submitCustomerFeedbackThunk.fulfilled, (state) => {
        state.feedbackSuccess = true;
      })
      .addCase(fetchCustomerMessages.fulfilled, (state, action: PayloadAction<CustomerMessage[]>) => {
        state.messages = action.payload;
      })
      .addCase(sendCustomerMessageThunk.fulfilled, (state) => {
        state.messageSendSuccess = true;
      })
      .addCase(fetchCustomerAnalytics.fulfilled, (state, action: PayloadAction<CustomerAnalytics>) => {
        state.analytics = action.payload;
      })
      .addCase(fetchCustomerNotifications.fulfilled, (state, action: PayloadAction<CustomerNotification[]>) => {
        state.notifications = action.payload;
      });
  },
});

export const { clearFeedbackSuccess, clearMessageSendSuccess } = customerPortalSlice.actions;
export default customerPortalSlice.reducer; 
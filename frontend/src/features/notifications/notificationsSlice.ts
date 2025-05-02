import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  fetchNotifications,
  markNotificationRead,
  deleteNotification,
  Notification
} from './notificationsAPI';

interface NotificationsState {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
}

const initialState: NotificationsState = {
  notifications: [],
  loading: false,
  error: null,
};

export const getNotifications = createAsyncThunk('notifications/fetchAll', async () => {
  return await fetchNotifications();
});

export const markRead = createAsyncThunk('notifications/markRead', async (id: number) => {
  return await markNotificationRead(id);
});

export const removeNotification = createAsyncThunk('notifications/delete', async (id: number) => {
  return await deleteNotification(id);
});

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getNotifications.fulfilled, (state, action: PayloadAction<Notification[]>) => {
        state.loading = false;
        state.notifications = action.payload;
      })
      .addCase(getNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch notifications';
      })
      .addCase(markRead.fulfilled, (state, action: PayloadAction<Notification>) => {
        const idx = state.notifications.findIndex(n => n.id === action.payload.id);
        if (idx !== -1) state.notifications[idx] = action.payload;
      })
      .addCase(removeNotification.fulfilled, (state, action: PayloadAction<Notification>) => {
        state.notifications = state.notifications.filter(n => n.id !== action.payload.id);
      });
  },
});

export default notificationsSlice.reducer; 
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface Notification {
  id: string | number;  // Support both string and number IDs
  title: string;
  content: string;
  message?: string;    // Add optional message field for compatibility
  type: string;        // Make type more flexible
  isRead: boolean;
  read?: boolean;      // Add optional read field for compatibility
  createdAt: string;
  timestamp?: string;  // Add optional timestamp field for compatibility
  relatedObjectId?: string;
  relatedObjectType?: string;
  action?: string;     // Add action field
  actionUrl?: string;  // Add actionUrl field
}

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null
};

// Slice
const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    fetchNotificationsStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchNotificationsSuccess(state, action: PayloadAction<Notification[]>) {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter(notification => !notification.isRead).length;
      state.loading = false;
    },
    fetchNotificationsFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    addNotification(state, action: PayloadAction<Notification>) {
      // Normalize the notification to ensure it has all required fields
      const normalizedNotification: Notification = {
        id: action.payload.id,
        title: action.payload.title,
        content: action.payload.content || action.payload.message || '',
        type: action.payload.type || 'info',
        isRead: action.payload.isRead || action.payload.read === false,
        createdAt: action.payload.createdAt || action.payload.timestamp || new Date().toISOString(),
        relatedObjectId: action.payload.relatedObjectId,
        relatedObjectType: action.payload.relatedObjectType,
        action: action.payload.action,
        actionUrl: action.payload.actionUrl
      };

      // Check if notification already exists to avoid duplicates
      const exists = state.notifications.some(n => String(n.id) === String(normalizedNotification.id));
      if (!exists) {
        state.notifications.unshift(normalizedNotification);
        if (!normalizedNotification.isRead) {
          state.unreadCount += 1;
        }
      }
    },
    markNotificationAsRead(state, action: PayloadAction<number | string>) {
      const notification = state.notifications.find(n => String(n.id) === String(action.payload));
      if (notification && !notification.isRead) {
        notification.isRead = true;
        notification.read = true; // Update both fields for compatibility
        state.unreadCount -= 1;
      }
    },
    markAllNotificationsAsRead(state) {
      state.notifications.forEach(notification => {
        notification.isRead = true;
        notification.read = true; // Update both fields for compatibility
      });
      state.unreadCount = 0;
    },
    clearNotifications(state) {
      state.notifications = [];
      state.unreadCount = 0;
    },
    // Add new action to set unread count directly
    setUnreadCount(state, action: PayloadAction<number>) {
      state.unreadCount = action.payload;
    }
  }
});

// Actions
export const {
  fetchNotificationsStart,
  fetchNotificationsSuccess,
  fetchNotificationsFailure,
  addNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearNotifications,
  setUnreadCount  // Export the new action
} = notificationsSlice.actions;

// Selectors
export const selectNotifications = (state: { notifications: NotificationsState }) => 
  state.notifications.notifications;

export const selectUnreadCount = (state: { notifications: NotificationsState }) => 
  state.notifications.unreadCount;

export default notificationsSlice.reducer; 
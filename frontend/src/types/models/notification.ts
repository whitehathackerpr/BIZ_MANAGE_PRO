/**
 * Notification-related type definitions
 */

/**
 * Type of notification for styling and display purposes
 */
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

/**
 * Notification entity from the API
 */
export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  link?: string;
  data?: Record<string, unknown>;
}

/**
 * WebSocket notification event
 */
export interface WebSocketNotification {
  type: 'notification';
  payload: Notification;
}

/**
 * Generic WebSocket event
 */
export interface WebSocketEvent {
  type: string;
  payload: unknown;
} 
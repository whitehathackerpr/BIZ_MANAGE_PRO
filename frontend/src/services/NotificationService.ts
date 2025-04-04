import axios from 'axios';
import { Notification, NotificationSettings } from '../types';

interface Web3EventCallback {
    (event: any): void;
}

interface RealTimeNotificationCallback {
    (notification: Notification): void;
}

interface PushRegistration {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
}

class NotificationService {
    private baseURL: string;

    constructor() {
        this.baseURL = '/api/notifications';
    }

    async getNotifications(): Promise<{ data: Notification[]; total: number }> {
        try {
            const response = await axios.get<{ data: Notification[]; total: number }>(this.baseURL);
            return response.data;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }
    }

    async markAsRead(notificationId: string): Promise<void> {
        try {
            await axios.put(`${this.baseURL}/${notificationId}/read`);
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    }

    async markAllAsRead(): Promise<void> {
        try {
            await axios.put(`${this.baseURL}/mark-all-read`);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    }

    async deleteNotification(notificationId: string): Promise<void> {
        try {
            await axios.delete(`${this.baseURL}/${notificationId}`);
        } catch (error) {
            console.error('Error deleting notification:', error);
            throw error;
        }
    }

    async createNotification(data: Partial<Notification>): Promise<Notification> {
        try {
            const response = await axios.post<{ data: Notification }>(this.baseURL, data);
            return response.data.data;
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    }

    async updateNotificationSettings(settings: Partial<NotificationSettings>): Promise<NotificationSettings> {
        try {
            const response = await axios.put<{ data: NotificationSettings }>(`${this.baseURL}/settings`, settings);
            return response.data.data;
        } catch (error) {
            console.error('Error updating notification settings:', error);
            throw error;
        }
    }

    async getNotificationSettings(): Promise<NotificationSettings> {
        try {
            const response = await axios.get<{ data: NotificationSettings }>(`${this.baseURL}/settings`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching notification settings:', error);
            throw error;
        }
    }

    // Web3-specific notification methods
    async subscribeToWeb3Events(callback: Web3EventCallback): Promise<{ unsubscribe: () => void }> {
        // This would integrate with Web3 event listeners
        // For example, listening to blockchain events
        return {
            unsubscribe: () => {
                // Cleanup Web3 event listeners
            },
        };
    }

    async sendWeb3Notification(data: any): Promise<void> {
        // This would handle sending notifications through Web3 channels
        // For example, sending notifications through smart contracts
        try {
            await axios.post(`${this.baseURL}/web3`, data);
        } catch (error) {
            console.error('Error sending Web3 notification:', error);
            throw error;
        }
    }

    // Real-time notification methods
    async subscribeToRealTimeNotifications(callback: RealTimeNotificationCallback): Promise<{ unsubscribe: () => void }> {
        // This would integrate with WebSocket or similar real-time communication
        // For example, using Socket.IO or WebSocket
        return {
            unsubscribe: () => {
                // Cleanup WebSocket listeners
            },
        };
    }

    // Push notification methods
    async registerPushNotification(registration: PushRegistration): Promise<void> {
        try {
            await axios.post(`${this.baseURL}/push/register`, registration);
        } catch (error) {
            console.error('Error registering push notification:', error);
            throw error;
        }
    }

    async unregisterPushNotification(): Promise<void> {
        try {
            await axios.post(`${this.baseURL}/push/unregister`);
        } catch (error) {
            console.error('Error unregistering push notification:', error);
            throw error;
        }
    }
}

const notificationService = new NotificationService();
export default notificationService; 
import axios from 'axios';

class NotificationService {
    constructor() {
        this.baseURL = '/api/notifications';
    }

    async getNotifications() {
        try {
            const response = await axios.get(this.baseURL);
            return response.data;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }
    }

    async markAsRead(notificationId) {
        try {
            const response = await axios.put(`${this.baseURL}/${notificationId}/read`);
            return response.data;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    }

    async markAllAsRead() {
        try {
            const response = await axios.put(`${this.baseURL}/mark-all-read`);
            return response.data;
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    }

    async deleteNotification(notificationId) {
        try {
            const response = await axios.delete(`${this.baseURL}/${notificationId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting notification:', error);
            throw error;
        }
    }

    async createNotification(data) {
        try {
            const response = await axios.post(this.baseURL, data);
            return response.data;
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    }

    async updateNotificationSettings(settings) {
        try {
            const response = await axios.put(`${this.baseURL}/settings`, settings);
            return response.data;
        } catch (error) {
            console.error('Error updating notification settings:', error);
            throw error;
        }
    }

    async getNotificationSettings() {
        try {
            const response = await axios.get(`${this.baseURL}/settings`);
            return response.data;
        } catch (error) {
            console.error('Error fetching notification settings:', error);
            throw error;
        }
    }

    // Web3-specific notification methods
    async subscribeToWeb3Events(callback) {
        // This would integrate with Web3 event listeners
        // For example, listening to blockchain events
        return {
            unsubscribe: () => {
                // Cleanup Web3 event listeners
            },
        };
    }

    async sendWeb3Notification(data) {
        // This would handle sending notifications through Web3 channels
        // For example, sending notifications through smart contracts
        try {
            const response = await axios.post(`${this.baseURL}/web3`, data);
            return response.data;
        } catch (error) {
            console.error('Error sending Web3 notification:', error);
            throw error;
        }
    }

    // Real-time notification methods
    async subscribeToRealTimeNotifications(callback) {
        // This would integrate with WebSocket or similar real-time communication
        // For example, using Socket.IO or WebSocket
        return {
            unsubscribe: () => {
                // Cleanup WebSocket listeners
            },
        };
    }

    // Push notification methods
    async registerPushNotification(registration) {
        try {
            const response = await axios.post(`${this.baseURL}/push/register`, registration);
            return response.data;
        } catch (error) {
            console.error('Error registering push notification:', error);
            throw error;
        }
    }

    async unregisterPushNotification() {
        try {
            const response = await axios.post(`${this.baseURL}/push/unregister`);
            return response.data;
        } catch (error) {
            console.error('Error unregistering push notification:', error);
            throw error;
        }
    }
}

export default new NotificationService(); 

export default NotificationService; 
class NotificationHandler {
    constructor() {
        this.notifications = [];
        this.unreadCount = 0;
        this.socket = null;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        
        // Initialize WebSocket connection
        this.connectWebSocket();
        
        // Initialize push notifications
        this.initializePushNotifications();
        
        // Load existing notifications
        this.loadNotifications();
        
        // Add event listeners
        this.addEventListeners();
        
        this.initialized = true;
    }

    connectWebSocket() {
        this.socket = io.connect(`${window.location.origin}/notifications`);
        
        this.socket.on('notification', (data) => {
            this.handleNewNotification(data);
        });
        
        this.socket.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error);
        });
    }

    async initializePushNotifications() {
        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                const registration = await navigator.serviceWorker.register('/sw.js');
                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: this.urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
                });
                
                // Send subscription to server
                await fetch('/api/notifications/push/subscribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(subscription)
                });
            }
        } catch (error) {
            console.error('Push notification initialization error:', error);
        }
    }

    async loadNotifications() {
        try {
            const response = await fetch('/api/notifications');
            const data = await response.json();
            
            this.notifications = data.notifications;
            this.unreadCount = data.unread_count;
            
            this.updateNotificationBadge();
            this.renderNotifications();
        } catch (error) {
            console.error('Failed to load notifications:', error);
        }
    }

    handleNewNotification(notification) {
        this.notifications.unshift(notification);
        this.unreadCount++;
        
        this.updateNotificationBadge();
        this.renderNotifications();
        this.showNotificationToast(notification);
    }

    async markAsRead(notificationId) {
        try {
            await fetch(`/api/notifications/${notificationId}/read`, {
                method: 'POST'
            });
            
            const notification = this.notifications.find(n => n.id === notificationId);
            if (notification && !notification.is_read) {
                notification.is_read = true;
                this.unreadCount--;
                this.updateNotificationBadge();
            }
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    }

    showNotificationToast(notification) {
        const toast = new bootstrap.Toast(document.getElementById('notificationToast'));
        document.getElementById('toastTitle').textContent = notification.title;
        document.getElementById('toastMessage').textContent = notification.message;
        toast.show();
    }

    updateNotificationBadge() {
        const badge = document.getElementById('notificationBadge');
        if (badge) {
            badge.textContent = this.unreadCount;
            badge.style.display = this.unreadCount > 0 ? 'block' : 'none';
        }
    }

    renderNotifications() {
        const container = document.getElementById('notificationsList');
        if (!container) return;
        
        container.innerHTML = this.notifications.map(notification => `
            <div class="notification-item ${notification.is_read ? '' : 'unread'}"
                 data-id="${notification.id}">
                <div class="notification-title">${notification.title}</div>
                <div class="notification-message">${notification.message}</div>
                <div class="notification-time">
                    ${moment(notification.created_at).fromNow()}
                </div>
            </div>
        `).join('');
    }

    addEventListeners() {
        document.addEventListener('click', (e) => {
            const notificationItem = e.target.closest('.notification-item');
            if (notificationItem) {
                const notificationId = parseInt(notificationItem.dataset.id);
                this.markAsRead(notificationId);
                
                // Handle notification click based on type
                const notification = this.notifications.find(n => n.id === notificationId);
                if (notification && notification.data) {
                    this.handleNotificationClick(notification);
                }
            }
        });
    }

    handleNotificationClick(notification) {
        switch (notification.type) {
            case 'order_status':
                window.location.href = `/orders/${notification.data.order_id}`;
                break;
            case 'low_stock_alert':
                window.location.href = `/products/${notification.data.product_id}`;
                break;
            // Add more notification type handlers as needed
        }
    }

    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');
        
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        
        return outputArray;
    }
}

// Initialize notification handler
const notificationHandler = new NotificationHandler();
document.addEventListener('DOMContentLoaded', () => {
    notificationHandler.init();
}); 
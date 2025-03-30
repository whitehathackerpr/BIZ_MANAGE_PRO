import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Snackbar, Alert } from '@mui/material';
import PropTypes from 'prop-types';
import { useAuth } from './AuthContext';
import { api } from '../services/api';

const NotificationContext = createContext(null);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'info',
    });

    useEffect(() => {
        if (user) {
            fetchNotifications();
            fetchUnreadCount();
        }
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/api/notifications');
            setNotifications(response.data.notifications);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            setLoading(false);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const response = await api.get('/api/notifications/unread-count');
            setUnreadCount(response.data.count);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await api.put(`/api/notifications/${notificationId}/read`);
            setNotifications(notifications.map(notification =>
                notification.id === notificationId
                    ? { ...notification, read: true }
                    : notification
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/api/notifications/read-all');
            setNotifications(notifications.map(notification => ({
                ...notification,
                read: true
            })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            await api.delete(`/api/notifications/${notificationId}`);
            setNotifications(notifications.filter(notification => notification.id !== notificationId));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const clearAllNotifications = async () => {
        try {
            await api.delete('/api/notifications/clear-all');
            setNotifications([]);
            setUnreadCount(0);
        } catch (error) {
            console.error('Error clearing notifications:', error);
        }
    };

    const showNotification = useCallback((message, severity = 'info') => {
        setNotification({
            open: true,
            message,
            severity,
        });
    }, []);

    const hideNotification = useCallback(() => {
        setNotification((prev) => ({
            ...prev,
            open: false,
        }));
    }, []);

    useEffect(() => {
        if (notification.open) {
            const timer = setTimeout(() => {
                hideNotification();
            }, 6000); // Hide after 6 seconds

            return () => clearTimeout(timer);
        }
    }, [notification.open]);

    const value = {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
        refreshNotifications: fetchNotifications,
        showNotification,
        hideNotification
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={hideNotification}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    onClose={hideNotification}
                    severity={notification.severity}
                    sx={{ width: '100%' }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </NotificationContext.Provider>
    );
};

NotificationProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export default NotificationContext; 
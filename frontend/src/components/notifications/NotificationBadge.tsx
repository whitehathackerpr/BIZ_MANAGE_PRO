import React from 'react';
import React, { useState, useEffect } from 'react';
import {
    Badge,
    IconButton,
    Menu,
    MenuItem,
    Typography,
    Box,
    Divider,
    CircularProgress,
} from '@mui/material';
import {
    Notifications as NotificationsIcon,
    Info as InfoIcon,
    Warning as WarningIcon,
    Error as ErrorIcon,
    CheckCircle as SuccessIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useNotification } from '../../contexts/NotificationContext';

const NotificationBadge = () => {
    const { showNotification } = useNotification();
    const [notifications, setNotifications] = useState<Type>([]);
    const [loading, setLoading] = useState<Type>(false);
    const [anchorEl, setAnchorEl] = useState<Type>(null);
    const [unreadCount, setUnreadCount] = useState<Type>(0);

    useEffect(() => {
        fetchNotifications();
        // Set up polling for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/notifications/recent');
            setNotifications(response.data);
            setUnreadCount(response.data.filter(n => !n.read).length);
        } catch (err) {
            showNotification('Failed to fetch notifications', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleNotificationClick = async (notification) => {
        try {
            if (!notification.read) {
                await axios.put(`/api/notifications/${notification.id}/read`);
                setNotifications(notifications.map(n =>
                    n.id === notification.id ? { ...n, read: true } : n
                ));
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
            handleClose();
            // Handle navigation or action based on notification type
            if (notification.actionUrl) {
                window.location.href = notification.actionUrl;
            }
        } catch (err) {
            showNotification('Failed to mark notification as read', 'error');
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'info':
                return <InfoIcon color="info" fontSize="small" />;
            case 'warning':
                return <WarningIcon color="warning" fontSize="small" />;
            case 'error':
                return <ErrorIcon color="error" fontSize="small" />;
            case 'success':
                return <SuccessIcon color="success" fontSize="small" />;
            default:
                return <NotificationsIcon fontSize="small" />;
        }
    };

    return (
        <>
            <IconButton color="inherit" onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleClick}>
                <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon />
                </Badge>
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                    sx: {
                        maxHeight: 400,
                        width: 360,
                    },
                }}
            >
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">Notifications</Typography>
                    {loading && <CircularProgress size={20} />}
                </Box>
                <Divider />
                {notifications.length === 0 ? (
                    <MenuItem disabled>
                        <Typography variant="body2" color="textSecondary">
                            No notifications
                        </Typography>
                    </MenuItem>
                ) : (
                    notifications.map((notification) => (
                        <MenuItem
                            key={notification.id}
                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => handleNotificationClick(notification)}
                            sx={{
                                bgcolor: notification.read ? 'transparent' : 'action.hover',
                                '&:hover': {
                                    bgcolor: 'action.hover',
                                },
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
                                <Box sx={{ mr: 2, mt: 1 }}>
                                    {getNotificationIcon(notification.type)}
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="subtitle2" component="div">
                                        {notification.title}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" component="div">
                                        {notification.message}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                        {new Date(notification.createdAt).toLocaleString()}
                                    </Typography>
                                </Box>
                            </Box>
                        </MenuItem>
                    ))
                )}
                <Divider />
                <MenuItem onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleClose}>
                    <Typography variant="body2" color="primary" align="center" sx={{ width: '100%' }}>
                        View All Notifications
                    </Typography>
                </MenuItem>
            </Menu>
        </>
    );
};

export default NotificationBadge; 
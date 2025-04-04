import React from 'react';
import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    ListItemSecondaryAction,
    IconButton,
    Divider,
    CircularProgress,
    Alert,
    Chip,
    Badge,
    Menu,
    MenuItem,
    Button,
} from '@mui/material';
import {
    Notifications as NotificationsIcon,
    Info as InfoIcon,
    Warning as WarningIcon,
    Error as ErrorIcon,
    CheckCircle as SuccessIcon,
    Delete as DeleteIcon,
    MoreVert as MoreVertIcon,
    MarkEmailRead as MarkEmailReadIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useNotification } from '../../contexts/NotificationContext';

const NotificationList = () => {
    const { showNotification } = useNotification();
    const [notifications, setNotifications] = useState<Type>([]);
    const [loading, setLoading] = useState<Type>(false);
    const [error, setError] = useState<Type>('');
    const [anchorEl, setAnchorEl] = useState<Type>(null);
    const [selectedNotification, setSelectedNotification] = useState<Type>(null);
    const [unreadCount, setUnreadCount] = useState<Type>(0);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/notifications');
            setNotifications(response.data);
            setUnreadCount(response.data.filter(n => !n.read).length);
        } catch (err) {
            setError('Failed to fetch notifications');
            showNotification('Failed to fetch notifications', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleMenuOpen = (event, notification) => {
        setAnchorEl(event.currentTarget);
        setSelectedNotification(notification);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedNotification(null);
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            await axios.put(`/api/notifications/${notificationId}/read`);
            setNotifications(notifications.map(n =>
                n.id === notificationId ? { ...n, read: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
            showNotification('Notification marked as read', 'success');
        } catch (err) {
            showNotification('Failed to mark notification as read', 'error');
        }
    };

    const handleDelete = async (notificationId) => {
        try {
            await axios.delete(`/api/notifications/${notificationId}`);
            setNotifications(notifications.filter(n => n.id !== notificationId));
            showNotification('Notification deleted', 'success');
        } catch (err) {
            showNotification('Failed to delete notification', 'error');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await axios.put('/api/notifications/mark-all-read');
            setNotifications(notifications.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
            showNotification('All notifications marked as read', 'success');
        } catch (err) {
            showNotification('Failed to mark all notifications as read', 'error');
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'info':
                return <InfoIcon color="info" />;
            case 'warning':
                return <WarningIcon color="warning" />;
            case 'error':
                return <ErrorIcon color="error" />;
            case 'success':
                return <SuccessIcon color="success" />;
            default:
                return <NotificationsIcon />;
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high':
                return 'error';
            case 'normal':
                return 'warning';
            case 'low':
                return 'success';
            default:
                return 'default';
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box p={3}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Box display="flex" alignItems="center">
                        <Badge badgeContent={unreadCount} color="error">
                            <NotificationsIcon />
                        </Badge>
                        <Typography variant="h5" sx={{ ml: 2 }}>
                            Notifications
                        </Typography>
                    </Box>
                    {unreadCount > 0 && (
                        <Button
                            startIcon={<MarkEmailReadIcon />}
                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleMarkAllAsRead}
                            variant="outlined"
                        >
                            Mark All as Read
                        </Button>
                    )}
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {notifications.length === 0 ? (
                    <Typography variant="body1" color="textSecondary" align="center">
                        No notifications to display
                    </Typography>
                ) : (
                    <List>
                        {notifications.map((notification, index) => (
                            <React.Fragment key={notification.id}>
                                <ListItem
                                    sx={{
                                        bgcolor: notification.read ? 'transparent' : 'action.hover',
                                        '&:hover': {
                                            bgcolor: 'action.hover',
                                        },
                                    }}
                                >
                                    <ListItemIcon>
                                        {getNotificationIcon(notification.type)}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Typography variant="subtitle1">
                                                    {notification.title}
                                                </Typography>
                                                <Chip
                                                    label={notification.priority}
                                                    size="small"
                                                    color={getPriorityColor(notification.priority)}
                                                />
                                            </Box>
                                        }
                                        secondary={
                                            <>
                                                <Typography variant="body2" color="textSecondary">
                                                    {notification.message}
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary">
                                                    {new Date(notification.createdAt).toLocaleString()}
                                                </Typography>
                                            </>
                                        }
                                    />
                                    <ListItemSecondaryAction>
                                        <IconButton
                                            edge="end"
                                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => (e) => handleMenuOpen(e, notification)}
                                        >
                                            <MoreVertIcon />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                                {index < notifications.length - 1 && <Divider />}
                            </React.Fragment>
                        ))}
                    </List>
                )}

                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                >
                    {selectedNotification && !selectedNotification.read && (
                        <MenuItem onClick={() => {
                            handleMarkAsRead(selectedNotification.id);
                            handleMenuClose();
                        }}>
                            <ListItemIcon>
                                <MarkEmailReadIcon fontSize="small" />
                            </ListItemIcon>
                            Mark as Read
                        </MenuItem>
                    )}
                    <MenuItem onClick={() => {
                        handleDelete(selectedNotification?.id);
                        handleMenuClose();
                    }}>
                        <ListItemIcon>
                            <DeleteIcon fontSize="small" />
                        </ListItemIcon>
                        Delete
                    </MenuItem>
                </Menu>
            </Paper>
        </Box>
    );
};

export default NotificationList; 
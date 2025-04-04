import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    IconButton,
    Badge,
    Divider,
    CircularProgress,
    Alert,
    Tooltip,
} from '@mui/material';
import {
    Notifications as NotificationsIcon,
    Warning as WarningIcon,
    CheckCircle as CheckCircleIcon,
    Info as InfoIcon,
    Delete as DeleteIcon,
    MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { useNotification } from '../../contexts/NotificationContext';
import axios from 'axios';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'warning' | 'success' | 'info' | 'default';
    created_at: string;
}

const AdminNotificationPanel: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { showNotification } = useNotification();

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async (): Promise<void> => {
        try {
            const response = await axios.get('/api/admin/notifications');
            setNotifications(response.data);
        } catch (err) {
            setError('Failed to fetch notifications');
            showNotification('Failed to fetch notifications', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteNotification = async (id: string): Promise<void> => {
        try {
            await axios.delete(`/api/admin/notifications/${id}`);
            setNotifications(notifications.filter((n: Notification) => n.id !== id));
            showNotification('Notification deleted successfully', 'success');
        } catch (err) {
            showNotification('Failed to delete notification', 'error');
        }
    };

    const getNotificationIcon = (type: string): React.ReactNode => {
        switch (type) {
            case 'warning':
                return <WarningIcon sx={{ color: '#FF2E63' }} />;
            case 'success':
                return <CheckCircleIcon sx={{ color: '#00F5FF' }} />;
            case 'info':
                return <InfoIcon sx={{ color: '#00F5FF' }} />;
            default:
                return <NotificationsIcon sx={{ color: '#00F5FF' }} />;
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mb: 2 }}>
                {error}
            </Alert>
        );
    }

    return (
        <Paper className="glass">
            <Box p={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" className="gradient-text">
                        Notifications
                    </Typography>
                    <Tooltip title="More options">
                        <IconButton>
                            <MoreVertIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <List>
                    {notifications.length === 0 ? (
                        <ListItem>
                            <ListItemText
                                primary="No notifications"
                                secondary="You're all caught up!"
                            />
                        </ListItem>
                    ) : (
                        notifications.map((notification: Notification) => (
                            <React.Fragment key={notification.id}>
                                <ListItem
                                    sx={{
                                        borderRadius: 2,
                                        mb: 1,
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                        },
                                    }}
                                >
                                    <ListItemIcon>
                                        {getNotificationIcon(notification.type)}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={notification.title}
                                        secondary={
                                            <Box>
                                                <Typography variant="body2" color="text.secondary">
                                                    {notification.message}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {new Date(notification.created_at).toLocaleString()}
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                    <IconButton
                                        edge="end"
                                        onClick={() => handleDeleteNotification(notification.id)}
                                        sx={{
                                            color: 'rgba(255, 255, 255, 0.5)',
                                            '&:hover': {
                                                color: '#FF2E63',
                                            },
                                        }}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </ListItem>
                                <Divider sx={{ my: 1 }} />
                            </React.Fragment>
                        ))
                    )}
                </List>
            </Box>
        </Paper>
    );
};

export default AdminNotificationPanel; 
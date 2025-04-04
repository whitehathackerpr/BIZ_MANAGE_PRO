import React from 'react';
import React from 'react';
import {
    Box,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    IconButton,
    Typography,
    Divider,
    Tooltip,
} from '@mui/material';
import {
    Notifications as NotificationsIcon,
    Warning as WarningIcon,
    CheckCircle as CheckCircleIcon,
    Info as InfoIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';

const NotificationList = ({ notifications, onDelete }) => {
    const getNotificationIcon = (type) => {
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

    if (notifications.length === 0) {
        return (
            <Box p={2} textAlign="center">
                <Typography variant="body1" color="text.secondary">
                    No notifications
                </Typography>
            </Box>
        );
    }

    return (
        <List>
            {notifications.map((notification) => (
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
                            primary={
                                <Typography
                                    variant="subtitle1"
                                    sx={{
                                        color: notification.type === 'warning' ? '#FF2E63' : '#00F5FF',
                                    }}
                                >
                                    {notification.title}
                                </Typography>
                            }
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
                        {onDelete && (
                            <Tooltip title="Delete notification">
                                <IconButton
                                    edge="end"
                                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => onDelete(notification.id)}
                                    sx={{
                                        color: 'rgba(255, 255, 255, 0.5)',
                                        '&:hover': {
                                            color: '#FF2E63',
                                        },
                                    }}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Tooltip>
                        )}
                    </ListItem>
                    <Divider sx={{ my: 1 }} />
                </React.Fragment>
            ))}
        </List>
    );
};

export default NotificationList; 
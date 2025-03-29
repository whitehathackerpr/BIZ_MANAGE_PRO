import React from 'react';
import {
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Typography,
    Box,
    Divider,
    Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNotification } from '../../contexts/NotificationContext';

const NotificationList = ({ notifications }) => {
    const { markAsRead, deleteNotification } = useNotification();

    if (notifications.length === 0) {
        return (
            <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography color="text.secondary">
                    No notifications
                </Typography>
            </Box>
        );
    }

    return (
        <List sx={{ p: 0 }}>
            {notifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                    <ListItem
                        sx={{
                            bgcolor: notification.is_read ? 'inherit' : 'action.hover',
                            '&:hover': {
                                bgcolor: 'action.selected',
                            },
                        }}
                    >
                        <ListItemText
                            primary={
                                <Typography variant="subtitle2" component="div">
                                    {notification.title}
                                </Typography>
                            }
                            secondary={
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    component="div"
                                >
                                    {notification.message}
                                </Typography>
                            }
                        />
                        <ListItemSecondaryAction>
                            {!notification.is_read && (
                                <Tooltip title="Mark as read">
                                    <IconButton
                                        edge="end"
                                        size="small"
                                        onClick={() => markAsRead(notification.id)}
                                        sx={{ mr: 1 }}
                                    >
                                        <CheckCircleIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            )}
                            <Tooltip title="Delete">
                                <IconButton
                                    edge="end"
                                    size="small"
                                    onClick={() => deleteNotification(notification.id)}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </ListItemSecondaryAction>
                    </ListItem>
                    {index < notifications.length - 1 && <Divider />}
                </React.Fragment>
            ))}
        </List>
    );
};

export default NotificationList; 
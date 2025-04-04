import React from 'react';
import React, { useState } from 'react';
import { Badge, IconButton, Menu, MenuItem, Typography, Box } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useNotification } from '../../contexts/NotificationContext';
import NotificationList from './NotificationList';

const NotificationBell = () => {
    const [anchorEl, setAnchorEl] = useState<Type>(null);
    const { unreadCount, notifications, markAllAsRead } = useNotification();

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleMarkAllAsRead = async () => {
        await markAllAsRead();
        handleClose();
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
                    style: {
                        maxHeight: 400,
                        width: 360,
                    },
                }}
            >
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                    <Typography variant="h6" component="div">
                        Notifications
                    </Typography>
                    {unreadCount > 0 && (
                        <MenuItem onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleMarkAllAsRead}>
                            Mark all as read
                        </MenuItem>
                    )}
                </Box>
                <NotificationList notifications={notifications} />
            </Menu>
        </>
    );
};

export default NotificationBell; 
import React from 'react';
import React from 'react';
import {
    Badge,
    IconButton,
    Menu,
    MenuItem,
    Typography,
    Box,
    Tooltip,
} from '@mui/material';
import {
    Notifications as NotificationsIcon,
    Warning as WarningIcon,
    CheckCircle as CheckCircleIcon,
    Info as InfoIcon,
} from '@mui/icons-material';

const NotificationBadge = ({ notifications, onNotificationClick }) => {
    const [anchorEl, setAnchorEl] = React.useState<Type>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'warning':
                return <WarningIcon sx={{ color: '#FF2E63', fontSize: 20 }} />;
            case 'success':
                return <CheckCircleIcon sx={{ color: '#00F5FF', fontSize: 20 }} />;
            case 'info':
                return <InfoIcon sx={{ color: '#00F5FF', fontSize: 20 }} />;
            default:
                return <NotificationsIcon sx={{ color: '#00F5FF', fontSize: 20 }} />;
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <>
            <Tooltip title="Notifications">
                <IconButton
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleClick}
                    sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        '&:hover': {
                            color: '#00F5FF',
                        },
                    }}
                >
                    <Badge
                        badgeContent={unreadCount}
                        color="error"
                        sx={{
                            '& .MuiBadge-badge': {
                                background: 'linear-gradient(45deg, #00F5FF 30%, #FF2E63 90%)',
                                color: '#FFFFFF',
                                fontWeight: 'bold',
                            },
                        }}
                    >
                        <NotificationsIcon />
                    </Badge>
                </IconButton>
            </Tooltip>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{
                    sx: {
                        mt: 1.5,
                        minWidth: 360,
                        background: 'rgba(19, 20, 40, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                    },
                }}
            >
                <Box p={2}>
                    <Typography variant="h6" className="gradient-text" gutterBottom>
                        Notifications
                    </Typography>
                    {notifications.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" align="center">
                            No notifications
                        </Typography>
                    ) : (
                        notifications.map((notification) => (
                            <MenuItem
                                key={notification.id}
                                onClick={() => {
                                    onNotificationClick?.(notification);
                                    handleClose();
                                }}
                                sx={{
                                    borderRadius: 2,
                                    mb: 1,
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                    },
                                }}
                            >
                                <Box display="flex" alignItems="flex-start" width="100%">
                                    <Box mr={2}>
                                        {getNotificationIcon(notification.type)}
                                    </Box>
                                    <Box flex={1}>
                                        <Typography
                                            variant="subtitle2"
                                            sx={{
                                                color: notification.type === 'warning' ? '#FF2E63' : '#00F5FF',
                                            }}
                                        >
                                            {notification.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {notification.message}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {new Date(notification.created_at).toLocaleString()}
                                        </Typography>
                                    </Box>
                                </Box>
                            </MenuItem>
                        ))
                    )}
                </Box>
            </Menu>
        </>
    );
};

export default NotificationBadge; 
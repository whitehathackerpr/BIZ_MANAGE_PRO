import React from 'react';
import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Divider,
  Button,
  CircularProgress,
  Alert,
  Badge,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  DoneAll as DoneAllIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { useNotification } from '../../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

const NotificationPanel = () => {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    refreshNotifications
  } = useNotification();

  const [anchorEl, setAnchorEl] = useState<Type>(null);
  const [selectedNotification, setSelectedNotification] = useState<Type>(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedNotification(null);
  };

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    handleClick();
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  const handleDelete = async () => {
    if (selectedNotification) {
      await deleteNotification(selectedNotification.id);
      handleClose();
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    handleClose();
  };

  const handleClearAll = async () => {
    await clearAllNotifications();
    handleClose();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={2}>
        <CircularProgress />
      </Box>
    );
  }

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
        <Box p={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Notifications</Typography>
            <Box>
              <IconButton size="small" onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleMarkAllAsRead}>
                <DoneAllIcon />
              </IconButton>
              <IconButton size="small" onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleClearAll}>
                <ClearIcon />
              </IconButton>
            </Box>
          </Box>

          {notifications.length === 0 ? (
            <Typography color="textSecondary" align="center">
              No notifications
            </Typography>
          ) : (
            <List>
              {notifications.map((notification) => (
                <React.Fragment key={notification.id}>
                  <ListItem
                    button
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => handleNotificationClick(notification)}
                    sx={{
                      bgcolor: notification.read ? 'transparent' : 'action.hover',
                    }}
                  >
                    <ListItemIcon>
                      <NotificationsIcon color={notification.read ? 'disabled' : 'primary'} />
                    </ListItemIcon>
                    <ListItemText
                      primary={notification.title}
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant="body2"
                            color="textPrimary"
                          >
                            {notification.message}
                          </Typography>
                          <br />
                          <Typography
                            component="span"
                            variant="caption"
                            color="textSecondary"
                          >
                            {formatDistanceToNow(new Date(notification.created_at), {
                              addSuffix: true,
                            })}
                          </Typography>
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => deleteNotification(notification.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          )}

          {selectedNotification && (
            <Box mt={2}>
              <Button
                startIcon={<CheckIcon />}
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => markAsRead(selectedNotification.id)}
                disabled={selectedNotification.read}
              >
                Mark as Read
              </Button>
              <Button
                startIcon={<DeleteIcon />}
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleDelete}
                color="error"
              >
                Delete
              </Button>
            </Box>
          )}
        </Box>
      </Menu>
    </>
  );
};

export default NotificationPanel; 
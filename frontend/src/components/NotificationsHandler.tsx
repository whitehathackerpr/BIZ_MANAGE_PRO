import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../app';
import { toast } from 'react-toastify';
import { addNotification, setUnreadCount, Notification } from '../features/notifications/notificationsSlice';
import {
  Avatar,
  Badge,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
  AlertTitle,
  Typography,
  Divider,
  ListItemAvatar,
  ListItemText
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  ShoppingCart as ShoppingCartIcon,
  Person as PersonIcon,
  Inventory as InventoryIcon,
  Assignment as AssignmentIcon,
  AttachMoney as AttachMoneyIcon,
  Warning as WarningIcon,
  NotificationsActive as NotificationsActiveIcon
} from '@mui/icons-material';

// Define notification types with their respective icons
const NOTIFICATION_ICONS: Record<string, React.ReactNode> = {
  'order': <ShoppingCartIcon />,
  'user': <PersonIcon />,
  'inventory': <InventoryIcon />,
  'task': <AssignmentIcon />,
  'payment': <AttachMoneyIcon />,
  'alert': <WarningIcon />,
  'default': <NotificationsActiveIcon />
};

// Define notification severities
const NOTIFICATION_SEVERITIES: Record<string, 'success' | 'info' | 'warning' | 'error'> = {
  'order': 'success',
  'user': 'info',
  'inventory': 'warning',
  'task': 'info',
  'payment': 'success',
  'alert': 'error',
  'default': 'info'
};

const NOTIFICATION_COLORS: Record<string, string> = {
  'success': 'success.main',
  'info': 'primary.main',
  'warning': 'warning.main',
  'error': 'error.main',
};

interface NotificationData {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action?: string;
  actionUrl?: string;
}

const NotificationsHandler: React.FC = () => {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state: RootState) => state.auth);
  const { unreadCount } = useSelector((state: RootState) => state.notifications);
  const [latestNotification, setLatestNotification] = useState<NotificationData | null>(null);
  const [showSnackbar, setShowSnackbar] = useState(false);

  // Simulated WebSocket connection
  useEffect(() => {
    if (!token || !user) return;

    // This would normally be a WebSocket connection
    const mockWebSocketConnection = () => {
      console.log('Establishing mock WebSocket connection for notifications...');
      
      // Simulate receiving notifications periodically
      const interval = setInterval(() => {
        if (Math.random() > 0.7) { // only show notifications occasionally
          const notificationTypes = ['order', 'user', 'inventory', 'task', 'payment', 'alert'];
          const randomType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
          
          const newNotification: NotificationData = {
            id: `notif-${Date.now()}`,
            type: randomType,
            title: getRandomTitle(randomType),
            message: getRandomMessage(randomType),
            timestamp: new Date().toISOString(),
            read: false,
          };
          
          handleNewNotification(newNotification);
        }
      }, 45000); // Every 45 seconds for demo purposes
      
      return () => clearInterval(interval);
    };
    
    const connectionTimeout = setTimeout(mockWebSocketConnection, 2000);
    
    return () => {
      clearTimeout(connectionTimeout);
    };
  }, [token, user, dispatch]);

  // Handle a new incoming notification
  const handleNewNotification = (notification: NotificationData) => {
    // Convert to Notification format for the Redux store
    const storeNotification: Notification = {
      id: notification.id,
      title: notification.title,
      content: notification.message,
      type: notification.type,
      isRead: false,
      read: false,
      createdAt: notification.timestamp,
      timestamp: notification.timestamp,
      action: notification.action,
      actionUrl: notification.actionUrl
    };
    
    // Update Redux store
    dispatch(addNotification(storeNotification));
    dispatch(setUnreadCount(unreadCount + 1));
    
    // Show snackbar
    setLatestNotification(notification);
    setShowSnackbar(true);
  };

  // Close the snackbar
  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setShowSnackbar(false);
  };

  // Get a random notification title based on type
  const getRandomTitle = (type: string): string => {
    switch (type) {
      case 'order':
        return 'New Order Received';
      case 'user':
        return 'New User Registered';
      case 'inventory':
        return 'Low Stock Alert';
      case 'task':
        return 'Task Assignment';
      case 'payment':
        return 'Payment Received';
      case 'alert':
        return 'System Alert';
      default:
        return 'Notification';
    }
  };

  // Get a random notification message based on type
  const getRandomMessage = (type: string): string => {
    switch (type) {
      case 'order':
        return `Order #${Math.floor(Math.random() * 10000)} has been placed for $${(Math.random() * 500).toFixed(2)}.`;
      case 'user':
        return 'A new customer has registered on your platform.';
      case 'inventory':
        return `Product "${['Headphones', 'Laptop', 'Mouse', 'Keyboard', 'Monitor'][Math.floor(Math.random() * 5)]}" is running low on stock.`;
      case 'task':
        return 'You have been assigned a new task to complete.';
      case 'payment':
        return `Payment of $${(Math.random() * 1000).toFixed(2)} has been received.`;
      case 'alert':
        return 'Urgent: System maintenance scheduled in 30 minutes.';
      default:
        return 'You have a new notification.';
    }
  };

  // If no notification or user is not authenticated, render nothing
  if (!latestNotification || !user) {
    return null;
  }

  const notificationType = latestNotification.type || 'default';
  const severity = NOTIFICATION_SEVERITIES[notificationType] || 'info';

  return (
    <Snackbar
      open={showSnackbar}
      autoHideDuration={6000}
      onClose={handleCloseSnackbar}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert
        onClose={handleCloseSnackbar}
        severity={severity}
        variant="filled"
        sx={{ width: '100%', boxShadow: 4 }}
        icon={NOTIFICATION_ICONS[notificationType] || <NotificationsIcon />}
      >
        <AlertTitle>{latestNotification.title}</AlertTitle>
        {latestNotification.message}
      </Alert>
    </Snackbar>
  );
};

export default NotificationsHandler; 
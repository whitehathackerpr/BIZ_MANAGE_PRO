import React from 'react';
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Chip,
  Divider,
  Tabs,
  Tab,
  Badge,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  FilterList as FilterIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';

const NotificationItem = ({ notification, onDelete, onMarkRead }) => {
  const [anchorEl, setAnchorEl] = useState<Type>(null);
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
        return <WarningIcon color="warning" />;
      case 'info':
        return <InfoIcon color="info" />;
      case 'success':
        return <CheckCircleIcon color="success" />;
      default:
        return <NotificationsIcon />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      case 'success':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <ListItem
      sx={{
        backgroundColor: notification.read ? 'transparent' : 'action.hover',
        '&:hover': {
          backgroundColor: 'action.hover',
        },
      }}
    >
      <ListItemIcon>{getNotificationIcon(notification.type)}</ListItemIcon>
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle1">{notification.title}</Typography>
            <Chip
              label={notification.type}
              size="small"
              color={getNotificationColor(notification.type)}
            />
          </Box>
        }
        secondary={
          <Box>
            <Typography variant="body2" color="text.secondary">
              {notification.message}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDistanceToNow(new Date(notification.created_at), {
                addSuffix: true,
              })}
            </Typography>
          </Box>
        }
      />
      <IconButton onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleClick}>
        <MoreVertIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleClose}
      >
        {!notification.read && (
          <MenuItem onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => onMarkRead(notification.id)}>
            Mark as Read
          </MenuItem>
        )}
        <MenuItem onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => onDelete(notification.id)}>Delete</MenuItem>
      </Menu>
    </ListItem>
  );
};

const NotificationSettings = ({ open, onClose, settings, onSave }) => {
  const [formData, setFormData] = useState<Type>(settings);

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.checked,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Notification Settings</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Email Notifications
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={formData.email_low_stock}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('email_low_stock')}
              />
            }
            label="Low Stock Alerts"
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.email_sales}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('email_sales')}
              />
            }
            label="Sales Reports"
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.email_attendance}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('email_attendance')}
              />
            }
            label="Attendance Alerts"
          />
        </Box>
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            In-App Notifications
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={formData.in_app_low_stock}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('in_app_low_stock')}
              />
            }
            label="Low Stock Alerts"
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.in_app_sales}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('in_app_sales')}
              />
            }
            label="Sales Updates"
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.in_app_attendance}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('in_app_attendance')}
              />
            }
            label="Attendance Updates"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={(e: React.MouseEvent<HTMLButtonElement>) => onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => onSave(formData)}
        >
          Save Settings
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const Notifications = () => {
  const [activeTab, setActiveTab] = useState<Type>(0);
  const [settingsOpen, setSettingsOpen] = useState<Type>(false);
  const [filterAnchorEl, setFilterAnchorEl] = useState<Type>(null);
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await axios.get('/api/notifications');
      return response.data;
    },
  });

  const { data: settings } = useQuery({
    queryKey: ['notification-settings'],
    queryFn: async () => {
      const response = await axios.get('/api/notifications/settings');
      return response.data;
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id) => {
      await axios.put(`/api/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await axios.delete(`/api/notifications/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings) => {
      await axios.put('/api/notifications/settings', newSettings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notification-settings']);
      setSettingsOpen(false);
    },
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleMarkAsRead = (id) => {
    markAsReadMutation.mutate(id);
  };

  const handleDelete = (id) => {
    deleteMutation.mutate(id);
  };

  const handleSaveSettings = (newSettings) => {
    updateSettingsMutation.mutate(newSettings);
  };

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const unreadCount = notifications?.filter((n) => !n.read).length || 0;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Notifications</Typography>
        <Box>
          <IconButton onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleFilterClick}>
            <FilterIcon />
          </IconButton>
          <IconButton onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => setSettingsOpen(true)}>
            <SettingsIcon />
          </IconButton>
        </Box>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleTabChange}>
          <Tab
            label={
              <Badge badgeContent={unreadCount} color="error">
                All
              </Badge>
            }
          />
          <Tab label="Unread" />
          <Tab label="Low Stock" />
          <Tab label="Sales" />
        </Tabs>
      </Paper>

      <Paper>
        <List>
          {notifications
            ?.filter((notification) => {
              if (activeTab === 1) return !notification.read;
              if (activeTab === 2) return notification.type === 'warning';
              if (activeTab === 3) return notification.type === 'success';
              return true;
            })
            .map((notification) => (
              <React.Fragment key={notification.id}>
                <NotificationItem
                  notification={notification}
                  onDelete={handleDelete}
                  onMarkRead={handleMarkAsRead}
                />
                <Divider />
              </React.Fragment>
            ))}
        </List>
      </Paper>

      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={handleFilterClose}
      >
        <MenuItem onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleFilterClose}>All Notifications</MenuItem>
        <MenuItem onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleFilterClose}>Unread Only</MenuItem>
        <MenuItem onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleFilterClose}>Low Stock Alerts</MenuItem>
        <MenuItem onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleFilterClose}>Sales Updates</MenuItem>
      </Menu>

      <NotificationSettings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />
    </Box>
  );
};

export default Notifications; 
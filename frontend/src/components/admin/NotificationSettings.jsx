import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    FormGroup,
    FormControlLabel,
    Switch,
    Button,
    CircularProgress,
    Alert,
    Divider,
    Tooltip,
} from '@mui/material';
import {
    Notifications as NotificationsIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { useNotification } from '../../contexts/NotificationContext';
import axios from 'axios';

const NotificationSettings = () => {
    const [settings, setSettings] = useState({
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        lowStockAlerts: true,
        orderUpdates: true,
        employeeUpdates: true,
        systemAlerts: true,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const { showNotification } = useNotification();

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await axios.get('/api/admin/notification-settings');
            setSettings(response.data);
        } catch (err) {
            setError('Failed to fetch notification settings');
            showNotification('Failed to fetch notification settings', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (event) => {
        const { name, checked } = event.target;
        setSettings(prev => ({
            ...prev,
            [name]: checked
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await axios.put('/api/admin/notification-settings', settings);
            showNotification('Notification settings updated successfully', 'success');
        } catch (err) {
            showNotification('Failed to update notification settings', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Paper className="glass">
            <Box p={3}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6" className="gradient-text">
                        Notification Settings
                    </Typography>
                    <Tooltip title="More options">
                        <IconButton>
                            <MoreVertIcon />
                        </IconButton>
                    </Tooltip>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                <FormGroup>
                    <Box mb={3}>
                        <Typography variant="subtitle1" gutterBottom sx={{ color: '#00F5FF' }}>
                            <EmailIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Email Notifications
                        </Typography>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={settings.emailNotifications}
                                    onChange={handleChange}
                                    name="emailNotifications"
                                    color="primary"
                                />
                            }
                            label="Enable email notifications"
                        />
                    </Box>

                    <Box mb={3}>
                        <Typography variant="subtitle1" gutterBottom sx={{ color: '#00F5FF' }}>
                            <NotificationsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Push Notifications
                        </Typography>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={settings.pushNotifications}
                                    onChange={handleChange}
                                    name="pushNotifications"
                                    color="primary"
                                />
                            }
                            label="Enable push notifications"
                        />
                    </Box>

                    <Box mb={3}>
                        <Typography variant="subtitle1" gutterBottom sx={{ color: '#00F5FF' }}>
                            <PhoneIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                            SMS Notifications
                        </Typography>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={settings.smsNotifications}
                                    onChange={handleChange}
                                    name="smsNotifications"
                                    color="primary"
                                />
                            }
                            label="Enable SMS notifications"
                        />
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    <Box mb={3}>
                        <Typography variant="subtitle1" gutterBottom sx={{ color: '#FF2E63' }}>
                            Alert Types
                        </Typography>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={settings.lowStockAlerts}
                                    onChange={handleChange}
                                    name="lowStockAlerts"
                                    color="primary"
                                />
                            }
                            label="Low stock alerts"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={settings.orderUpdates}
                                    onChange={handleChange}
                                    name="orderUpdates"
                                    color="primary"
                                />
                            }
                            label="Order updates"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={settings.employeeUpdates}
                                    onChange={handleChange}
                                    name="employeeUpdates"
                                    color="primary"
                                />
                            }
                            label="Employee updates"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={settings.systemAlerts}
                                    onChange={handleChange}
                                    name="systemAlerts"
                                    color="primary"
                                />
                            }
                            label="System alerts"
                        />
                    </Box>
                </FormGroup>

                <Box display="flex" justifyContent="flex-end" mt={3}>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={saving}
                        sx={{
                            background: 'linear-gradient(45deg, #00F5FF 30%, #FF2E63 90%)',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #00C2D4 30%, #C4003D 90%)',
                            },
                        }}
                    >
                        {saving ? <CircularProgress size={24} /> : 'Save Settings'}
                    </Button>
                </Box>
            </Box>
        </Paper>
    );
};

export default NotificationSettings; 
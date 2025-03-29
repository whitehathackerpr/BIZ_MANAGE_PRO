import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    FormGroup,
    FormControlLabel,
    Switch,
    Button,
    Alert,
    CircularProgress,
    Divider
} from '@mui/material';
import { api } from '../../services/api';

const NotificationSettings = () => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/notification-settings');
            setSettings(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch notification settings');
            console.error('Error fetching settings:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = async (setting) => {
        try {
            const newSettings = {
                ...settings,
                [setting]: !settings[setting]
            };
            await api.put('/api/notification-settings', newSettings);
            setSettings(newSettings);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError('Failed to update notification settings');
            console.error('Error updating settings:', err);
            setTimeout(() => setError(null), 3000);
        }
    };

    const handleReset = async () => {
        try {
            await api.post('/api/notification-settings/reset');
            await fetchSettings();
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError('Failed to reset notification settings');
            console.error('Error resetting settings:', err);
            setTimeout(() => setError(null), 3000);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box p={3}>
            <Card>
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        Notification Settings
                    </Typography>
                    <Typography variant="body2" color="textSecondary" paragraph>
                        Manage your notification preferences for different types of updates and alerts.
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            Settings updated successfully
                        </Alert>
                    )}

                    <FormGroup>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={settings.email_notifications}
                                    onChange={() => handleChange('email_notifications')}
                                />
                            }
                            label="Email Notifications"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={settings.push_notifications}
                                    onChange={() => handleChange('push_notifications')}
                                />
                            }
                            label="Push Notifications"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={settings.in_app_notifications}
                                    onChange={() => handleChange('in_app_notifications')}
                                />
                            }
                            label="In-App Notifications"
                        />
                    </FormGroup>

                    <Divider sx={{ my: 3 }} />

                    <Typography variant="h6" gutterBottom>
                        Notification Types
                    </Typography>

                    <FormGroup>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={settings.low_stock_alerts}
                                    onChange={() => handleChange('low_stock_alerts')}
                                />
                            }
                            label="Low Stock Alerts"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={settings.order_updates}
                                    onChange={() => handleChange('order_updates')}
                                />
                            }
                            label="Order Updates"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={settings.system_alerts}
                                    onChange={() => handleChange('system_alerts')}
                                />
                            }
                            label="System Alerts"
                        />
                    </FormGroup>

                    <Box mt={3}>
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={handleReset}
                        >
                            Reset to Default
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default NotificationSettings; 
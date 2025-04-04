import React from 'react';
import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Switch,
    FormControlLabel,
    Divider,
    Grid,
    Button,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    CardHeader,
} from '@mui/material';
import {
    Notifications as NotificationsIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    Chat as ChatIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useNotification } from '../../contexts/NotificationContext';

const NotificationSettings = () => {
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState<Type>(false);
    const [error, setError] = useState<Type>('');
    const [settings, setSettings] = useState<Type>({
        emailNotifications: {
            enabled: true,
            types: {
                system: true,
                inventory: true,
                sales: true,
                marketing: true,
                security: true,
            },
        },
        pushNotifications: {
            enabled: true,
            types: {
                system: true,
                inventory: true,
                sales: true,
                marketing: false,
                security: true,
            },
        },
        smsNotifications: {
            enabled: false,
            types: {
                system: false,
                inventory: false,
                sales: false,
                marketing: false,
                security: true,
            },
        },
        inAppNotifications: {
            enabled: true,
            types: {
                system: true,
                inventory: true,
                sales: true,
                marketing: true,
                security: true,
            },
        },
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/notifications/settings');
            setSettings(response.data);
        } catch (err) {
            setError('Failed to fetch notification settings');
            showNotification('Failed to fetch notification settings', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = (category, type = null) => {
        setSettings((prev) => {
            if (type) {
                return {
                    ...prev,
                    [category]: {
                        ...prev[category],
                        types: {
                            ...prev[category].types,
                            [type]: !prev[category].types[type],
                        },
                    },
                };
            }
            return {
                ...prev,
                [category]: {
                    ...prev[category],
                    enabled: !prev[category].enabled,
                },
            };
        });
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            await axios.put('/api/notifications/settings', settings);
            showNotification('Notification settings updated successfully', 'success');
        } catch (err) {
            setError('Failed to update notification settings');
            showNotification('Failed to update notification settings', 'error');
        } finally {
            setLoading(false);
        }
    };

    const renderNotificationType = (category, type) => (
        <FormControlLabel
            control={
                <Switch
                    checked={settings[category].types[type]}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => () => handleToggle(category, type)}
                    disabled={!settings[category].enabled}
                />
            }
            label={type.charAt(0).toUpperCase() + type.slice(1)}
        />
    );

    const renderNotificationCard = (category, title, icon) => (
        <Card>
            <CardHeader
                avatar={icon}
                title={title}
                action={
                    <FormControlLabel
                        control={
                            <Switch
                                checked={settings[category].enabled}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => () => handleToggle(category)}
                            />
                        }
                        label="Enable"
                    />
                }
            />
            <CardContent>
                <Grid container spacing={2}>
                    {Object.keys(settings[category].types).map((type) => (
                        <Grid item xs={12} sm={6} key={type}>
                            {renderNotificationType(category, type)}
                        </Grid>
                    ))}
                </Grid>
            </CardContent>
        </Card>
    );

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box p={3}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h5">Notification Settings</Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleSave}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                    </Button>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        {renderNotificationCard(
                            'emailNotifications',
                            'Email Notifications',
                            <EmailIcon />
                        )}
                    </Grid>
                    <Grid item xs={12}>
                        {renderNotificationCard(
                            'pushNotifications',
                            'Push Notifications',
                            <NotificationsIcon />
                        )}
                    </Grid>
                    <Grid item xs={12}>
                        {renderNotificationCard(
                            'smsNotifications',
                            'SMS Notifications',
                            <PhoneIcon />
                        )}
                    </Grid>
                    <Grid item xs={12}>
                        {renderNotificationCard(
                            'inAppNotifications',
                            'In-App Notifications',
                            <ChatIcon />
                        )}
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
};

export default NotificationSettings; 
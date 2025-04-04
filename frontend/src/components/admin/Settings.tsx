import React from 'react';
import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Grid,
    Switch,
    FormControlLabel,
    Divider,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    Notifications as NotificationsIcon,
    Security as SecurityIcon,
    Palette as PaletteIcon,
    Language as LanguageIcon
} from '@mui/icons-material';
import { useNotification } from '../../contexts/NotificationContext';

const Settings = () => {
    const [loading, setLoading] = useState<Type>(false);
    const [error, setError] = useState<Type>(null);
    const [settings, setSettings] = useState<Type>({
        notifications: {
            email: true,
            push: true,
            sms: false
        },
        security: {
            twoFactor: false,
            loginAlerts: true
        },
        appearance: {
            darkMode: true,
            compactMode: false
        },
        language: 'en',
        timezone: 'UTC'
    });
    const { showNotification } = useNotification();

    const handleChange = (category, setting) => (event) => {
        setSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [setting]: event.target.checked
            }
        }));
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            // TODO: Implement API call to save settings
            showNotification('Settings saved successfully', 'success');
        } catch (err) {
            setError('Failed to save settings');
            showNotification('Failed to save settings', 'error');
        } finally {
            setLoading(false);
        }
    };

    const SettingSection = ({ title, icon, children }) => (
        <Paper className="glass" sx={{ p: 3, mb: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
                {icon}
                <Typography variant="h6" sx={{ ml: 1 }}>
                    {title}
                </Typography>
            </Box>
            <Divider sx={{ mb: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
            {children}
        </Paper>
    );

    return (
        <Box>
            <Box display="flex" alignItems="center" mb={4}>
                <SettingsIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h5" className="gradient-text">
                    Settings
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <SettingSection title="Notifications" icon={<NotificationsIcon sx={{ color: 'primary.main' }} />}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={settings.notifications.email}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('notifications', 'email')}
                                    color="primary"
                                />
                            }
                            label="Email Notifications"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={settings.notifications.push}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('notifications', 'push')}
                                    color="primary"
                                />
                            }
                            label="Push Notifications"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={settings.notifications.sms}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('notifications', 'sms')}
                                    color="primary"
                                />
                            }
                            label="SMS Notifications"
                        />
                    </SettingSection>
                </Grid>

                <Grid item xs={12} md={6}>
                    <SettingSection title="Security" icon={<SecurityIcon sx={{ color: 'primary.main' }} />}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={settings.security.twoFactor}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('security', 'twoFactor')}
                                    color="primary"
                                />
                            }
                            label="Two-Factor Authentication"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={settings.security.loginAlerts}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('security', 'loginAlerts')}
                                    color="primary"
                                />
                            }
                            label="Login Alerts"
                        />
                    </SettingSection>
                </Grid>

                <Grid item xs={12} md={6}>
                    <SettingSection title="Appearance" icon={<PaletteIcon sx={{ color: 'primary.main' }} />}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={settings.appearance.darkMode}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('appearance', 'darkMode')}
                                    color="primary"
                                />
                            }
                            label="Dark Mode"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={settings.appearance.compactMode}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('appearance', 'compactMode')}
                                    color="primary"
                                />
                            }
                            label="Compact Mode"
                        />
                    </SettingSection>
                </Grid>

                <Grid item xs={12} md={6}>
                    <SettingSection title="Language & Region" icon={<LanguageIcon sx={{ color: 'primary.main' }} />}>
                        <TextField
                            select
                            fullWidth
                            label="Language"
                            value={settings.language}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => (e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                            SelectProps={{
                                native: true,
                            }}
                            sx={{ mb: 2 }}
                        >
                            <option value="en">English</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                            <option value="de">German</option>
                            <option value="it">Italian</option>
                        </TextField>
                        <TextField
                            select
                            fullWidth
                            label="Timezone"
                            value={settings.timezone}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => (e) => setSettings(prev => ({ ...prev, timezone: e.target.value }))}
                            SelectProps={{
                                native: true,
                            }}
                        >
                            <option value="UTC">UTC</option>
                            <option value="EST">Eastern Time</option>
                            <option value="CST">Central Time</option>
                            <option value="PST">Pacific Time</option>
                        </TextField>
                    </SettingSection>
                </Grid>
            </Grid>

            <Box display="flex" justifyContent="flex-end" mt={3}>
                <Button
                    variant="contained"
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleSave}
                    disabled={loading}
                    sx={{
                        background: 'linear-gradient(45deg, #00F5FF 30%, #FF2E63 90%)',
                        '&:hover': {
                            background: 'linear-gradient(45deg, #00C2D4 30%, #C4003D 90%)',
                        },
                    }}
                >
                    {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                </Button>
            </Box>
        </Box>
    );
};

export default Settings; 
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { userService, UserSettings as ServiceSettings } from '../services';

interface SettingsState {
  general: {
    companyName: string;
    timezone: string;
    dateFormat: string;
    currency: string;
  };
  notifications: {
    emailNotifications: boolean;
    orderNotifications: boolean;
    inventoryAlerts: boolean;
    lowStockAlerts: boolean;
    marketingEmails: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
    passwordExpiry: number;
  };
}

const Settings = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<SettingsState>({
    general: {
      companyName: '',
      timezone: '',
      dateFormat: '',
      currency: '',
    },
    notifications: {
      emailNotifications: true,
      orderNotifications: true,
      inventoryAlerts: true,
      lowStockAlerts: true,
      marketingEmails: false,
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordExpiry: 90,
    },
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await userService.getSettings();
      // Map the API response to our settings structure
      // This is a placeholder - you'd need to map the actual response structure
      setSettings({
        ...settings,
        general: {
          ...settings.general,
          timezone: response.timezone || '',
          currency: response.display_currency || '',
        }
      });
    } catch (error) {
      setError(t('settings.errorFetching'));
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (section: keyof SettingsState, field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      // Map our settings structure to the API expected format
      // This is a placeholder - you'd need to map to the actual expected structure
      await userService.updateSettings({
        timezone: settings.general.timezone,
        display_currency: settings.general.currency,
        language: 'en', // Default
        theme: 'light', // Default
        notifications: {
          email: settings.notifications.emailNotifications,
          push: false,
          sms: false,
        }
      });
      setSuccess(true);
    } catch (error) {
      setError(t('settings.errorSaving'));
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccess(false);
    setError(null);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        {t('settings.title')}
      </Typography>

      <Grid container spacing={3}>
        {/* General Settings */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('settings.general.title')}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('settings.general.companyName')}
                  value={settings.general.companyName}
                  onChange={handleChange('general', 'companyName')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('settings.general.timezone')}
                  value={settings.general.timezone}
                  onChange={handleChange('general', 'timezone')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('settings.general.dateFormat')}
                  value={settings.general.dateFormat}
                  onChange={handleChange('general', 'dateFormat')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('settings.general.currency')}
                  value={settings.general.currency}
                  onChange={handleChange('general', 'currency')}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('settings.notifications.title')}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.emailNotifications}
                      onChange={handleChange('notifications', 'emailNotifications')}
                    />
                  }
                  label={t('settings.notifications.emailNotifications')}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.orderNotifications}
                      onChange={handleChange('notifications', 'orderNotifications')}
                    />
                  }
                  label={t('settings.notifications.orderNotifications')}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.inventoryAlerts}
                      onChange={handleChange('notifications', 'inventoryAlerts')}
                    />
                  }
                  label={t('settings.notifications.inventoryAlerts')}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.lowStockAlerts}
                      onChange={handleChange('notifications', 'lowStockAlerts')}
                    />
                  }
                  label={t('settings.notifications.lowStockAlerts')}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.marketingEmails}
                      onChange={handleChange('notifications', 'marketingEmails')}
                    />
                  }
                  label={t('settings.notifications.marketingEmails')}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Security Settings */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('settings.security.title')}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.security.twoFactorAuth}
                      onChange={handleChange('security', 'twoFactorAuth')}
                    />
                  }
                  label={t('settings.security.twoFactorAuth')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label={t('settings.security.sessionTimeout')}
                  value={settings.security.sessionTimeout}
                  onChange={handleChange('security', 'sessionTimeout')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label={t('settings.security.passwordExpiry')}
                  value={settings.security.passwordExpiry}
                  onChange={handleChange('security', 'passwordExpiry')}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Save Button */}
        <Grid item xs={12}>
          <Box display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={loading}
            >
              {t('settings.save')}
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Success/Error Messages */}
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="success">
          {t('settings.success')}
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings; 
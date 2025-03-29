import React, { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Alert,
  FormControlLabel,
  Switch,
  Button,
  Paper,
  Divider,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateSystemSettings } from '../../services/settingsService';

function SystemSettings({ systemSettings }) {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [settings, setSettings] = useState({
    dark_mode: systemSettings?.dark_mode || false,
    email_notifications: systemSettings?.email_notifications || true,
    two_factor_auth: systemSettings?.two_factor_auth || false,
  });

  const queryClient = useQueryClient();

  const updateSystemMutation = useMutation({
    mutationFn: updateSystemSettings,
    onSuccess: () => {
      queryClient.invalidateQueries(['systemSettings']);
      setSuccess('System settings updated successfully');
      setError('');
    },
    onError: (error) => {
      setError(error.response?.data?.error || 'Failed to update system settings');
      setSuccess('');
    },
  });

  const handleToggle = (setting) => {
    const newSettings = {
      ...settings,
      [setting]: !settings[setting],
    };
    setSettings(newSettings);
    updateSystemMutation.mutate(newSettings);
  };

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            System Preferences
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Appearance
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.dark_mode}
                  onChange={() => handleToggle('dark_mode')}
                  color="primary"
                />
              }
              label="Dark Mode"
            />
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Enable dark mode for a more comfortable viewing experience in low-light conditions.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Notifications
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.email_notifications}
                  onChange={() => handleToggle('email_notifications')}
                  color="primary"
                />
              }
              label="Email Notifications"
            />
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Receive email notifications for important updates and alerts.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Security
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.two_factor_auth}
                  onChange={() => handleToggle('two_factor_auth')}
                  color="primary"
                />
              }
              label="Two-Factor Authentication"
            />
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Add an extra layer of security to your account by requiring a verification code.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              System Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  Version
                </Typography>
                <Typography variant="body1">
                  1.0.0
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  Last Updated
                </Typography>
                <Typography variant="body1">
                  {new Date().toLocaleDateString()}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default SystemSettings; 
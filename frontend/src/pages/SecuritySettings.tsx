import React from 'react';
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Switch,
  FormControlLabel,
  Button,
  TextField,
  Grid,
  Divider,
  Alert,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

function SecuritySettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<Type>({
    twoFactorAuth: false,
    biometricAuth: false,
    emailNotifications: true,
    smsNotifications: false,
    password: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState<Type>({ type: '', text: '' });

  const handleSettingChange = (setting) => (event) => {
    setSettings({
      ...settings,
      [setting]: event.target.checked,
    });
  };

  const handlePasswordChange = (event) => {
    setSettings({
      ...settings,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    // TODO: Implement password change logic
    setMessage({
      type: 'success',
      text: 'Security settings updated successfully',
    });
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Security Settings
      </Typography>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Authentication Settings
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.twoFactorAuth}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSettingChange('twoFactorAuth')}
                />
              }
              label="Enable Two-Factor Authentication"
            />
            <Box sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.biometricAuth}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSettingChange('biometricAuth')}
                  />
                }
                label="Enable Biometric Authentication"
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Notification Settings
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.emailNotifications}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSettingChange('emailNotifications')}
                />
              }
              label="Email Notifications"
            />
            <Box sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.smsNotifications}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSettingChange('smsNotifications')}
                  />
                }
                label="SMS Notifications"
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Change Password
            </Typography>
            <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Current Password"
                    name="password"
                    value={settings.password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePasswordChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="password"
                    label="New Password"
                    name="newPassword"
                    value={settings.newPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePasswordChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Confirm New Password"
                    name="confirmPassword"
                    value={settings.confirmPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePasswordChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                  >
                    Update Password
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Active Sessions
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              You are currently logged in on 2 devices
            </Typography>
            <Button variant="outlined" color="primary">
              View All Sessions
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default SecuritySettings; 
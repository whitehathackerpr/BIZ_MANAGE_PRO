import React from 'react';
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  useTheme,
} from '@mui/material';
import { Save, Security, Notifications, Language, Palette } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const Settings = () => {
  const theme = useTheme();
  const { user, changePassword } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState<Type>(false);
  const [passwordData, setPasswordData] = useState<Type>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [preferences, setPreferences] = useState<Type>({
    emailNotifications: true,
    pushNotifications: true,
    darkMode: theme.palette.mode === 'dark',
    language: 'en',
  });

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePreferenceChange = (name) => (e) => {
    setPreferences((prev) => ({
      ...prev,
      [name]: e.target.checked,
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await changePassword({
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
      });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      showSuccess('Password changed successfully');
    } catch (error) {
      showError(error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // TODO: Implement preferences update
      showSuccess('Preferences updated successfully');
    } catch (error) {
      showError(error.message || 'Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Grid container spacing={3}>
        {/* Security Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Security sx={{ mr: 1 }} />
                <Typography variant="h6">Security Settings</Typography>
              </Box>
              <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => handlePasswordSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="password"
                      label="Current Password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePasswordChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="password"
                      label="New Password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePasswordChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="password"
                      label="Confirm New Password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePasswordChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      type="submit"
                      startIcon={<Save />}
                      disabled={loading}
                    >
                      Change Password
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Notification Preferences */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Notifications sx={{ mr: 1 }} />
                <Typography variant="h6">Notification Preferences</Typography>
              </Box>
              <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => handlePreferencesSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.emailNotifications}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePreferenceChange('emailNotifications')}
                        />
                      }
                      label="Email Notifications"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.pushNotifications}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePreferenceChange('pushNotifications')}
                        />
                      }
                      label="Push Notifications"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      type="submit"
                      startIcon={<Save />}
                      disabled={loading}
                    >
                      Save Preferences
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Appearance Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Palette sx={{ mr: 1 }} />
                <Typography variant="h6">Appearance</Typography>
              </Box>
              <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => handlePreferencesSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.darkMode}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePreferenceChange('darkMode')}
                        />
                      }
                      label="Dark Mode"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      type="submit"
                      startIcon={<Save />}
                      disabled={loading}
                    >
                      Save Appearance Settings
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Language Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Language sx={{ mr: 1 }} />
                <Typography variant="h6">Language</Typography>
              </Box>
              <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => handlePreferencesSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      select
                      fullWidth
                      label="Language"
                      value={preferences.language}
                      onChange={(e) =>
                        setPreferences((prev) => ({
                          ...prev,
                          language: e.target.value,
                        }))
                      }
                      SelectProps={{
                        native: true,
                      }}
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="it">Italian</option>
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      type="submit"
                      startIcon={<Save />}
                      disabled={loading}
                    >
                      Save Language Settings
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings; 
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Avatar,
  CircularProgress,
  Alert,
  Snackbar,
  Divider,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { userService, ProfileUpdateData } from '../services/userService';
import useStore, { User, PasswordData, ProfileData } from '../store/useStore';

interface ProfileFormData extends ProfileUpdateData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const Profile: React.FC = () => {
  const { t } = useTranslation();
  const { user, updateProfile, changePassword } = useStore();
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileFormData>({
    name: '',
    email: '',
    phone: '',
    bio: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setProfile((prev) => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
      }));
    }
  }, [user]);

  const handleChange = (field: keyof ProfileFormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setProfile((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      const profileData: ProfileUpdateData = {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        bio: profile.bio,
      };
      await updateProfile(profileData);
      setSuccess(true);
    } catch (error) {
      setError(t('profile.errorUpdating'));
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (profile.newPassword !== profile.confirmPassword) {
      setError(t('profile.passwordMismatch'));
      return;
    }

    try {
      setLoading(true);
      const passwordData: PasswordData = {
        current_password: profile.currentPassword,
        new_password: profile.newPassword,
        confirm_password: profile.confirmPassword,
      };
      await changePassword(passwordData);
      setSuccess(true);
      setProfile((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (error) {
      setError(t('profile.errorChangingPassword'));
      console.error('Error changing password:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccess(false);
    setError(null);
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setLoading(true);
        const formData = new FormData();
        formData.append('avatar', file);
        const updatedUser = await userService.updateProfile({ avatar: file });
        await updateProfile({ avatar: updatedUser.avatar });
        setSuccess(true);
      } catch (error) {
        setError(t('profile.errorUpdatingPhoto'));
        console.error('Error updating photo:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        {t('profile.title')}
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Information */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('profile.personalInfo')}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('profile.name')}
                  value={profile.name}
                  onChange={handleChange('name')}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('profile.email')}
                  value={profile.email}
                  onChange={handleChange('email')}
                  type="email"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('profile.phone')}
                  value={profile.phone}
                  onChange={handleChange('phone')}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('profile.bio')}
                  value={profile.bio}
                  onChange={handleChange('bio')}
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  onClick={handleUpdateProfile}
                  disabled={loading}
                >
                  {t('profile.updateProfile')}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Profile Picture */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                margin: '0 auto',
                mb: 2,
                bgcolor: 'primary.main',
              }}
              src={user?.avatar}
            >
              {user?.name?.[0]?.toUpperCase()}
            </Avatar>
            <Typography variant="h6" gutterBottom>
              {user?.name}
            </Typography>
            <Typography color="text.secondary" gutterBottom>
              {user?.email}
            </Typography>
            <Button
              variant="outlined"
              component="label"
              sx={{ mt: 2 }}
            >
              {t('profile.changePhoto')}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </Button>
          </Paper>
        </Grid>

        {/* Change Password */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('profile.changePassword')}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('profile.currentPassword')}
                  value={profile.currentPassword}
                  onChange={handleChange('currentPassword')}
                  type="password"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('profile.newPassword')}
                  value={profile.newPassword}
                  onChange={handleChange('newPassword')}
                  type="password"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('profile.confirmPassword')}
                  value={profile.confirmPassword}
                  onChange={handleChange('confirmPassword')}
                  type="password"
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  onClick={handleChangePassword}
                  disabled={loading}
                >
                  {t('profile.changePassword')}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={success || !!error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={success ? 'success' : 'error'}
          sx={{ width: '100%' }}
        >
          {success ? t('profile.updateSuccess') : error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile; 
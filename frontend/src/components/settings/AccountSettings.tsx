import React from 'react';
import React, { useState } from 'react';
import {
  Box,
  Grid,
  TextField,
  Button,
  Avatar,
  IconButton,
  Typography,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
} from '@mui/material';
import {
  PhotoCamera,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  updateUserProfile,
  uploadAvatar,
  deleteAccount,
} from '../../services/settingsService';

const profileSchema = yup.object().shape({
  first_name: yup.string().required('First name is required'),
  last_name: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().matches(/^[0-9+\s-()]*$/, 'Invalid phone number'),
});

const passwordSchema = yup.object().shape({
  current_password: yup.string().required('Current password is required'),
  new_password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .required('New password is required'),
  confirm_password: yup
    .string()
    .oneOf([yup.ref('new_password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

function AccountSettings({ userProfile }) {
  const [showPassword, setShowPassword] = useState<Type>(false);
  const [showNewPassword, setShowNewPassword] = useState<Type>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<Type>(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState<Type>(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<Type>(false);
  const [error, setError] = useState<Type>('');
  const [success, setSuccess] = useState<Type>('');

  const queryClient = useQueryClient();

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: userProfile,
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm({
    resolver: yupResolver(passwordSchema),
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      queryClient.invalidateQueries(['userProfile']);
      setSuccess('Profile updated successfully');
      setError('');
    },
    onError: (error) => {
      setError(error.response?.data?.error || 'Failed to update profile');
      setSuccess('');
    },
  });

  // Upload avatar mutation
  const uploadAvatarMutation = useMutation({
    mutationFn: uploadAvatar,
    onSuccess: () => {
      queryClient.invalidateQueries(['userProfile']);
      setSuccess('Avatar updated successfully');
      setError('');
    },
    onError: (error) => {
      setError(error.response?.data?.error || 'Failed to upload avatar');
      setSuccess('');
    },
  });

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      // Handle successful account deletion (e.g., redirect to login)
      window.location.href = '/login';
    },
    onError: (error) => {
      setError(error.response?.data?.error || 'Failed to delete account');
      setSuccess('');
    },
  });

  const handleProfileSubmit = (data) => {
    updateProfileMutation.mutate(data);
  };

  const handlePasswordSubmit = (data) => {
    updateProfileMutation.mutate({
      current_password: data.current_password,
      new_password: data.new_password,
    });
    setShowPasswordDialog(false);
    resetPassword();
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      uploadAvatarMutation.mutate(file);
    }
  };

  const handleDeleteAccount = () => {
    deleteAccountMutation.mutate();
  };

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Box display="flex" flexDirection="column" alignItems="center">
            <Avatar
              src={userProfile?.avatar_url}
              sx={{ width: 120, height: 120, mb: 2 }}
            />
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="avatar-upload"
              type="file"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleAvatarChange}
            />
            <label htmlFor="avatar-upload">
              <IconButton
                color="primary"
                component="span"
                disabled={uploadAvatarMutation.isLoading}
              >
                <PhotoCamera />
              </IconButton>
            </label>
            <Typography variant="body2" color="textSecondary">
              Click to upload new avatar
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={8}>
          <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleSubmitProfile(handleProfileSubmit)}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  {...registerProfile('first_name')}
                  error={!!profileErrors.first_name}
                  helperText={profileErrors.first_name?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  {...registerProfile('last_name')}
                  error={!!profileErrors.last_name}
                  helperText={profileErrors.last_name?.message}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  {...registerProfile('email')}
                  error={!!profileErrors.email}
                  helperText={profileErrors.email?.message}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone"
                  {...registerProfile('phone')}
                  error={!!profileErrors.phone}
                  helperText={profileErrors.phone?.message}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={updateProfileMutation.isLoading}
                >
                  {updateProfileMutation.isLoading ? 'Updating...' : 'Update Profile'}
                </Button>
              </Grid>
            </Grid>
          </form>

          <Box mt={4}>
            <Button
              variant="outlined"
              color="primary"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => setShowPasswordDialog(true)}
            >
              Change Password
            </Button>
          </Box>

          <Box mt={4}>
            <Button
              variant="outlined"
              color="error"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => setShowDeleteDialog(true)}
            >
              Delete Account
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Password Change Dialog */}
      <Dialog open={showPasswordDialog} onClose={() => setShowPasswordDialog(false)}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleSubmitPassword(handlePasswordSubmit)}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  label="Current Password"
                  {...registerPassword('current_password')}
                  error={!!passwordErrors.current_password}
                  helperText={passwordErrors.current_password?.message}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type={showNewPassword ? 'text' : 'password'}
                  label="New Password"
                  {...registerPassword('new_password')}
                  error={!!passwordErrors.new_password}
                  helperText={passwordErrors.new_password?.message}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => setShowNewPassword(!showNewPassword)}
                          edge="end"
                        >
                          {showNewPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type={showConfirmPassword ? 'text' : 'password'}
                  label="Confirm New Password"
                  {...registerPassword('confirm_password')}
                  error={!!passwordErrors.confirm_password}
                  helperText={passwordErrors.confirm_password?.message}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => setShowPasswordDialog(false)}>Cancel</Button>
          <Button
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleSubmitPassword(handlePasswordSubmit)}
            variant="contained"
            color="primary"
          >
            Change Password
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete your account? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => setShowDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleDeleteAccount}
            variant="contained"
            color="error"
            disabled={deleteAccountMutation.isLoading}
          >
            {deleteAccountMutation.isLoading ? 'Deleting...' : 'Delete Account'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AccountSettings; 
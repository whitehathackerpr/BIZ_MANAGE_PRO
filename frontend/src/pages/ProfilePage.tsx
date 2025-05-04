import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import { getProfile, saveProfile, saveAvatar } from '../features/profile';
import { UserProfileUpdate } from '../features/profile/profileAPI';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';

import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  Alert,
  Chip,
  Tooltip
} from '@mui/material';
import {
  AccountCircle as AccountCircleIcon,
  Badge as BadgeIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  Notifications as NotificationsIcon,
  Phone as PhoneIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  Upload as UploadIcon,
  Business as BusinessIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ProfilePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { profile, loading, error } = useSelector((state: RootState) => state.profile);
  const { control, handleSubmit, reset, formState: { isDirty, errors } } = useForm<UserProfileUpdate>();
  const [tabValue, setTabValue] = useState(0);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) reset(profile);
  }, [profile, reset]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const onSubmit = async (data: UserProfileUpdate) => {
    setSaving(true);
    try {
      const result = await dispatch(saveProfile(data));
      if (saveProfile.fulfilled.match(result)) {
        toast.success('Profile updated successfully.');
      } else {
        toast.error('Failed to update profile.');
      }
    } finally {
      setSaving(false);
    }
  };

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // Create a preview
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);

      // Upload to server
      const formData = new FormData();
      formData.append('avatar', e.target.files[0]);
      
      try {
        const result = await dispatch(saveAvatar(formData));
        if (saveAvatar.fulfilled.match(result)) {
          toast.success('Avatar updated successfully.');
        } else {
          toast.error('Failed to update avatar.');
          // Reset preview on error
          setAvatarPreview(null);
        }
      } catch (error) {
        toast.error('An error occurred while uploading.');
        setAvatarPreview(null);
      }
    }
  };

  if (loading && !profile) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 4 }}>
        Profile Settings
      </Typography>

      <Grid container spacing={4}>
        {/* Profile Sidebar */}
        <Grid item xs={12} md={4}>
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <Avatar
                  src={avatarPreview || profile?.avatar || '/default-avatar.png'}
                  alt="Profile Avatar"
                  sx={{ width: 100, height: 100, mx: 'auto', mb: 2, boxShadow: 3 }}
                />
                <Tooltip title="Upload new picture">
                  <IconButton 
                    component="label"
                    sx={{ 
                      position: 'absolute', 
                      bottom: 10, 
                      right: -8,
                      backgroundColor: 'primary.main',
                      color: 'white',
                      '&:hover': { backgroundColor: 'primary.dark' },
                      boxShadow: 2,
                      width: 36,
                      height: 36
                    }}
                  >
                    <input
                      hidden
                      accept="image/*"
                      type="file"
                      onChange={onAvatarChange}
                    />
                    <UploadIcon sx={{ fontSize: 18 }}/>
                  </IconButton>
                </Tooltip>
              </Box>
              <Typography variant="h6" fontWeight={600} sx={{ mt: 1 }}>
                {profile?.name || 'User Name'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {profile?.role ? (
                  <Chip 
                    label={profile.role.charAt(0).toUpperCase() + profile.role.slice(1)} 
                    size="small" 
                    color="primary"
                    sx={{ mt: 1 }}
                  />
                ) : 'No role assigned'}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <EmailIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                  <Typography variant="body2">{profile?.email || 'No email'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PhoneIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                  <Typography variant="body2">{profile?.phone || 'No phone'}</Typography>
                </Box>
                {profile?.business && (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BusinessIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                    <Typography variant="body2">{profile.business}</Typography>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              orientation="vertical"
              variant="fullWidth"
              sx={{ borderRight: 1, borderColor: 'divider', height: '100%' }}
            >
              <Tab 
                icon={<AccountCircleIcon />} 
                label="Personal Info" 
                iconPosition="start"
                sx={{ justifyContent: 'flex-start', pl: 2, minHeight: 60 }}
              />
              <Tab 
                icon={<SecurityIcon />} 
                label="Security" 
                iconPosition="start"
                sx={{ justifyContent: 'flex-start', pl: 2, minHeight: 60 }}
              />
              <Tab 
                icon={<NotificationsIcon />} 
                label="Notifications" 
                iconPosition="start"
                sx={{ justifyContent: 'flex-start', pl: 2, minHeight: 60 }}
              />
              <Tab 
                icon={<SettingsIcon />} 
                label="Preferences" 
                iconPosition="start"
                sx={{ justifyContent: 'flex-start', pl: 2, minHeight: 60 }}
              />
            </Tabs>
          </Card>
        </Grid>

        {/* Profile Content */}
        <Grid item xs={12} md={8}>
          <Card variant="outlined">
            <CardContent>
              <TabPanel value={tabValue} index={0}>
                <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                    Personal Information
                  </Typography>
                  
                  {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                      {error}
                    </Alert>
                  )}
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="name"
                        control={control}
                        rules={{ required: 'Name is required' }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Full Name"
                            fullWidth
                            variant="outlined"
                            error={!!errors.name}
                            helperText={errors.name?.message}
                            InputProps={{
                              startAdornment: <BadgeIcon color="action" sx={{ mr: 1 }} />,
                            }}
                          />
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="email"
                        control={control}
                        rules={{ 
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address'
                          }
                        }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Email Address"
                            fullWidth
                            variant="outlined"
                            error={!!errors.email}
                            helperText={errors.email?.message}
                            InputProps={{
                              startAdornment: <EmailIcon color="action" sx={{ mr: 1 }} />,
                            }}
                          />
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="phone"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Phone Number"
                            fullWidth
                            variant="outlined"
                            error={!!errors.phone}
                            helperText={errors.phone?.message}
                            InputProps={{
                              startAdornment: <PhoneIcon color="action" sx={{ mr: 1 }} />,
                            }}
                          />
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="location"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Location"
                            fullWidth
                            variant="outlined"
                          />
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Controller
                        name="bio"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Bio"
                            fullWidth
                            multiline
                            rows={4}
                            variant="outlined"
                          />
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button 
                          variant="outlined" 
                          onClick={() => reset(profile)}
                          disabled={!isDirty || saving}
                          startIcon={<CancelIcon />}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          variant="contained" 
                          color="primary"
                          disabled={!isDirty || saving}
                          startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                        >
                          {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </TabPanel>
              
              <TabPanel value={tabValue} index={1}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                  Security Settings
                </Typography>
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <SecurityIcon sx={{ fontSize: 60, color: 'action.disabled', mb: 2 }} />
                  <Typography variant="body1">
                    Security settings will be available soon.
                  </Typography>
                </Box>
              </TabPanel>
              
              <TabPanel value={tabValue} index={2}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                  Notification Preferences
                </Typography>
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <NotificationsIcon sx={{ fontSize: 60, color: 'action.disabled', mb: 2 }} />
                  <Typography variant="body1">
                    Notification settings will be available soon.
                  </Typography>
                </Box>
              </TabPanel>
              
              <TabPanel value={tabValue} index={3}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                  Account Preferences
                </Typography>
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <SettingsIcon sx={{ fontSize: 60, color: 'action.disabled', mb: 2 }} />
                  <Typography variant="body1">
                    Account preferences will be available soon.
                  </Typography>
                </Box>
              </TabPanel>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfilePage; 
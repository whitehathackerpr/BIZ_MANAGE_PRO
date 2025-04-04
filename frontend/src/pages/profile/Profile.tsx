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
  Avatar,
  IconButton,
  Divider,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Alert,
} from '@mui/material';
import {
  PhotoCamera,
  Save,
  Edit,
  Lock,
  Delete,
  History,
  Security,
  Email,
  Phone,
  LocationOn,
  Business,
  Work,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import ImageCropper from '../../components/ImageCropper';
import { authService } from '../../services/api';

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`profile-tabpanel-${index}`}
    aria-labelledby={`profile-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const Profile = () => {
  const theme = useTheme();
  const { user, updateProfile, changePassword } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState<Type>(false);
  const [isEditing, setIsEditing] = useState<Type>(false);
  const [cropDialogOpen, setCropDialogOpen] = useState<Type>(false);
  const [selectedImage, setSelectedImage] = useState<Type>(null);
  const [tabValue, setTabValue] = useState<Type>(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<Type>(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState<Type>(false);
  const [formData, setFormData] = useState<Type>({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    company: user?.company || '',
    position: user?.position || '',
  });
  const [passwordData, setPasswordData] = useState<Type>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(formData);
      setIsEditing(false);
      showSuccess('Profile updated successfully');
    } catch (error) {
      showError(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError('New passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordDialogOpen(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      showSuccess('Password updated successfully');
    } catch (error) {
      showError(error.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      await authService.deleteAccount();
      showSuccess('Account deleted successfully');
      // The AuthContext will handle the logout and redirect
    } catch (error) {
      showError(error.message || 'Failed to delete account');
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result);
        setCropDialogOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = async (croppedImage) => {
    setCropDialogOpen(false);
    setLoading(true);
    try {
      const imageResponse = await fetch(croppedImage);
      const blob = await imageResponse.blob();
      const formData = new FormData();
      formData.append('avatar', blob, 'avatar.png');

      const uploadResponse = await authService.uploadAvatar(formData);
      await updateProfile({ avatar: uploadResponse.data.avatarUrl });
      
      showSuccess('Avatar updated successfully');
    } catch (error) {
      showError(error.message || 'Failed to update avatar');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Profile
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Box sx={{ position: 'relative', mr: 3 }}>
              <Avatar
                src={user?.avatar}
                sx={{
                  width: 100,
                  height: 100,
                  border: `3px solid ${theme.palette.primary.main}`,
                }}
              >
                {user?.name?.charAt(0)}
              </Avatar>
              <IconButton
                component="label"
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  bgcolor: 'background.paper',
                  '&:hover': {
                    bgcolor: 'background.paper',
                  },
                }}
              >
                <PhotoCamera />
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleImageSelect}
                />
              </IconButton>
            </Box>
            <Box>
              <Typography variant="h5" gutterBottom>
                {user?.name}
              </Typography>
              <Typography color="text.secondary">
                {user?.email}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Tabs
            value={tabValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleTabChange}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Personal Info" />
            <Tab label="Security" />
            <Tab label="Activity" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={formData.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={formData.phone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Company"
                    name="company"
                    value={formData.company}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Position"
                    name="position"
                    value={formData.position}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange}
                    disabled={!isEditing}
                    multiline
                    rows={3}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                {!isEditing ? (
                  <Button
                    variant="contained"
                    startIcon={<Edit />}
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => setIsEditing(true)}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="contained"
                      type="submit"
                      startIcon={<Save />}
                      disabled={loading}
                    >
                      Save Changes
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          name: user?.name || '',
                          email: user?.email || '',
                          phone: user?.phone || '',
                          address: user?.address || '',
                          company: user?.company || '',
                          position: user?.position || '',
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </Box>
            </form>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ mb: 3 }}>
              <Button
                variant="contained"
                startIcon={<Lock />}
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => setPasswordDialogOpen(true)}
              >
                Change Password
              </Button>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Two-Factor Authentication
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Add an extra layer of security to your account by enabling two-factor authentication.
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Security />}
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => {/* TODO: Implement 2FA setup */}}
              >
                Set Up Two-Factor Authentication
              </Button>
            </Box>

            <Box>
              <Typography variant="h6" gutterBottom color="error">
                Danger Zone
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Once you delete your account, there is no going back. Please be certain.
              </Typography>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => setDeleteDialogOpen(true)}
              >
                Delete Account
              </Button>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <List>
              <ListItem>
                <ListItemIcon>
                  <History />
                </ListItemIcon>
                <ListItemText
                  primary="Profile Updated"
                  secondary="You updated your profile information"
                />
                <Chip label="2 hours ago" size="small" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Lock />
                </ListItemIcon>
                <ListItemText
                  primary="Password Changed"
                  secondary="You changed your account password"
                />
                <Chip label="1 day ago" size="small" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Email />
                </ListItemIcon>
                <ListItemText
                  primary="Email Verified"
                  secondary="You verified your email address"
                />
                <Chip label="2 days ago" size="small" />
              </ListItem>
            </List>
          </TabPanel>
        </CardContent>
      </Card>

      <Dialog
        open={cropDialogOpen}
        onClose={() => setCropDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Crop Image</DialogTitle>
        <DialogContent>
          {selectedImage && (
            <ImageCropper
              image={selectedImage}
              onCropComplete={handleCropComplete}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => setCropDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Change Password</DialogTitle>
        <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => handlePasswordSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Current Password"
                  name="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePasswordChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="New Password"
                  name="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePasswordChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Confirm New Password"
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePasswordChange}
                  required
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => setPasswordDialogOpen(false)}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
            >
              Change Password
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone. All your data will be permanently deleted.
          </Alert>
          <Typography variant="body2" color="text.secondary">
            Please enter your password to confirm account deletion.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleDeleteAccount}
            disabled={loading}
          >
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile; 
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { api } from '../../../services/api';

const BranchSettings = ({ branchId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [settings, setSettings] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    manager_id: '',
    status: 'active',
    operating_hours: {
      monday: { open: '09:00', close: '17:00' },
      tuesday: { open: '09:00', close: '17:00' },
      wednesday: { open: '09:00', close: '17:00' },
      thursday: { open: '09:00', close: '17:00' },
      friday: { open: '09:00', close: '17:00' },
      saturday: { open: '10:00', close: '16:00' },
      sunday: { open: '10:00', close: '16:00' }
    },
    inventory_settings: {
      low_stock_threshold: 10,
      auto_reorder: false,
      reorder_point: 5
    },
    sales_settings: {
      allow_discounts: true,
      max_discount_percentage: 20,
      require_manager_approval: true
    },
    notification_settings: {
      low_stock_alerts: true,
      daily_sales_report: true,
      weekly_inventory_report: true
    }
  });

  useEffect(() => {
    fetchSettings();
  }, [branchId]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/branches/${branchId}/settings`);
      setSettings(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch branch settings');
      console.error('Error fetching branch settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setSettings(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value || checked
        }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [name]: value || checked
      }));
    }
  };

  const handleOperatingHoursChange = (day, field, value) => {
    setSettings(prev => ({
      ...prev,
      operating_hours: {
        ...prev.operating_hours,
        [day]: {
          ...prev.operating_hours[day],
          [field]: value
        }
      }
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await api.put(`/api/branches/${branchId}/settings`, settings);
      setSuccess(true);
      setError(null);
    } catch (err) {
      setError('Failed to update branch settings');
      console.error('Error updating branch settings:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5">Branch Settings</Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={loading}
            >
              Save Changes
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Settings updated successfully
            </Alert>
          )}
        </Grid>

        {/* Basic Information */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Branch Name"
                    name="name"
                    value={settings.name}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={settings.phone}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    value={settings.address}
                    onChange={handleChange}
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={settings.email}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      name="status"
                      value={settings.status}
                      onChange={handleChange}
                      label="Status"
                    >
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Operating Hours */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Operating Hours
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(settings.operating_hours).map(([day, hours]) => (
                  <Grid item xs={12} md={6} key={day}>
                    <Typography variant="subtitle1" gutterBottom>
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Open"
                          type="time"
                          value={hours.open}
                          onChange={(e) => handleOperatingHoursChange(day, 'open', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Close"
                          type="time"
                          value={hours.close}
                          onChange={(e) => handleOperatingHoursChange(day, 'close', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Inventory Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Inventory Settings
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Low Stock Threshold"
                    name="inventory_settings.low_stock_threshold"
                    type="number"
                    value={settings.inventory_settings.low_stock_threshold}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Reorder Point"
                    name="inventory_settings.reorder_point"
                    type="number"
                    value={settings.inventory_settings.reorder_point}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.inventory_settings.auto_reorder}
                        onChange={handleChange}
                        name="inventory_settings.auto_reorder"
                      />
                    }
                    label="Enable Auto Reorder"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Sales Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Sales Settings
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.sales_settings.allow_discounts}
                        onChange={handleChange}
                        name="sales_settings.allow_discounts"
                      />
                    }
                    label="Allow Discounts"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Maximum Discount Percentage"
                    name="sales_settings.max_discount_percentage"
                    type="number"
                    value={settings.sales_settings.max_discount_percentage}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.sales_settings.require_manager_approval}
                        onChange={handleChange}
                        name="sales_settings.require_manager_approval"
                      />
                    }
                    label="Require Manager Approval for Discounts"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Notification Settings
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notification_settings.low_stock_alerts}
                        onChange={handleChange}
                        name="notification_settings.low_stock_alerts"
                      />
                    }
                    label="Low Stock Alerts"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notification_settings.daily_sales_report}
                        onChange={handleChange}
                        name="notification_settings.daily_sales_report"
                      />
                    }
                    label="Daily Sales Report"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notification_settings.weekly_inventory_report}
                        onChange={handleChange}
                        name="notification_settings.weekly_inventory_report"
                      />
                    }
                    label="Weekly Inventory Report"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BranchSettings; 
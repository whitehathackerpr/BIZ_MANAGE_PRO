import React, { useState, useEffect, ChangeEvent } from 'react';
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
  Divider,
  SelectChangeEvent
} from '@mui/material';
import apiClient from '../../../services/apiClient';

interface OperatingHours {
  open: string;
  close: string;
}

interface OperatingHourSettings {
  monday: OperatingHours;
  tuesday: OperatingHours;
  wednesday: OperatingHours;
  thursday: OperatingHours;
  friday: OperatingHours;
  saturday: OperatingHours;
  sunday: OperatingHours;
}

interface InventorySettings {
  low_stock_threshold: number;
  auto_reorder: boolean;
  reorder_point: number;
}

interface SalesSettings {
  allow_discounts: boolean;
  max_discount_percentage: number;
  require_manager_approval: boolean;
}

interface NotificationSettings {
  low_stock_alerts: boolean;
  daily_sales_report: boolean;
  weekly_inventory_report: boolean;
}

interface BranchSettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  manager_id: string;
  status: 'active' | 'inactive';
  operating_hours: OperatingHourSettings;
  inventory_settings: InventorySettings;
  sales_settings: SalesSettings;
  notification_settings: NotificationSettings;
}

interface BranchSettingsProps {
  branchId: string;
}

const BranchSettingsComponent: React.FC<BranchSettingsProps> = ({ branchId }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [settings, setSettings] = useState<BranchSettings>({
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

  const fetchSettings = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await apiClient.get<BranchSettings>(`/branches/${branchId}/settings`);
      setSettings(response);
      setError(null);
    } catch (err) {
      setError('Failed to fetch branch settings');
      console.error('Error fetching branch settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent): void => {
    const { name, value } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setSettings(prev => ({
        ...prev,
        [section as string]: {
          ...prev[section as keyof BranchSettings] as Record<string, any>,
          [field as string]: value !== undefined ? value : checked
        }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [name]: value !== undefined ? value : checked
      }));
    }
  };

  const handleSwitchChange = (name: string) => (e: ChangeEvent<HTMLInputElement>): void => {
    const { checked } = e.target;
    
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setSettings(prev => ({
        ...prev,
        [section as string]: {
          ...prev[section as keyof BranchSettings] as Record<string, any>,
          [field as string]: checked
        }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [name]: checked
      }));
    }
  };

  const handleOperatingHoursChange = (day: keyof OperatingHourSettings, field: keyof OperatingHours, value: string): void => {
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

  const handleSubmit = async (): Promise<void> => {
    try {
      setLoading(true);
      await apiClient.put(`/branches/${branchId}/settings`, settings);
      setSuccess(true);
      setError(null);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to update branch settings');
      console.error('Error updating branch settings:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !settings.name) {
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
                  <Grid item xs={12} sm={6} md={4} key={day}>
                    <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>
                      {day}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                        <TextField
                          label="Open"
                          type="time"
                          value={hours.open}
                        onChange={(e) => handleOperatingHoursChange(day as keyof OperatingHourSettings, 'open', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                        inputProps={{ step: 300 }}
                        size="small"
                        />
                      <Typography variant="body1">to</Typography>
                        <TextField
                          label="Close"
                          type="time"
                          value={hours.close}
                        onChange={(e) => handleOperatingHoursChange(day as keyof OperatingHourSettings, 'close', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                        inputProps={{ step: 300 }}
                        size="small"
                        />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Inventory Settings */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Inventory Settings
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                  <TextField
                    fullWidth
                    label="Low Stock Threshold"
                    name="inventory_settings.low_stock_threshold"
                    type="number"
                    value={settings.inventory_settings.low_stock_threshold}
                  onChange={handleChange}
                  />
                  <TextField
                    fullWidth
                    label="Reorder Point"
                    name="inventory_settings.reorder_point"
                    type="number"
                    value={settings.inventory_settings.reorder_point}
                  onChange={handleChange}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.inventory_settings.auto_reorder}
                      onChange={handleSwitchChange('inventory_settings.auto_reorder')}
                      color="primary"
                      />
                    }
                  label="Auto Reorder"
                  />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Sales Settings */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Sales Settings
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.sales_settings.allow_discounts}
                      onChange={handleSwitchChange('sales_settings.allow_discounts')}
                      color="primary"
                      />
                    }
                    label="Allow Discounts"
                  />
                  <TextField
                    fullWidth
                  label="Max Discount Percentage"
                    name="sales_settings.max_discount_percentage"
                    type="number"
                    value={settings.sales_settings.max_discount_percentage}
                  onChange={handleChange}
                  disabled={!settings.sales_settings.allow_discounts}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.sales_settings.require_manager_approval}
                      onChange={handleSwitchChange('sales_settings.require_manager_approval')}
                      color="primary"
                      />
                    }
                  label="Require Manager Approval"
                  />
              </Box>
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
                <Grid item xs={12} sm={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notification_settings.low_stock_alerts}
                        onChange={handleSwitchChange('notification_settings.low_stock_alerts')}
                        color="primary"
                      />
                    }
                    label="Low Stock Alerts"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notification_settings.daily_sales_report}
                        onChange={handleSwitchChange('notification_settings.daily_sales_report')}
                        color="primary"
                      />
                    }
                    label="Daily Sales Report"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notification_settings.weekly_inventory_report}
                        onChange={handleSwitchChange('notification_settings.weekly_inventory_report')}
                        color="primary"
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

export default BranchSettingsComponent; 
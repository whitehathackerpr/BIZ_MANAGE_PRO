import React from 'react';
import React, { useState } from 'react';
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  Alert,
  MenuItem,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateBusinessSettings } from '../../services/settingsService';

const businessSchema = yup.object().shape({
  business_name: yup.string().required('Business name is required'),
  address: yup.string().required('Address is required'),
  city: yup.string().required('City is required'),
  state: yup.string().required('State is required'),
  zip_code: yup.string().required('ZIP code is required'),
  country: yup.string().required('Country is required'),
  phone: yup.string().matches(/^[0-9+\s-()]*$/, 'Invalid phone number'),
  email: yup.string().email('Invalid email'),
  tax_id: yup.string(),
  currency: yup.string().required('Currency is required'),
  timezone: yup.string().required('Timezone is required'),
});

const currencies = [
  { value: 'USD', label: 'US Dollar ($)' },
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'GBP', label: 'British Pound (£)' },
  { value: 'JPY', label: 'Japanese Yen (¥)' },
  { value: 'CAD', label: 'Canadian Dollar (C$)' },
  { value: 'AUD', label: 'Australian Dollar (A$)' },
];

const timezones = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
];

function BusinessSettings({ businessSettings }) {
  const [error, setError] = useState<Type>('');
  const [success, setSuccess] = useState<Type>('');

  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(businessSchema),
    defaultValues: businessSettings,
  });

  const updateBusinessMutation = useMutation({
    mutationFn: updateBusinessSettings,
    onSuccess: () => {
      queryClient.invalidateQueries(['businessSettings']);
      setSuccess('Business settings updated successfully');
      setError('');
    },
    onError: (error) => {
      setError(error.response?.data?.error || 'Failed to update business settings');
      setSuccess('');
    },
  });

  const onSubmit = (data) => {
    updateBusinessMutation.mutate(data);
  };

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Business Information
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Business Name"
              {...register('business_name')}
              error={!!errors.business_name}
              helperText={errors.business_name?.message}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address"
              {...register('address')}
              error={!!errors.address}
              helperText={errors.address?.message}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="City"
              {...register('city')}
              error={!!errors.city}
              helperText={errors.city?.message}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="State"
              {...register('state')}
              error={!!errors.state}
              helperText={errors.state?.message}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="ZIP Code"
              {...register('zip_code')}
              error={!!errors.zip_code}
              helperText={errors.zip_code?.message}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Country"
              {...register('country')}
              error={!!errors.country}
              helperText={errors.country?.message}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone"
              {...register('phone')}
              error={!!errors.phone}
              helperText={errors.phone?.message}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Tax ID"
              {...register('tax_id')}
              error={!!errors.tax_id}
              helperText={errors.tax_id?.message}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Currency"
              {...register('currency')}
              error={!!errors.currency}
              helperText={errors.currency?.message}
            >
              {currencies.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Timezone"
              {...register('timezone')}
              error={!!errors.timezone}
              helperText={errors.timezone?.message}
            >
              {timezones.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={updateBusinessMutation.isLoading}
            >
              {updateBusinessMutation.isLoading ? 'Updating...' : 'Update Business Settings'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}

export default BusinessSettings; 
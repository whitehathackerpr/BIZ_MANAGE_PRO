import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../app';
import api from '../api';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Fade,
  TextField,
  Typography,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import StoreIcon from '@mui/icons-material/Store';
import GroupIcon from '@mui/icons-material/Group';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

interface RegisterFormInputs {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  businessName?: string;
  businessId?: string;
  phone?: string;
  address?: string;
  role: string;
}

const roleOptions = [
  { value: 'owner', label: 'Owner', icon: <StoreIcon color="success" /> },
  { value: 'customer', label: 'Customer', icon: <PersonIcon color="success" /> },
  { value: 'supplier', label: 'Supplier', icon: <ShoppingCartIcon color="success" /> },
  { value: 'staff', label: 'Staff', icon: <GroupIcon color="success" /> },
];

const Register: React.FC = () => {
  const { register, handleSubmit, watch, formState: { errors }, setValue } = useForm<RegisterFormInputs>();
  const [searchParams] = useSearchParams();
  const [selectedRole, setSelectedRole] = useState<string>(searchParams.get('role') || 'owner');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const roleFromUrl = searchParams.get('role');
    if (roleFromUrl) {
      setSelectedRole(roleFromUrl);
      setValue('role', roleFromUrl);
    } else {
      setValue('role', selectedRole);
    }
  }, [searchParams, setValue, selectedRole]);

  const password = watch('password');

  const onSubmit = async (data: RegisterFormInputs) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await api.post('/auth/register', data);
      setSuccess('Registration successful! Please log in.');
      setTimeout(() => navigate('/login', { state: { message: 'Registration successful! Please log in.' } }), 1200);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (_: any, newRole: string) => {
    if (newRole) {
      setSelectedRole(newRole);
      setValue('role', newRole);
    }
  };

  return (
    <Box sx={{ bgcolor: '#f7fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Container maxWidth="sm">
        <Fade in timeout={600}>
          <Card elevation={6} sx={{ borderRadius: 4, p: 3 }}>
            <CardContent>
              <Box textAlign="center" mb={3}>
                <Typography variant="h4" fontWeight={800} color="text.primary" gutterBottom>
                  Create your account
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Or <Button component={RouterLink} to="/login" color="success" size="small">sign in to your existing account</Button>
                </Typography>
              </Box>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
              <Box mb={3} textAlign="center">
                <ToggleButtonGroup
                  value={selectedRole}
                  exclusive
                  onChange={handleRoleChange}
                  color="success"
                  sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}
                >
                  {roleOptions.map((role) => (
                    <ToggleButton key={role.value} value={role.value} sx={{ px: 3, py: 1, borderRadius: 2, fontWeight: 700 }}>
                      <Box display="flex" alignItems="center" gap={1}>{role.icon}{role.label}</Box>
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Box>
              <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                <input type="hidden" {...register('role')} />
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      label="First Name"
                      fullWidth
                      {...register('firstName', { required: 'First name is required' })}
                      error={!!errors.firstName}
                      helperText={errors.firstName?.message}
                      margin="normal"
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      label="Last Name"
                      fullWidth
                      {...register('lastName', { required: 'Last name is required' })}
                      error={!!errors.lastName}
                      helperText={errors.lastName?.message}
                      margin="normal"
                    />
                  </Box>
                </Box>
                <TextField
                  label="Email"
                  type="email"
                  fullWidth
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  margin="normal"
                />
                {selectedRole === 'owner' && (
                  <TextField
                    label="Business Name"
                    fullWidth
                    {...register('businessName', { required: 'Business name is required for owners' })}
                    error={!!errors.businessName}
                    helperText={errors.businessName?.message}
                    margin="normal"
                  />
                )}
                {selectedRole === 'staff' && (
                  <TextField
                    label="Business ID"
                    fullWidth
                    {...register('businessId', { required: 'Business ID is required for staff' })}
                    error={!!errors.businessId}
                    helperText={errors.businessId?.message}
                    margin="normal"
                  />
                )}
                {(selectedRole === 'customer' || selectedRole === 'supplier') && (
                  <TextField
                    label="Phone Number"
                    type="tel"
                    fullWidth
                    {...register('phone')}
                    margin="normal"
                  />
                )}
                {selectedRole === 'supplier' && (
                  <TextField
                    label="Address"
                    fullWidth
                    {...register('address', { required: 'Address is required for suppliers' })}
                    error={!!errors.address}
                    helperText={errors.address?.message}
                    margin="normal"
                  />
                )}
                <TextField
                  label="Password"
                  type="password"
                  fullWidth
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters'
                    }
                  })}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  margin="normal"
                />
                <TextField
                  label="Confirm Password"
                  type="password"
                  fullWidth
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: value => value === password || "Passwords don't match"
                  })}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                  margin="normal"
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="success"
                  fullWidth
                  size="large"
                  sx={{ mt: 3, fontWeight: 700, borderRadius: 2 }}
                  disabled={loading}
                >
                  {loading ? 'Registering...' : 'Register'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Fade>
      </Container>
    </Box>
  );
};

export default Register; 
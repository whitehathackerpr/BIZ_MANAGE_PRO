import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { loginThunk, getCurrentUser } from '../features/auth';
import { RootState, AppDispatch } from '../app';
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
  InputAdornment,
  IconButton,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import EmailIcon from '@mui/icons-material/Email';
import BusinessIcon from '@mui/icons-material/Business';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

interface LoginFormInputs {
  email: string;
  password: string;
  businessId?: string;
}

interface LocationState {
  message?: string;
}

const Login: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showBusinessIdField, setShowBusinessIdField] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const state = location.state as LocationState;
    if (state?.message) {
      setSuccessMessage(state.message);
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  const onSubmit = async (data: LoginFormInputs) => {
    const result = await dispatch(loginThunk(data));
    if (loginThunk.fulfilled.match(result)) {
      await dispatch(getCurrentUser());
      const userRole = typeof result.payload === 'object' && result.payload !== null 
        ? (result.payload as any).role || 'user'
        : 'user';
      switch(userRole) {
        case 'owner':
          navigate('/dashboard');
          break;
        case 'staff':
          navigate('/staff-portal');
          break;
        case 'supplier':
          navigate('/supplier-portal');
          break;
        case 'customer':
          navigate('/customer-portal');
          break;
        default:
          navigate('/dashboard');
      }
    }
  };

  return (
    <Box sx={{ bgcolor: '#f7fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Container maxWidth="sm">
        <Fade in timeout={600}>
          <Card elevation={6} sx={{ borderRadius: 4, p: 3 }}>
            <CardContent>
              <Box textAlign="center" mb={3}>
                <LockIcon color="success" sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="h4" fontWeight={800} color="text.primary" gutterBottom>
                  Login
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Welcome back! Please login to your account.
                </Typography>
              </Box>
              {successMessage && (
                <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>
              )}
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
              )}
              <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                {showBusinessIdField && (
                  <TextField
                    label="Business ID"
                    fullWidth
                    margin="normal"
                    {...register('businessId', { required: showBusinessIdField ? 'Business ID is required' : false })}
                    error={!!errors.businessId}
                    helperText={errors.businessId?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BusinessIcon color="success" />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
                <TextField
                  label="Email"
                  type="email"
                  fullWidth
                  margin="normal"
                  {...register('email', { required: 'Email is required' })}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="success" />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  margin="normal"
                  {...register('password', { required: 'Password is required' })}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="success" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword((v) => !v)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Box display="flex" justifyContent="flex-end" alignItems="center" mt={1}>
                  <Button
                    size="small"
                    color="success"
                    onClick={() => setShowBusinessIdField((v) => !v)}
                  >
                    {showBusinessIdField ? 'Login without Business ID' : 'Login with Business ID'}
                  </Button>
                </Box>
                <Button
                  type="submit"
                  variant="contained"
                  color="success"
                  fullWidth
                  size="large"
                  sx={{ mt: 3, fontWeight: 700, borderRadius: 2 }}
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
                <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
                  <Button component={RouterLink} to="/reset-password" size="small" color="success">
                    Forgot password?
                  </Button>
                  <Button component={RouterLink} to="/register" size="small" color="success">
                    Create an account
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Fade>
      </Container>
    </Box>
  );
};

export default Login; 
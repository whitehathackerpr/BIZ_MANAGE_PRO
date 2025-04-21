import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  SelectChangeEvent
} from '@mui/material';
import {
  Person as PersonIcon,
  Lock as LockIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { showToast } from '../Toast';
import type { Role } from '../../types/auth';

interface LoginFormData {
  userType: string;
  email: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    userType: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSelectChange = (event: SelectChangeEvent) => {
    setFormData(prev => ({
      ...prev,
      userType: event.target.value
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.login({
        email: formData.email,
        password: formData.password
      });
      
      if (response.access_token) {
        showToast({ message: 'Login successful!', type: 'success' });
        
        // Get user role from response
        const userRole = response.user.roles?.[0]?.name;
        
        // Redirect based on user role
        if (userRole) {
          switch (userRole.toLowerCase()) {
            case 'admin':
              navigate('/admin/dashboard');
              break;
            case 'manager':
              navigate('/manager/dashboard');
              break;
            case 'employee':
              navigate('/employee/dashboard');
              break;
            default:
              navigate('/dashboard');
          }
        } else {
          // If no role is found, redirect to default dashboard
          navigate('/dashboard');
        }
      } else {
        throw new Error('Invalid login response');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Login failed. Please try again.';
      setError(errorMessage);
      showToast({ message: errorMessage, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Paper
        elevation={3}
        sx={{
          display: 'flex',
          borderRadius: '24px',
          overflow: 'hidden',
          width: '100%',
          maxWidth: '1000px',
          height: '600px',
          background: '#fff'
        }}
      >
        {/* Left side - Geometric Pattern */}
        <Box
          sx={{
            width: '45%',
            background: 'linear-gradient(45deg, #4CAF50, #8BC34A)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 40px,
                rgba(255,255,255,0.1) 40px,
                rgba(255,255,255,0.1) 80px
              )`,
            }
          }}
        />

        {/* Right side - Login Form */}
        <Box
          sx={{
            width: '55%',
            p: 6,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          <Typography variant="h4" sx={{ mb: 6, fontWeight: 600, textAlign: 'left' }}>
            User Login
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 4 }}>
              {error}
            </Alert>
          )}

          <Box 
            component="form" 
            onSubmit={handleSubmit}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 4
            }}
          >
            <FormControl fullWidth>
              <InputLabel id="userType-label">Select User Type</InputLabel>
              <Select
                labelId="userType-label"
                name="userType"
                value={formData.userType}
                onChange={handleSelectChange}
                label="Select User Type"
                required
                sx={{
                  height: '56px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '12px',
                  '&:hover': {
                    backgroundColor: '#eeeeee'
                  }
                }}
              >
                <MenuItem value="business_owner">Business Owner</MenuItem>
                <MenuItem value="super_admin">Super Admin</MenuItem>
                <MenuItem value="customer">Customer</MenuItem>
                <MenuItem value="supplier">Supplier</MenuItem>
                <MenuItem value="employee">Employee</MenuItem>
              </Select>
            </FormControl>

            <TextField
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              sx={{
                '& .MuiInputBase-root': {
                  height: '56px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '12px',
                  '&:hover': {
                    backgroundColor: '#eeeeee'
                  }
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              sx={{
                '& .MuiInputBase-root': {
                  height: '56px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '12px',
                  '&:hover': {
                    backgroundColor: '#eeeeee'
                  }
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                mt: 2,
                height: '56px',
                fontSize: '1.1rem',
                borderRadius: '28px',
                bgcolor: '#4CAF50',
                '&:hover': {
                  bgcolor: '#45a049'
                },
                width: '100%'
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'LOGIN'}
            </Button>

            <Link
              component={RouterLink}
              to="/forgot-password"
              sx={{
                color: 'text.secondary',
                textDecoration: 'none',
                textAlign: 'center',
                fontSize: '1rem',
                '&:hover': { 
                  color: '#4CAF50'
                }
              }}
            >
              Forgot Username / Password?
            </Link>

            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              mt: 2 
            }}>
              <Link
                component={RouterLink}
                to="/register"
                sx={{
                  color: '#4CAF50',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  fontSize: '1rem',
                  '&:hover': { 
                    color: '#45a049'
                  }
                }}
              >
                Create Your Account
                <ArrowForwardIcon sx={{ fontSize: '1.2rem' }} />
              </Link>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginForm; 
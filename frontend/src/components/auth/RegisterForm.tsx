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
  Email as EmailIcon,
  Business as BusinessIcon,
  Badge as BadgeIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import type { RegisterRequest, UserRole } from '../../types/auth';

interface RegisterFormData extends Omit<RegisterRequest, 'role'> {
  role: UserRole;
  business_name?: string;
  supplier_name?: string;
  employee_id?: string;
}

const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    role: 'business_owner',
    email: '',
    password: '',
    full_name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSelectChange = (event: SelectChangeEvent) => {
    const role = event.target.value as UserRole;
    setFormData(prev => ({
      ...prev,
      role,
      business_name: undefined,
      supplier_name: undefined,
      employee_id: undefined
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
      
      const registrationData = {
        email: formData.email,
        password: formData.password,
        name: formData.full_name,
        role: formData.role
      };
      
      await authService.register(registrationData);
      navigate('/login');
    } catch (err: any) {
      const errorDetail = err.response?.data?.detail;
      if (Array.isArray(errorDetail)) {
        setError(errorDetail.map((e: any) => e.msg).join('\n'));
      } else if (typeof errorDetail === 'string') {
        setError(errorDetail);
      } else {
        setError('Registration failed. Please try again.');
      }
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
          height: '700px',
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

        {/* Right side - Register Form */}
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
            Create Account
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
              gap: 3
            }}
          >
            <FormControl fullWidth>
              <InputLabel id="role-label">Select User Type</InputLabel>
              <Select
                labelId="role-label"
                name="role"
                value={formData.role}
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
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
              </Select>
            </FormControl>

            <TextField
              required
              fullWidth
              name="full_name"
              label="Full Name"
              value={formData.full_name}
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
              name="email"
              label="Email"
              type="email"
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
                    <EmailIcon sx={{ color: 'text.secondary' }} />
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

            {formData.role === 'business_owner' && (
              <TextField
                required
                fullWidth
                name="business_name"
                label="Business Name"
                value={formData.business_name || ''}
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
                      <BusinessIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              />
            )}

            {formData.role === 'supplier' && (
              <TextField
                required
                fullWidth
                name="supplier_name"
                label="Supplier Name"
                value={formData.supplier_name || ''}
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
                      <BusinessIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              />
            )}

            {formData.role === 'employee' && (
              <TextField
                required
                fullWidth
                name="employee_id"
                label="Employee ID"
                value={formData.employee_id || ''}
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
                      <BadgeIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              />
            )}

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
              {loading ? <CircularProgress size={24} /> : 'REGISTER'}
            </Button>

            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              mt: 2 
            }}>
              <Link
                component={RouterLink}
                to="/login"
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
                Already have an account? Login
                <ArrowForwardIcon sx={{ fontSize: '1.2rem' }} />
              </Link>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default RegisterForm; 
import React from 'react';
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const steps = ['Request Reset', 'Reset Password'];

const PasswordReset = () => {
  const [activeStep, setActiveStep] = useState<Type>(0);
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [formData, setFormData] = useState<Type>({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState<Type>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<Type>(false);
  const [loading, setLoading] = useState<Type>(false);
  const { requestPasswordReset, resetPassword } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRequestReset = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await requestPasswordReset(formData.email);
      showNotification('Password reset instructions sent to your email', 'success');
      navigate('/login');
    } catch (error) {
      showNotification(error.message || 'Failed to send reset instructions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      showNotification('Passwords do not match', 'error');
      return;
    }

    try {
      setLoading(true);
      await resetPassword(token, formData.password);
      showNotification('Password reset successful', 'success');
      navigate('/login');
    } catch (error) {
      showNotification(error.message || 'Failed to reset password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleRequestReset}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange}
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: 'primary.main' }} />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Send Reset Instructions'}
            </Button>
          </form>
        );
      case 1:
        return (
          <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleResetPassword}>
            <TextField
              fullWidth
              label="New Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange}
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: 'primary.main' }} />
                  </InputAdornment>
                ),
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
            <TextField
              fullWidth
              label="Confirm New Password"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange}
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: 'primary.main' }} />
                  </InputAdornment>
                ),
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
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Reset Password'}
            </Button>
          </form>
        );
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0A0B1E 0%, #131428 100%)',
        p: 2
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 400,
          background: 'rgba(19, 20, 40, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <Box textAlign="center" mb={4}>
          <Typography variant="h4" className="gradient-text" gutterBottom>
            Reset Password
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {token ? 'Enter your new password' : 'Enter your email to reset your password'}
          </Typography>
        </Box>

        <Stepper activeStep={token ? 1 : 0} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent(token ? 1 : 0)}

        <Box textAlign="center">
          <Typography variant="body2" color="text.secondary">
            Remember your password?{' '}
            <Link
              component={RouterLink}
              to="/login"
              sx={{
                color: 'primary.main',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              Sign in
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default PasswordReset; 
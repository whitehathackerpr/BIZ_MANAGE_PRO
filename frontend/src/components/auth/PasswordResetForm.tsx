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
  InputAdornment
} from '@mui/material';
import {
  Email as EmailIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { authService } from '../../services/authService';
import { PasswordResetRequest } from '../../types/api/requests/auth';

const PasswordResetForm: React.FC = () => {
  const [formData, setFormData] = useState<PasswordResetRequest>({
    email: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await authService.requestPasswordReset(formData.email);
      setSuccess('Password reset link has been sent to your email.');
      setFormData({ email: '' });
    } catch (err: any) {
      setError(err.message || 'Password reset request failed. Please try again.');
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

        {/* Right side - Reset Form */}
        <Box
          sx={{
            width: '55%',
            p: 6,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          <Typography variant="h4" sx={{ mb: 4, fontWeight: 600, textAlign: 'left' }}>
            Reset Password
          </Typography>

          <Typography variant="body1" sx={{ mb: 6, color: 'text.secondary' }}>
            Enter your email address and we'll send you instructions to reset your password.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 4 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 4 }}>
              {success}
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
                    <EmailIcon sx={{ color: 'text.secondary' }} />
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
              {loading ? <CircularProgress size={24} /> : 'RESET PASSWORD'}
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
                Back to Login
                <ArrowForwardIcon sx={{ fontSize: '1.2rem' }} />
              </Link>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default PasswordResetForm; 
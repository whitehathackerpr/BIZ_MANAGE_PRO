import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import { resetPasswordThunk } from '../features/auth/authSlice';
import { 
  Box, 
  Button, 
  CardContent,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  LinearProgress
} from '@mui/material';
import { 
  LockOutlined, 
  VisibilityOutlined, 
  VisibilityOffOutlined, 
  KeyOutlined,
  CheckCircleOutline
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

const PasswordResetNewPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { passwordResetDone, passwordResetLoading, passwordResetError } = useSelector((state: RootState) => state.auth);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Calculate password strength
  const calculatePasswordStrength = (password: string): number => {
    if (!password) return 0;
    
    let strength = 0;
    // Length
    if (password.length >= 8) strength += 25;
    // Uppercase
    if (/[A-Z]/.test(password)) strength += 25;
    // Lowercase
    if (/[a-z]/.test(password)) strength += 25;
    // Numbers or symbols
    if (/[0-9!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 25;
    
    return strength;
  };

  const getPasswordStrengthColor = (strength: number): string => {
    if (strength < 25) return 'error.main';
    if (strength < 50) return 'error.main';
    if (strength < 75) return 'warning.main';
    return 'success.main';
  };

  const getPasswordStrengthLabel = (strength: number): string => {
    if (strength < 25) return 'Very Weak';
    if (strength < 50) return 'Weak';
    if (strength < 75) return 'Good';
    return 'Strong';
  };

  const passwordStrength = calculatePasswordStrength(newPassword);
  const passwordStrengthColor = getPasswordStrengthColor(passwordStrength);
  const passwordStrengthLabel = getPasswordStrengthLabel(passwordStrength);

  const validatePassword = () => {
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return false;
    }

    setPasswordError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePassword()) return;
    
    try {
      await dispatch(resetPasswordThunk({ code, new_password: newPassword })).unwrap();
      toast.success('Password reset successful!');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      toast.error(err.message || 'Failed to reset password');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8, minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Paper 
        elevation={3} 
        sx={{ 
          width: '100%', 
          borderRadius: 3,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'grey.100',
          backdropFilter: 'blur(20px)'
        }}
      >
        <Box 
          sx={{ 
            p: 3,
            bgcolor: 'primary.main',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}
        >
          <LockOutlined fontSize="large" />
          <Typography variant="h5" fontWeight={700}>
            Set New Password
          </Typography>
        </Box>
        
        <CardContent sx={{ p: 4 }}>
          {passwordResetDone ? (
            <Box textAlign="center">
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  mb: 3 
                }}
              >
                <CheckCircleOutline 
                  sx={{ 
                    fontSize: 60, 
                    color: 'success.main'
                  }} 
                />
              </Box>
              <Alert severity="success" sx={{ mb: 3 }}>
                <Typography variant="body1">
                  Your password has been successfully reset! You will be redirected to the login page.
                </Typography>
              </Alert>
              <Button 
                component={RouterLink} 
                to="/login" 
                variant="contained" 
                color="primary" 
                sx={{ mt: 2 }}
              >
                Go to Login
              </Button>
            </Box>
          ) : (
            <form onSubmit={handleSubmit}>
              <Typography variant="body1" color="text.secondary" mb={3}>
                Please enter your verification code and set a new strong password.
              </Typography>
              
              <TextField
                label="Verification Code"
                value={code}
                onChange={e => setCode(e.target.value)}
                fullWidth
                required
                margin="normal"
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <KeyOutlined />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                fullWidth
                required
                margin="normal"
                sx={{ mb: newPassword ? 0.5 : 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={togglePasswordVisibility} edge="end">
                        {showPassword ? <VisibilityOffOutlined /> : <VisibilityOutlined />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              
              {newPassword && (
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      Password strength:
                    </Typography>
                    <Typography variant="caption" sx={{ color: passwordStrengthColor }}>
                      {passwordStrengthLabel}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={passwordStrength} 
                    sx={{ 
                      borderRadius: 1,
                      height: 6,
                      bgcolor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: passwordStrengthColor
                      }
                    }} 
                  />
                </Box>
              )}
              
              <TextField
                label="Confirm Password"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                fullWidth
                required
                margin="normal"
                error={Boolean(passwordError)}
                helperText={passwordError}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined />
                    </InputAdornment>
                  )
                }}
              />
              
              <Button 
                type="submit" 
                variant="contained" 
                color="primary" 
                size="large" 
                fullWidth 
                disabled={passwordResetLoading}
                sx={{ mt: 3, mb: 2, height: 48 }}
              >
                {passwordResetLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Set New Password'
                )}
              </Button>
              
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Button 
                  component={RouterLink} 
                  to="/login" 
                  variant="text" 
                  sx={{ textTransform: 'none' }}
                >
                  Back to Login
                </Button>
              </Box>
            </form>
          )}
          
          {passwordResetError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {passwordResetError}
            </Alert>
          )}
        </CardContent>
      </Paper>
    </Container>
  );
};

export default PasswordResetNewPage; 
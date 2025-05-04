import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import { requestPasswordResetThunk, clearPasswordResetState } from '../features/auth/authSlice';
import { 
  Box, 
  Button, 
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import { LockReset } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { Link as RouterLink } from 'react-router-dom';

const PasswordResetRequestPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { passwordResetRequested, passwordResetLoading, passwordResetError } = useSelector((state: RootState) => state.auth);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(requestPasswordResetThunk({ email })).unwrap();
      toast.success('Password reset email sent!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to request password reset');
    }
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
          <LockReset fontSize="large" />
          <Typography variant="h5" fontWeight={700}>
            Reset Password
          </Typography>
        </Box>
        
        <CardContent sx={{ p: 4 }}>
          {passwordResetRequested ? (
            <Box textAlign="center">
              <Alert severity="success" sx={{ mb: 3 }}>
                <Typography variant="body1">
                  Check your email for a reset code. Please follow the instructions to reset your password.
                </Typography>
              </Alert>
              <Button 
                component={RouterLink} 
                to="/password-reset-verify" 
                variant="contained" 
                color="primary" 
                sx={{ mt: 2 }}
              >
                Enter Reset Code
              </Button>
            </Box>
          ) : (
            <form onSubmit={handleSubmit}>
              <Typography variant="body1" color="text.secondary" mb={3}>
                Enter your email address and we'll send you a link to reset your password.
              </Typography>
              
              <TextField
                label="Email Address"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                fullWidth
                required
                margin="normal"
                autoFocus
                sx={{ mb: 2 }}
                InputLabelProps={{ shrink: true }}
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
                  'Request Password Reset'
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

export default PasswordResetRequestPage; 
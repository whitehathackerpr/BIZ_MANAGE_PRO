import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import { verifyResetCodeThunk } from '../features/auth/authSlice';
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
  CircularProgress,
  InputAdornment
} from '@mui/material';
import { VerifiedUser, LockReset, KeyOutlined } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { Link as RouterLink } from 'react-router-dom';

const PasswordResetVerifyPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { passwordResetVerified, passwordResetLoading, passwordResetError } = useSelector((state: RootState) => state.auth);
  const [code, setCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(verifyResetCodeThunk({ code })).unwrap();
      toast.success('Code verified!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to verify code');
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
          <VerifiedUser fontSize="large" />
          <Typography variant="h5" fontWeight={700}>
            Verify Reset Code
          </Typography>
        </Box>
        
        <CardContent sx={{ p: 4 }}>
          {passwordResetVerified ? (
            <Box textAlign="center">
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  mb: 3 
                }}
              >
                <VerifiedUser 
                  sx={{ 
                    fontSize: 60, 
                    color: 'success.main'
                  }} 
                />
              </Box>
              <Alert severity="success" sx={{ mb: 3 }}>
                <Typography variant="body1">
                  Code successfully verified! You can now set a new password.
                </Typography>
              </Alert>
              <Button 
                component={RouterLink} 
                to="/password-reset-new" 
                variant="contained" 
                color="primary" 
                sx={{ mt: 2 }}
              >
                Set New Password
              </Button>
            </Box>
          ) : (
            <form onSubmit={handleSubmit}>
              <Typography variant="body1" color="text.secondary" mb={3}>
                Enter the verification code that was sent to your email address.
              </Typography>
              
              <TextField
                label="Verification Code"
                value={code}
                onChange={e => setCode(e.target.value)}
                fullWidth
                required
                margin="normal"
                autoFocus
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <KeyOutlined />
                    </InputAdornment>
                  ),
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
                  'Verify Code'
                )}
              </Button>
              
              <Box sx={{ mt: 3, textAlign: 'center', display: 'flex', justifyContent: 'space-between' }}>
                <Button 
                  component={RouterLink} 
                  to="/password-reset-request" 
                  variant="text" 
                  sx={{ textTransform: 'none' }}
                >
                  Request New Code
                </Button>
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

export default PasswordResetVerifyPage; 
import React from 'react';
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Lock as LockIcon,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const TwoFactorAuth = ({ onSuccess }) => {
  const [code, setCode] = useState<Type>('');
  const [showCode, setShowCode] = useState<Type>(false);
  const [loading, setLoading] = useState<Type>(false);
  const { verify2FA } = useAuth();
  const { showNotification } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (code.length !== 6) {
      showNotification('Please enter a valid 6-digit code', 'error');
      return;
    }

    try {
      setLoading(true);
      await verify2FA(code);
      showNotification('2FA verification successful', 'success');
      onSuccess?.();
    } catch (error) {
      showNotification(error.message || '2FA verification failed', 'error');
    } finally {
      setLoading(false);
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
            Two-Factor Authentication
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Enter the 6-digit code from your authenticator app
          </Typography>
        </Box>

        <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleSubmit}>
          <TextField
            fullWidth
            label="Verification Code"
            value={code}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => (e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            margin="normal"
            required
            inputProps={{
              maxLength: 6,
              pattern: '[0-9]*',
              inputMode: 'numeric',
              autoComplete: 'one-time-code'
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: 'primary.main' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => setShowCode(!showCode)}
                    edge="end"
                  >
                    {showCode ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading || code.length !== 6}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Verify Code'}
          </Button>

          <Alert severity="info" sx={{ mt: 2 }}>
            If you don't have access to your authenticator app, please contact support.
          </Alert>
        </form>
      </Paper>
    </Box>
  );
};

export default TwoFactorAuth; 
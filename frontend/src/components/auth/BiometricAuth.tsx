import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Fingerprint as FingerprintIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

// Extend the existing AuthContext with biometric methods
interface ExtendedAuthContext {
  enableBiometric: () => Promise<void>;
  verifyBiometric: () => Promise<void>;
  user: any;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (credentials: any) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  updateProfile: (profileData: any) => Promise<void>;
  changePassword: (passwordData: any) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
}

// Define NotificationContext interface
interface NotificationContextProps {
  showNotification: (message: string, severity?: 'success' | 'info' | 'warning' | 'error') => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
}

interface BiometricAuthProps {
  onSuccess?: () => void;
}

const BiometricAuth: React.FC<BiometricAuthProps> = ({ onSuccess }) => {
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [showSetupDialog, setShowSetupDialog] = useState<boolean>(false);
  const { enableBiometric, verifyBiometric } = useAuth() as ExtendedAuthContext;
  const { showNotification } = useNotification() as NotificationContextProps;

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async (): Promise<void> => {
    try {
      if (window.PublicKeyCredential) {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        setIsAvailable(available);
        if (available) {
          // Check if biometric is already enabled
          const enabled = localStorage.getItem('biometricEnabled') === 'true';
          setIsEnabled(enabled);
        }
      }
    } catch (error) {
      console.error('Biometric check failed:', error);
    }
  };

  const handleEnableBiometric = async (): Promise<void> => {
    try {
      setLoading(true);
      await enableBiometric();
      setIsEnabled(true);
      localStorage.setItem('biometricEnabled', 'true');
      showNotification('Biometric authentication enabled', 'success');
      setShowSetupDialog(false);
    } catch (error: any) {
      showNotification(error.message || 'Failed to enable biometric authentication', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyBiometric = async (): Promise<void> => {
    try {
      setLoading(true);
      await verifyBiometric();
      showNotification('Biometric verification successful', 'success');
      onSuccess?.();
    } catch (error: any) {
      showNotification(error.message || 'Biometric verification failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isAvailable) {
    return null;
  }

  return (
    <>
      <Box sx={{ mt: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={isEnabled}
              onChange={() => setShowSetupDialog(true)}
              color="primary"
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FingerprintIcon />
              <Typography>Enable Biometric Login</Typography>
            </Box>
          }
        />
      </Box>

      <Dialog
        open={showSetupDialog}
        onClose={() => setShowSetupDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SecurityIcon color="primary" />
            <Typography>Setup Biometric Authentication</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enable biometric authentication to quickly and securely access your account using your device's fingerprint or face recognition.
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            You'll need to verify your identity using your device's biometric sensor.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSetupDialog(false)}>Cancel</Button>
          <Button
            onClick={handleEnableBiometric}
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Enable Biometric Login'}
          </Button>
        </DialogActions>
      </Dialog>

      {isEnabled && (
        <Button
          fullWidth
          variant="outlined"
          startIcon={<FingerprintIcon />}
          onClick={handleVerifyBiometric}
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Login with Biometrics'}
        </Button>
      )}
    </>
  );
};

export default BiometricAuth; 
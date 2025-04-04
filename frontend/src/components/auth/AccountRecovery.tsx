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
  Stepper,
  Step,
  StepLabel,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  Security as SecurityIcon,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const steps = ['Verify Identity', 'Choose Recovery Method', 'Reset Account'];

const AccountRecovery = () => {
  const [activeStep, setActiveStep] = useState<Type>(0);
  const [formData, setFormData] = useState<Type>({
    email: '',
    phone: '',
    verificationCode: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState<Type>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<Type>(false);
  const [loading, setLoading] = useState<Type>(false);
  const [recoveryMethod, setRecoveryMethod] = useState<Type>(null);
  const [showVerificationDialog, setShowVerificationDialog] = useState<Type>(false);
  const { verifyIdentity, sendRecoveryCode, resetAccount } = useAuth();
  const { showNotification } = useNotification();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleVerifyIdentity = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await verifyIdentity(formData.email);
      setShowVerificationDialog(true);
      setActiveStep(1);
    } catch (error) {
      showNotification(error.message || 'Failed to verify identity', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSendRecoveryCode = async (method) => {
    try {
      setLoading(true);
      await sendRecoveryCode(method, formData.email);
      setRecoveryMethod(method);
      setShowVerificationDialog(true);
      showNotification(`Recovery code sent to your ${method}`, 'success');
    } catch (error) {
      showNotification(error.message || 'Failed to send recovery code', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    try {
      setLoading(true);
      await verifyIdentity(formData.email, formData.verificationCode);
      setShowVerificationDialog(false);
      setActiveStep(2);
      showNotification('Identity verified successfully', 'success');
    } catch (error) {
      showNotification(error.message || 'Failed to verify code', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetAccount = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      showNotification('Passwords do not match', 'error');
      return;
    }

    try {
      setLoading(true);
      await resetAccount(formData.email, formData.verificationCode, formData.newPassword);
      showNotification('Account reset successful', 'success');
      // Redirect to login page
    } catch (error) {
      showNotification(error.message || 'Failed to reset account', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleVerifyIdentity}>
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
              {loading ? <CircularProgress size={24} /> : 'Verify Identity'}
            </Button>
          </form>
        );
      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              Choose a recovery method:
            </Typography>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<EmailIcon />}
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => handleSendRecoveryCode('email')}
              disabled={loading}
              sx={{ mb: 2 }}
            >
              Send code via Email
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<PhoneIcon />}
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => handleSendRecoveryCode('phone')}
              disabled={loading}
            >
              Send code via SMS
            </Button>
          </Box>
        );
      case 2:
        return (
          <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleResetAccount}>
            <TextField
              fullWidth
              label="New Password"
              name="newPassword"
              type={showPassword ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange}
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SecurityIcon sx={{ color: 'primary.main' }} />
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
                    <SecurityIcon sx={{ color: 'primary.main' }} />
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
              {loading ? <CircularProgress size={24} /> : 'Reset Account'}
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
            Account Recovery
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Follow the steps to recover your account
          </Typography>
        </Box>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent(activeStep)}

        <Dialog
          open={showVerificationDialog}
          onClose={() => setShowVerificationDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Verify Your Identity</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Verification Code"
              name="verificationCode"
              type="text"
              fullWidth
              value={formData.verificationCode}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange}
              placeholder="Enter the code sent to your device"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => setShowVerificationDialog(false)}>Cancel</Button>
            <Button
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleVerifyCode}
              variant="contained"
              disabled={loading || !formData.verificationCode}
            >
              {loading ? <CircularProgress size={24} /> : 'Verify Code'}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default AccountRecovery; 
import React from 'react';
import React, { useState } from 'react';
import {
  Box,
  Button,
  Divider,
  Typography,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Google as GoogleIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  GitHub as GitHubIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const SocialLogin = ({ onSuccess }) => {
  const [loading, setLoading] = useState<Type>(false);
  const [rememberMe, setRememberMe] = useState<Type>(false);
  const { loginWithSocial, setRememberMe: setAuthRememberMe } = useAuth();
  const { showNotification } = useNotification();

  const handleSocialLogin = async (provider) => {
    try {
      setLoading(true);
      await loginWithSocial(provider, rememberMe);
      showNotification(`Successfully logged in with ${provider}`, 'success');
      onSuccess?.();
    } catch (error) {
      showNotification(error.message || `Failed to login with ${provider}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRememberMeChange = (event) => {
    setRememberMe(event.target.checked);
    setAuthRememberMe(event.target.checked);
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Divider sx={{ flexGrow: 1 }} />
        <Typography variant="body2" color="text.secondary" sx={{ mx: 2 }}>
          Or continue with
        </Typography>
        <Divider sx={{ flexGrow: 1 }} />
      </Box>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<GoogleIcon />}
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => handleSocialLogin('google')}
          disabled={loading}
          sx={{ minWidth: 120 }}
        >
          Google
        </Button>
        <Button
          variant="outlined"
          startIcon={<FacebookIcon />}
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => handleSocialLogin('facebook')}
          disabled={loading}
          sx={{ minWidth: 120 }}
        >
          Facebook
        </Button>
        <Button
          variant="outlined"
          startIcon={<TwitterIcon />}
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => handleSocialLogin('twitter')}
          disabled={loading}
          sx={{ minWidth: 120 }}
        >
          Twitter
        </Button>
        <Button
          variant="outlined"
          startIcon={<LinkedInIcon />}
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => handleSocialLogin('linkedin')}
          disabled={loading}
          sx={{ minWidth: 120 }}
        >
          LinkedIn
        </Button>
        <Button
          variant="outlined"
          startIcon={<GitHubIcon />}
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => handleSocialLogin('github')}
          disabled={loading}
          sx={{ minWidth: 120 }}
        >
          GitHub
        </Button>
      </Box>

      <FormControlLabel
        control={
          <Checkbox
            checked={rememberMe}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleRememberMeChange}
            color="primary"
          />
        }
        label="Remember me"
      />

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      <Alert severity="info" sx={{ mt: 2 }}>
        By continuing with a social account, you agree to our Terms of Service and Privacy Policy.
      </Alert>
    </Box>
  );
};

export default SocialLogin; 
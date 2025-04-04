import React from 'react';
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  IconButton,
  InputAdornment,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Lock,
} from '@mui/icons-material';
import {
  Container,
  StyledPaper,
  WelcomeSection,
  FormSection,
  WelcomeTitle,
  WelcomeText,
  Title,
  Subtitle,
  Form,
  StyledTextField,
  SubmitButton,
  StyledLink,
  SignUpPrompt,
  ErrorMessage,
  SuccessMessage,
  LoadingOverlay,
} from './styles';
import { useAuth } from '../../contexts/AuthContext';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const { resetPassword } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [formData, setFormData] = useState<Type>({
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState<Type>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<Type>(false);
  const [error, setError] = useState<Type>('');
  const [success, setSuccess] = useState<Type>('');
  const [loading, setLoading] = useState<Type>(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.password) {
      setError('Please enter a new password');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await resetPassword(token, formData.password);
      if (result.success) {
        setSuccess('Password reset successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(result.error || 'Password reset failed. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <StyledPaper elevation={3}>
        <WelcomeSection>
          <WelcomeTitle variant="h1">
            RESET PASSWORD
          </WelcomeTitle>
          <WelcomeText>
            Create a new password for your account to regain access to BizManage Pro.
          </WelcomeText>
        </WelcomeSection>

        <FormSection>
          <Title variant="h4">New Password</Title>
          <Subtitle>Enter your new password below</Subtitle>

          <Form onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleSubmit}>
            {error && <ErrorMessage>{error}</ErrorMessage>}
            {success && <SuccessMessage>{success}</SuccessMessage>}

            <StyledTextField
              fullWidth
              label="New Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange}
              placeholder="Enter your new password"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: 'action.active' }} />
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

            <StyledTextField
              fullWidth
              label="Confirm New Password"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange}
              placeholder="Confirm your new password"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: 'action.active' }} />
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

            <SubmitButton
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
            >
              Reset Password
            </SubmitButton>

            <SignUpPrompt>
              <span>Remember your password? </span>
              <StyledLink href="/login">Sign in</StyledLink>
            </SignUpPrompt>
          </Form>

          {loading && <LoadingOverlay />}
        </FormSection>
      </StyledPaper>
    </Container>
  );
};

export default ResetPassword; 
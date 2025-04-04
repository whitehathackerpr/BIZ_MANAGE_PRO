import React from 'react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  InputAdornment,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Email,
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

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { requestPasswordReset } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [email, setEmail] = useState<Type>('');
  const [error, setError] = useState<Type>('');
  const [success, setSuccess] = useState<Type>('');
  const [loading, setLoading] = useState<Type>(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const validateForm = () => {
    if (!email) {
      setError('Please enter your email address');
      return false;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
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
      const result = await requestPasswordReset(email);
      if (result.success) {
        setSuccess('Password reset instructions have been sent to your email.');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(result.error || 'Failed to send reset instructions. Please try again.');
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
            FORGOT PASSWORD
          </WelcomeTitle>
          <WelcomeText>
            Don't worry! Enter your email address and we'll send you instructions to reset your password.
          </WelcomeText>
        </WelcomeSection>

        <FormSection>
          <Title variant="h4">Reset Password</Title>
          <Subtitle>Enter your email to receive reset instructions</Subtitle>

          <Form onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleSubmit}>
            {error && <ErrorMessage>{error}</ErrorMessage>}
            {success && <SuccessMessage>{success}</SuccessMessage>}

            <StyledTextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange}
              placeholder="Enter your email address"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: 'action.active' }} />
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
              Send Reset Instructions
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

export default ForgotPassword; 
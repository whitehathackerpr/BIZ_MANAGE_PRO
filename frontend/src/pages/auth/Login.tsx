import React from 'react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
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
  FormFooter,
  CheckboxLabel,
  SignUpPrompt,
  ErrorMessage,
  SuccessMessage,
  LoadingOverlay,
} from './styles';
import { useAuth } from '../../hooks/useAuth';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [formData, setFormData] = useState<Type>({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState<Type>(false);
  const [error, setError] = useState<Type>('');
  const [success, setSuccess] = useState<Type>('');
  const [loading, setLoading] = useState<Type>(false);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'rememberMe' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      setSuccess('Login successful! Redirecting...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <StyledPaper elevation={3}>
        <WelcomeSection>
          <WelcomeTitle variant="h1">
            WELCOME
          </WelcomeTitle>
          <WelcomeText>
            Welcome to BizManage Pro. Sign in to access your account and manage your business efficiently.
          </WelcomeText>
        </WelcomeSection>

        <FormSection>
          <Title variant="h4">Sign in</Title>
          <Subtitle>Enter your credentials to continue</Subtitle>

          <Form onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleSubmit}>
            {error && <ErrorMessage>{error}</ErrorMessage>}
            {success && <SuccessMessage>{success}</SuccessMessage>}

            <StyledTextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange}
              placeholder="Enter your email"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: 'action.active' }} />
                  </InputAdornment>
                ),
              }}
            />

            <StyledTextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange}
              placeholder="Enter your password"
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

            <FormFooter>
              <FormControlLabel
                control={
                  <Checkbox
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange}
                    color="primary"
                    size="small"
                  />
                }
                label={<CheckboxLabel>Remember me</CheckboxLabel>}
              />
              <StyledLink href="/forgot-password">
                Forgot Password?
              </StyledLink>
            </FormFooter>

            <SubmitButton
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
            >
              Sign in
            </SubmitButton>

            <SignUpPrompt>
              <span>Don't have an account? </span>
              <StyledLink href="/register">Sign up</StyledLink>
            </SignUpPrompt>
          </Form>

          {loading && <LoadingOverlay />}
        </FormSection>
      </StyledPaper>
    </Container>
  );
};

export default Login; 
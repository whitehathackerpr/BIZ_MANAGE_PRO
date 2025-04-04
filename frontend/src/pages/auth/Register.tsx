import React from 'react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Email,
  Lock,
  Person,
  Business,
  Phone,
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

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [formData, setFormData] = useState<Type>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    phone: '',
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
    if (!formData.firstName || !formData.lastName) {
      setError('Please enter your full name');
      return false;
    }
    if (!formData.email) {
      setError('Please enter your email');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.password) {
      setError('Please enter a password');
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
      const result = await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        companyName: formData.companyName,
        phone: formData.phone,
      });

      if (result.success) {
        setSuccess('Registration successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(result.error || 'Registration failed. Please try again.');
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
            JOIN US
          </WelcomeTitle>
          <WelcomeText>
            Create your account and start managing your business efficiently with BizManage Pro.
          </WelcomeText>
        </WelcomeSection>

        <FormSection>
          <Title variant="h4">Create Account</Title>
          <Subtitle>Fill in your details to get started</Subtitle>

          <Form onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleSubmit}>
            {error && <ErrorMessage>{error}</ErrorMessage>}
            {success && <SuccessMessage>{success}</SuccessMessage>}

            <Box sx={{ display: 'flex', gap: 2 }}>
              <StyledTextField
                fullWidth
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange}
                placeholder="Enter your first name"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: 'action.active' }} />
                    </InputAdornment>
                  ),
                }}
              />

              <StyledTextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange}
                placeholder="Enter your last name"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: 'action.active' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

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
              label="Company Name (Optional)"
              name="companyName"
              value={formData.companyName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange}
              placeholder="Enter your company name"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Business sx={{ color: 'action.active' }} />
                  </InputAdornment>
                ),
              }}
            />

            <StyledTextField
              fullWidth
              label="Phone Number (Optional)"
              name="phone"
              value={formData.phone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange}
              placeholder="Enter your phone number"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone sx={{ color: 'action.active' }} />
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

            <StyledTextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange}
              placeholder="Confirm your password"
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
              Create Account
            </SubmitButton>

            <SignUpPrompt>
              <span>Already have an account? </span>
              <StyledLink href="/login">Sign in</StyledLink>
            </SignUpPrompt>
          </Form>

          {loading && <LoadingOverlay />}
        </FormSection>
      </StyledPaper>
    </Container>
  );
};

export default Register; 
import React from 'react';
import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useStore from '../../store/useStore';

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
});

const LoginForm = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useStore();

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await login(values);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 400,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome Back
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Please sign in to continue
        </Typography>

        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={validationSchema}
          onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleSubmit}
        >
          {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
            <Form style={{ width: '100%' }}>
              <TextField
                fullWidth
                id="email"
                name="email"
                label="Email"
                value={values.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange}
                onBlur={handleBlur}
                error={touched.email && Boolean(errors.email)}
                helperText={touched.email && errors.email}
                margin="normal"
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />

              <TextField
                fullWidth
                id="password"
                name="password"
                label="Password"
                type="password"
                value={values.password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange}
                onBlur={handleBlur}
                error={touched.password && Boolean(errors.password)}
                helperText={touched.password && errors.password}
                margin="normal"
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                disabled={isSubmitting || isLoading}
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
                  },
                }}
              >
                {isSubmitting || isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Sign In'
                )}
              </Button>

              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Don't have an account?{' '}
                  <Button
                    color="primary"
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => navigate('/register')}
                    sx={{ textTransform: 'none' }}
                  >
                    Sign Up
                  </Button>
                </Typography>
              </Box>
            </Form>
          )}
        </Formik>
      </Paper>
    </Box>
  );
};

export default LoginForm; 
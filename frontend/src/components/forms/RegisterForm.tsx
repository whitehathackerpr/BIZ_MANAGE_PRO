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
  Grid,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useStore from '../../store/useStore';

interface RegisterValues {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
}

const validationSchema = Yup.object().shape({
  username: Yup.string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
});

const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useStore();

  const handleSubmit = async (values: RegisterValues, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
    try {
      const registerData: RegisterData = {
        name: values.username,
        email: values.email,
        password: values.password,
        confirm_password: values.confirmPassword,
      };
      
      await register(registerData);
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Registration failed';
      toast.error(errorMessage);
      console.error('Registration error:', error);
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
          maxWidth: 500,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Create Account
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Join our business management platform
        </Typography>

        <Formik
          initialValues={{
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
            <Form style={{ width: '100%' }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="username"
                    name="username"
                    label="Username"
                    value={values.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.username && Boolean(errors.username)}
                    helperText={touched.username && errors.username}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: 'primary.main',
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="email"
                    name="email"
                    label="Email"
                    type="email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: 'primary.main',
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="password"
                    name="password"
                    label="Password"
                    type="password"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.password && Boolean(errors.password)}
                    helperText={touched.password && errors.password}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: 'primary.main',
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="confirmPassword"
                    name="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    value={values.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                    helperText={touched.confirmPassword && errors.confirmPassword}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: 'primary.main',
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    disabled={isSubmitting || isLoading}
                    sx={{
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
                      'Create Account'
                    )}
                  </Button>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Already have an account?{' '}
                      <Button
                        color="primary"
                        onClick={() => navigate('/login')}
                        sx={{ textTransform: 'none' }}
                      >
                        Sign In
                      </Button>
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </Paper>
    </Box>
  );
};

export default RegisterForm; 
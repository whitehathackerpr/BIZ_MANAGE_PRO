import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import './Auth.css';

const schema = yup.object().shape({
  email: yup
    .string()
    .email('Please enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      await login(data);
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-content">
          <div className="auth-form-container">
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">Sign in to continue to your account</p>

            <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
              <Input
                placeholder="Email"
                type="email"
                id="email"
                name="email"
                error={errors.email?.message}
                {...register('email')}
              />

              <Input
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                error={errors.password?.message}
                {...register('password')}
              />

              <div className="form-actions">
                <button 
                  type="button" 
                  className="forgot-password-link"
                  onClick={() => navigate('/forgot-password')}
                >
                  Forgot Password?
                </button>
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={isSubmitting}
                className="login-button"
              >
                {isSubmitting ? 'Signing in...' : 'Login'}
              </Button>
            </form>
          </div>

          <div className="auth-side-content">
            <div className="new-user-content">
              <h2>New Here?</h2>
              <p>Get exclusive access to cool features and unlimited benefits. Sign up now and start exploring our new world</p>
              <Link to="/register">
                <Button variant="outlined" fullWidth className="signup-button">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 
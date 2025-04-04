import React from 'react';
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
  name: yup
    .string()
    .required('Full name is required')
    .min(2, 'Name must be at least 2 characters'),
  email: yup
    .string()
    .email('Please enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password'),
});

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState<Type>(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      await registerUser(data);
      navigate('/');
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-content">
          <div className="auth-side-content">
            <div className="new-user-content">
              <h2>Welcome Back!</h2>
              <p>Already have an account? Sign in to access your dashboard and continue managing your business.</p>
              <Link to="/login">
                <Button variant="outlined" fullWidth className="signup-button">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>

          <div className="auth-form-container">
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Get started with your free account today</p>

            <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleSubmit(onSubmit)} className="auth-form">
              <Input
                placeholder="Full Name"
                type="text"
                id="name"
                name="name"
                error={errors.name?.message}
                {...register('name')}
              />

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

              <Input
                placeholder="Confirm Password"
                type={showPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />

              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={isSubmitting}
                className="login-button"
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register; 
import React from 'react';
import LoginForm from '../../components/auth/LoginForm';

const LoginPage: React.FC = () => {
  return (
    <div className="auth-page login-page">
      <div className="auth-container">
        <h1>Welcome Back</h1>
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage; 
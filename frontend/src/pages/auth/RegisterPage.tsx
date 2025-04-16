import React from 'react';
import RegisterForm from '../../components/auth/RegisterForm';

const RegisterPage: React.FC = () => {
  return (
    <div className="auth-page register-page">
      <div className="auth-container">
        <h1>Create Account</h1>
        <RegisterForm />
      </div>
    </div>
  );
};

export default RegisterPage; 
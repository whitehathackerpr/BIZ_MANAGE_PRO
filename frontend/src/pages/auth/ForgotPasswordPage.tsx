import React from 'react';
import PasswordResetForm from '../../components/auth/PasswordResetForm';

const ForgotPasswordPage: React.FC = () => {
  return (
    <div className="auth-page forgot-password-page">
      <div className="auth-container">
        <h1>Forgot Password</h1>
        <PasswordResetForm />
      </div>
    </div>
  );
};

export default ForgotPasswordPage; 
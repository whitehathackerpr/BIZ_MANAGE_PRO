import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { PasswordUpdateRequest } from '../../types/api/requests/auth';
import { AxiosError } from 'axios';

const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const resetData: PasswordUpdateRequest = {
        token: token || '',
        password: formData.password
      };
      
      const response = await authService.updatePassword(resetData);
      setLoading(false);
      setSuccess(response.message || 'Password has been reset successfully. You can now log in with your new password.');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (err) {
      setLoading(false);
      if (err instanceof AxiosError && err.response) {
        setError(err.response.data.message || 'Password reset failed. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
      console.error('Password reset error:', err);
    }
  };

  if (!token) {
    return (
      <div className="auth-page reset-password-page">
        <div className="auth-container">
          <h1>Invalid Reset Link</h1>
          <p>The password reset link is invalid or has expired.</p>
          <div className="form-links">
            <a href="/forgot-password">Request a new password reset link</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page reset-password-page">
      <div className="auth-container">
        <h1>Reset Your Password</h1>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="password">New Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
              placeholder="Enter your new password"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm your new password"
            />
          </div>
          
          <div className="form-actions">
            <button type="submit" disabled={loading}>
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </div>
          
          <div className="form-links">
            <a href="/login">Back to Login</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage; 
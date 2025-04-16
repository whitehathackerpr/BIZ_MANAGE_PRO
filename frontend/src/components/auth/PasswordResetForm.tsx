import React, { useState } from 'react';
import { authService } from '../../services/authService';
import { PasswordResetRequest } from '../../types/api/requests/auth';
import { AxiosError } from 'axios';

const PasswordResetForm: React.FC = () => {
  const [formData, setFormData] = useState<PasswordResetRequest>({
    email: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await authService.requestPasswordReset(formData);
      setLoading(false);
      setSuccess(response.message || 'Password reset link has been sent to your email.');
      // Clear the form
      setFormData({ email: '' });
    } catch (err) {
      setLoading(false);
      if (err instanceof AxiosError && err.response) {
        setError(err.response.data.message || 'Password reset request failed. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
      console.error('Password reset request error:', err);
    }
  };

  return (
    <div className="password-reset-form">
      <h2>Reset Your Password</h2>
      <p>Enter your email address, and we'll send you instructions to reset your password.</p>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Enter your email"
          />
        </div>
        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Reset Password'}
          </button>
        </div>
        <div className="form-links">
          <a href="/login">Back to Login</a>
        </div>
      </form>
    </div>
  );
};

export default PasswordResetForm; 
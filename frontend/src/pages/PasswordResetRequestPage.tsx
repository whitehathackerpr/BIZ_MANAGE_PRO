import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import { requestPasswordResetThunk, clearPasswordResetState } from '../features/auth/authSlice';
import { toast } from 'react-toastify';

const PasswordResetRequestPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { passwordResetRequested, passwordResetLoading, passwordResetError } = useSelector((state: RootState) => state.auth);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(requestPasswordResetThunk({ email })).unwrap();
      toast.success('Password reset email sent!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to request password reset');
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded shadow mt-10">
      <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
      {passwordResetRequested ? (
        <div className="text-green-600 font-semibold mb-2">Check your email for a reset code.</div>
      ) : (
        <form onSubmit={handleSubmit}>
          <label className="block mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="input input-bordered w-full mb-2"
            required
          />
          <button className="btn btn-primary" type="submit" disabled={passwordResetLoading}>Request Reset</button>
        </form>
      )}
      {passwordResetError && <div className="text-red-500 mt-2">{passwordResetError}</div>}
    </div>
  );
};

export default PasswordResetRequestPage; 
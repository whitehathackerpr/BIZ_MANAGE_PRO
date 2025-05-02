import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import { resetPasswordThunk } from '../features/auth/authSlice';
import { toast } from 'react-toastify';

const PasswordResetNewPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { passwordResetDone, passwordResetLoading, passwordResetError } = useSelector((state: RootState) => state.auth);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(resetPasswordThunk({ code, new_password: newPassword })).unwrap();
      toast.success('Password reset successful!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to reset password');
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded shadow mt-10">
      <h2 className="text-2xl font-bold mb-4">Set New Password</h2>
      {passwordResetDone ? (
        <div className="text-green-600 font-semibold mb-2">Password reset! You can now log in.</div>
      ) : (
        <form onSubmit={handleSubmit}>
          <label className="block mb-1">Reset Code</label>
          <input
            type="text"
            value={code}
            onChange={e => setCode(e.target.value)}
            className="input input-bordered w-full mb-2"
            required
          />
          <label className="block mb-1">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            className="input input-bordered w-full mb-2"
            required
          />
          <button className="btn btn-primary" type="submit" disabled={passwordResetLoading}>Set New Password</button>
        </form>
      )}
      {passwordResetError && <div className="text-red-500 mt-2">{passwordResetError}</div>}
    </div>
  );
};

export default PasswordResetNewPage; 
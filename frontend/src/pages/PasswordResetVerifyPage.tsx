import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import { verifyResetCodeThunk } from '../features/auth/authSlice';
import { toast } from 'react-toastify';

const PasswordResetVerifyPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { passwordResetVerified, passwordResetLoading, passwordResetError } = useSelector((state: RootState) => state.auth);
  const [code, setCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(verifyResetCodeThunk({ code })).unwrap();
      toast.success('Code verified!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to verify code');
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded shadow mt-10">
      <h2 className="text-2xl font-bold mb-4">Verify Reset Code</h2>
      {passwordResetVerified ? (
        <div className="text-green-600 font-semibold mb-2">Code verified! You can now set a new password.</div>
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
          <button className="btn btn-primary" type="submit" disabled={passwordResetLoading}>Verify Code</button>
        </form>
      )}
      {passwordResetError && <div className="text-red-500 mt-2">{passwordResetError}</div>}
    </div>
  );
};

export default PasswordResetVerifyPage; 
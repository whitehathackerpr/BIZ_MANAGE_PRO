import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import {
  sendVerificationEmailThunk,
  verifyEmailThunk,
  clearEmailVerificationState,
} from '../features/auth/authSlice';
import { toast } from 'react-toastify';

const EmailVerificationPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    user,
    emailVerificationSent,
    emailVerified,
    emailVerificationLoading,
    emailVerificationError,
  } = useSelector((state: RootState) => state.auth);
  const [code, setCode] = useState('');

  const handleSend = async () => {
    if (!user?.email) return toast.error('No email found');
    await dispatch(sendVerificationEmailThunk({ email: user.email }));
    toast.success('Verification email sent!');
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(verifyEmailThunk({ code })).unwrap();
      toast.success('Email verified!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to verify email');
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded shadow mt-10">
      <h2 className="text-2xl font-bold mb-4">Email Verification</h2>
      {emailVerified ? (
        <div className="text-green-600 font-semibold mb-2">Your email is verified.</div>
      ) : (
        <>
          <button className="btn btn-primary mb-4" onClick={handleSend} disabled={emailVerificationLoading}>
            Send Verification Email
          </button>
          {emailVerificationSent && (
            <form onSubmit={handleVerify} className="mb-4">
              <label className="block mb-1">Enter verification code:</label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                className="input input-bordered w-full mb-2"
                required
              />
              <button className="btn btn-success" type="submit" disabled={emailVerificationLoading}>Verify Email</button>
            </form>
          )}
        </>
      )}
      {emailVerificationError && <div className="text-red-500 mt-2">{emailVerificationError}</div>}
    </div>
  );
};

export default EmailVerificationPage; 
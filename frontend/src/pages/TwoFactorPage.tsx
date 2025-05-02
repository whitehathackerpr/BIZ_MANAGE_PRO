import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import {
  setup2FAThunk,
  verify2FAThunk,
  enable2FAThunk,
  disable2FAThunk,
  clear2FAState,
} from '../features/auth/authSlice';
import { toast } from 'react-toastify';

const TwoFactorPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    twoFASetup,
    twoFAEnabled,
    twoFAVerified,
    twoFALoading,
    twoFAError,
  } = useSelector((state: RootState) => state.auth);
  const [code, setCode] = useState('');

  const handleSetup = async () => {
    await dispatch(setup2FAThunk());
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(verify2FAThunk({ code })).unwrap();
      toast.success('2FA verified!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to verify 2FA');
    }
  };

  const handleEnable = async () => {
    await dispatch(enable2FAThunk());
    toast.success('2FA enabled!');
  };

  const handleDisable = async () => {
    await dispatch(disable2FAThunk());
    dispatch(clear2FAState());
    toast.success('2FA disabled!');
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded shadow mt-10">
      <h2 className="text-2xl font-bold mb-4">Two-Factor Authentication (2FA)</h2>
      {twoFAEnabled ? (
        <div className="mb-4">
          <p className="text-green-600 font-semibold mb-2">2FA is enabled on your account.</p>
          <button className="btn btn-danger" onClick={handleDisable} disabled={twoFALoading}>Disable 2FA</button>
        </div>
      ) : (
        <>
          <button className="btn btn-primary mb-4" onClick={handleSetup} disabled={twoFALoading}>
            Setup 2FA
          </button>
          {twoFASetup && (
            <div className="mb-4">
              <p className="mb-2">Scan this QR code with your authenticator app:</p>
              <img src={twoFASetup.qr_code} alt="2FA QR Code" className="mb-2" />
              <p className="text-xs text-gray-500">Secret: {twoFASetup.secret}</p>
            </div>
          )}
          {twoFASetup && (
            <form onSubmit={handleVerify} className="mb-4">
              <label className="block mb-1">Enter code from your authenticator app:</label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                className="input input-bordered w-full mb-2"
                required
              />
              <button className="btn btn-success" type="submit" disabled={twoFALoading}>Verify 2FA</button>
            </form>
          )}
          {twoFAVerified && !twoFAEnabled && (
            <button className="btn btn-success" onClick={handleEnable} disabled={twoFALoading}>
              Enable 2FA
            </button>
          )}
        </>
      )}
      {twoFAError && <div className="text-red-500 mt-2">{twoFAError}</div>}
    </div>
  );
};

export default TwoFactorPage; 
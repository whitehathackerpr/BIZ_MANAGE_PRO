import api from '../../api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface TwoFASetupResponse {
  qr_code: string;
  secret: string;
}

export interface TwoFAVerifyRequest {
  code: string;
}

export interface EmailVerificationRequest {
  email: string;
}

export interface EmailVerificationCodeRequest {
  code: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetVerifyRequest {
  code: string;
}

export interface PasswordResetConfirmRequest {
  code: string;
  new_password: string;
}

export const login = async (data: LoginRequest): Promise<{ token: string }> => {
  const res = await api.post('/auth/login', data);
  return res.data;
};

export const fetchCurrentUser = async (): Promise<User> => {
  const res = await api.get<User>('/auth/me');
  return res.data;
};

// 2FA
export const setup2FA = async (): Promise<TwoFASetupResponse> => {
  const res = await api.post('/auth/2fa/setup');
  return res.data;
};
export const verify2FA = async (data: TwoFAVerifyRequest): Promise<{ success: boolean }> => {
  const res = await api.post('/auth/2fa/verify', data);
  return res.data;
};
export const enable2FA = async (): Promise<{ success: boolean }> => {
  const res = await api.post('/auth/2fa/enable');
  return res.data;
};
export const disable2FA = async (): Promise<{ success: boolean }> => {
  const res = await api.post('/auth/2fa/disable');
  return res.data;
};

// Email Verification
export const sendVerificationEmail = async (data: EmailVerificationRequest): Promise<{ success: boolean }> => {
  const res = await api.post('/auth/email/send-verification', data);
  return res.data;
};
export const verifyEmail = async (data: EmailVerificationCodeRequest): Promise<{ success: boolean }> => {
  const res = await api.post('/auth/email/verify', data);
  return res.data;
};

// Password Reset
export const requestPasswordReset = async (data: PasswordResetRequest): Promise<{ success: boolean }> => {
  const res = await api.post('/auth/password/request-reset', data);
  return res.data;
};
export const verifyResetCode = async (data: PasswordResetVerifyRequest): Promise<{ success: boolean }> => {
  const res = await api.post('/auth/password/verify-reset', data);
  return res.data;
};
export const resetPassword = async (data: PasswordResetConfirmRequest): Promise<{ success: boolean }> => {
  const res = await api.post('/auth/password/reset', data);
  return res.data;
}; 
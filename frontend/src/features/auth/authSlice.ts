import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  login as loginAPI,
  fetchCurrentUser,
  setup2FA,
  verify2FA,
  enable2FA,
  disable2FA,
  sendVerificationEmail,
  verifyEmail,
  requestPasswordReset,
  verifyResetCode,
  resetPassword,
  LoginRequest,
  User,
  TwoFASetupResponse,
  TwoFAVerifyRequest,
  EmailVerificationRequest,
  EmailVerificationCodeRequest,
  PasswordResetRequest,
  PasswordResetVerifyRequest,
  PasswordResetConfirmRequest,
} from './authAPI';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  // 2FA
  twoFASetup?: TwoFASetupResponse | null;
  twoFAEnabled?: boolean;
  twoFAVerified?: boolean;
  twoFALoading?: boolean;
  twoFAError?: string | null;
  // Email Verification
  emailVerificationSent?: boolean;
  emailVerified?: boolean;
  emailVerificationLoading?: boolean;
  emailVerificationError?: string | null;
  // Password Reset
  passwordResetRequested?: boolean;
  passwordResetVerified?: boolean;
  passwordResetDone?: boolean;
  passwordResetLoading?: boolean;
  passwordResetError?: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
  error: null,
  // 2FA
  twoFASetup: null,
  twoFAEnabled: false,
  twoFAVerified: false,
  twoFALoading: false,
  twoFAError: null,
  // Email Verification
  emailVerificationSent: false,
  emailVerified: false,
  emailVerificationLoading: false,
  emailVerificationError: null,
  // Password Reset
  passwordResetRequested: false,
  passwordResetVerified: false,
  passwordResetDone: false,
  passwordResetLoading: false,
  passwordResetError: null,
};

// 2FA Thunks
export const setup2FAThunk = createAsyncThunk('auth/setup2FA', async (_, { rejectWithValue }) => {
  try {
    return await setup2FA();
  } catch (err: any) {
    return rejectWithValue('Failed to setup 2FA');
  }
});
export const verify2FAThunk = createAsyncThunk('auth/verify2FA', async (data: TwoFAVerifyRequest, { rejectWithValue }) => {
  try {
    return await verify2FA(data);
  } catch (err: any) {
    return rejectWithValue('Failed to verify 2FA');
  }
});
export const enable2FAThunk = createAsyncThunk('auth/enable2FA', async (_, { rejectWithValue }) => {
  try {
    return await enable2FA();
  } catch (err: any) {
    return rejectWithValue('Failed to enable 2FA');
  }
});
export const disable2FAThunk = createAsyncThunk('auth/disable2FA', async (_, { rejectWithValue }) => {
  try {
    return await disable2FA();
  } catch (err: any) {
    return rejectWithValue('Failed to disable 2FA');
  }
});

// Email Verification Thunks
export const sendVerificationEmailThunk = createAsyncThunk('auth/sendVerificationEmail', async (data: EmailVerificationRequest, { rejectWithValue }) => {
  try {
    return await sendVerificationEmail(data);
  } catch (err: any) {
    return rejectWithValue('Failed to send verification email');
  }
});
export const verifyEmailThunk = createAsyncThunk('auth/verifyEmail', async (data: EmailVerificationCodeRequest, { rejectWithValue }) => {
  try {
    return await verifyEmail(data);
  } catch (err: any) {
    return rejectWithValue('Failed to verify email');
  }
});

// Password Reset Thunks
export const requestPasswordResetThunk = createAsyncThunk('auth/requestPasswordReset', async (data: PasswordResetRequest, { rejectWithValue }) => {
  try {
    return await requestPasswordReset(data);
  } catch (err: any) {
    return rejectWithValue('Failed to request password reset');
  }
});
export const verifyResetCodeThunk = createAsyncThunk('auth/verifyResetCode', async (data: PasswordResetVerifyRequest, { rejectWithValue }) => {
  try {
    return await verifyResetCode(data);
  } catch (err: any) {
    return rejectWithValue('Failed to verify reset code');
  }
});
export const resetPasswordThunk = createAsyncThunk('auth/resetPassword', async (data: PasswordResetConfirmRequest, { rejectWithValue }) => {
  try {
    return await resetPassword(data);
  } catch (err: any) {
    return rejectWithValue('Failed to reset password');
  }
});

export const login = createAsyncThunk('auth/login', async (data: LoginRequest, { rejectWithValue }) => {
  try {
    const res = await loginAPI(data);
    localStorage.setItem('token', res.token);
    return res.token;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.detail || 'Login failed');
  }
});

export const getCurrentUser = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    return await fetchCurrentUser();
  } catch (err: any) {
    return rejectWithValue('Failed to fetch user');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
    },
    clear2FAState(state) {
      state.twoFASetup = null;
      state.twoFAEnabled = false;
      state.twoFAVerified = false;
      state.twoFALoading = false;
      state.twoFAError = null;
    },
    clearEmailVerificationState(state) {
      state.emailVerificationSent = false;
      state.emailVerified = false;
      state.emailVerificationLoading = false;
      state.emailVerificationError = null;
    },
    clearPasswordResetState(state) {
      state.passwordResetRequested = false;
      state.passwordResetVerified = false;
      state.passwordResetDone = false;
      state.passwordResetLoading = false;
      state.passwordResetError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login/User
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.token = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // 2FA
      .addCase(setup2FAThunk.pending, (state) => {
        state.twoFALoading = true;
        state.twoFAError = null;
      })
      .addCase(setup2FAThunk.fulfilled, (state, action: PayloadAction<TwoFASetupResponse>) => {
        state.twoFALoading = false;
        state.twoFASetup = action.payload;
      })
      .addCase(setup2FAThunk.rejected, (state, action) => {
        state.twoFALoading = false;
        state.twoFAError = action.payload as string;
      })
      .addCase(verify2FAThunk.pending, (state) => {
        state.twoFALoading = true;
        state.twoFAError = null;
      })
      .addCase(verify2FAThunk.fulfilled, (state) => {
        state.twoFALoading = false;
        state.twoFAVerified = true;
      })
      .addCase(verify2FAThunk.rejected, (state, action) => {
        state.twoFALoading = false;
        state.twoFAError = action.payload as string;
      })
      .addCase(enable2FAThunk.fulfilled, (state) => {
        state.twoFAEnabled = true;
      })
      .addCase(disable2FAThunk.fulfilled, (state) => {
        state.twoFAEnabled = false;
      })
      // Email Verification
      .addCase(sendVerificationEmailThunk.pending, (state) => {
        state.emailVerificationLoading = true;
        state.emailVerificationError = null;
      })
      .addCase(sendVerificationEmailThunk.fulfilled, (state) => {
        state.emailVerificationLoading = false;
        state.emailVerificationSent = true;
      })
      .addCase(sendVerificationEmailThunk.rejected, (state, action) => {
        state.emailVerificationLoading = false;
        state.emailVerificationError = action.payload as string;
      })
      .addCase(verifyEmailThunk.pending, (state) => {
        state.emailVerificationLoading = true;
        state.emailVerificationError = null;
      })
      .addCase(verifyEmailThunk.fulfilled, (state) => {
        state.emailVerificationLoading = false;
        state.emailVerified = true;
      })
      .addCase(verifyEmailThunk.rejected, (state, action) => {
        state.emailVerificationLoading = false;
        state.emailVerificationError = action.payload as string;
      })
      // Password Reset
      .addCase(requestPasswordResetThunk.pending, (state) => {
        state.passwordResetLoading = true;
        state.passwordResetError = null;
      })
      .addCase(requestPasswordResetThunk.fulfilled, (state) => {
        state.passwordResetLoading = false;
        state.passwordResetRequested = true;
      })
      .addCase(requestPasswordResetThunk.rejected, (state, action) => {
        state.passwordResetLoading = false;
        state.passwordResetError = action.payload as string;
      })
      .addCase(verifyResetCodeThunk.pending, (state) => {
        state.passwordResetLoading = true;
        state.passwordResetError = null;
      })
      .addCase(verifyResetCodeThunk.fulfilled, (state) => {
        state.passwordResetLoading = false;
        state.passwordResetVerified = true;
      })
      .addCase(verifyResetCodeThunk.rejected, (state, action) => {
        state.passwordResetLoading = false;
        state.passwordResetError = action.payload as string;
      })
      .addCase(resetPasswordThunk.pending, (state) => {
        state.passwordResetLoading = true;
        state.passwordResetError = null;
      })
      .addCase(resetPasswordThunk.fulfilled, (state) => {
        state.passwordResetLoading = false;
        state.passwordResetDone = true;
      })
      .addCase(resetPasswordThunk.rejected, (state, action) => {
        state.passwordResetLoading = false;
        state.passwordResetError = action.payload as string;
      });
  },
});

export const { logout, clear2FAState, clearEmailVerificationState, clearPasswordResetState } = authSlice.actions;
export default authSlice.reducer; 
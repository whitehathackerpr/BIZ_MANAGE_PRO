import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  fetchProfile,
  updateProfile,
  uploadAvatar,
  UserProfile,
  UserProfileUpdate
} from './profileAPI';

interface ProfileState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  profile: null,
  loading: false,
  error: null,
};

export const getProfile = createAsyncThunk('profile/fetch', async () => {
  return await fetchProfile();
});

export const saveProfile = createAsyncThunk('profile/update', async (data: UserProfileUpdate) => {
  return await updateProfile(data);
});

export const saveAvatar = createAsyncThunk('profile/uploadAvatar', async (formData: FormData) => {
  return await uploadAvatar(formData);
});

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action: PayloadAction<UserProfile>) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch profile';
      })
      .addCase(saveProfile.fulfilled, (state, action: PayloadAction<UserProfile>) => {
        state.profile = action.payload;
      })
      .addCase(saveAvatar.fulfilled, (state, action: PayloadAction<{ avatar: string }>) => {
        if (state.profile) state.profile.avatar = action.payload.avatar;
      });
  },
});

export default profileSlice.reducer; 
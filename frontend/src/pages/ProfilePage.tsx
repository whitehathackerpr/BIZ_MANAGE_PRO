import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import { getProfile, saveProfile, saveAvatar } from '../features/profile';
import { UserProfileUpdate } from '../features/profile/profileAPI';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

const ProfilePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { profile, loading, error } = useSelector((state: RootState) => state.profile);
  const { register, handleSubmit, reset } = useForm<UserProfileUpdate>();

  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) reset(profile);
  }, [profile, reset]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const onSubmit = async (data: UserProfileUpdate) => {
    const result = await dispatch(saveProfile(data));
    if (saveProfile.fulfilled.match(result)) {
      toast.success('Profile updated successfully.');
    } else {
      toast.error('Failed to update profile.');
    }
  };

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const formData = new FormData();
      formData.append('avatar', e.target.files[0]);
      const result = await dispatch(saveAvatar(formData));
      if (saveAvatar.fulfilled.match(result)) {
        toast.success('Avatar updated.');
      } else {
        toast.error('Failed to update avatar.');
      }
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded shadow p-6">
      <h2 className="text-xl font-bold mb-4">Profile</h2>
      {loading && <div>Loading...</div>}
      {profile && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-center gap-4">
            <img
              src={profile.avatar || '/default-avatar.png'}
              alt="Avatar"
              className="w-20 h-20 rounded-full object-cover border"
            />
            <input type="file" accept="image/*" onChange={onAvatarChange} />
          </div>
          <div>
            <label className="block font-semibold mb-1">Name</label>
            <input {...register('name')} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Email</label>
            <input {...register('email')} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Phone</label>
            <input {...register('phone')} className="w-full px-3 py-2 border rounded" />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
        </form>
      )}
    </div>
  );
};

export default ProfilePage; 
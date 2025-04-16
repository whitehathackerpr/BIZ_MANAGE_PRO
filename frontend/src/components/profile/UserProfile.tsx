import React, { useState, useEffect } from 'react';
import { authService } from '../../services/authService';
import { UserData } from '../../types/api/responses/auth';
import { PasswordChangeRequest } from '../../types/api/requests/auth';
import { AxiosError } from 'axios';

const UserProfile: React.FC = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Password change state
  const [passwordData, setPasswordData] = useState<PasswordChangeRequest & { confirmPassword: string }>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Avatar upload state
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<boolean>(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const response = await authService.getCurrentUser();
      setUser(response.user);
      setError(null);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to load user profile data');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setSuccess(response.message || 'Password changed successfully');
      
      // Clear password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        setError(err.response.data.message || 'Failed to change password');
      } else {
        setError('An unexpected error occurred');
      }
      console.error('Password change error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatar(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!avatar) {
      setError('Please select an image to upload');
      return;
    }
    
    setUploadProgress(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await authService.uploadAvatar(avatar);
      setSuccess(response.message || 'Avatar uploaded successfully');
      
      // Refresh user data to get the new avatar URL
      await fetchUserData();
      
      // Clear avatar state
      setAvatar(null);
      setAvatarPreview(null);
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        setError(err.response.data.message || 'Failed to upload avatar');
      } else {
        setError('An unexpected error occurred');
      }
      console.error('Avatar upload error:', err);
    } finally {
      setUploadProgress(false);
    }
  };

  if (loading && !user) {
    return <div className="loading">Loading profile...</div>;
  }

  if (error && !user) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="user-profile">
      <h1>User Profile</h1>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      {user && (
        <div className="profile-content">
          <div className="profile-header">
            <div className="profile-avatar">
              {user.avatar ? (
                <img src={user.avatar} alt={`${user.firstName}'s avatar`} />
              ) : (
                <div className="avatar-placeholder">
                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                </div>
              )}
            </div>
            <div className="profile-info">
              <h2>{user.firstName} {user.lastName}</h2>
              <p className="profile-email">{user.email}</p>
              <p className="profile-role">Role: {user.role}</p>
              <p className="profile-created">Member since: {new Date(user.createdAt).toLocaleDateString()}</p>
              {user.lastLogin && (
                <p className="profile-last-login">Last login: {new Date(user.lastLogin).toLocaleString()}</p>
              )}
            </div>
          </div>
          
          <div className="profile-sections">
            <div className="profile-section">
              <h3>Update Avatar</h3>
              <form onSubmit={handleAvatarSubmit} className="avatar-form">
                <div className="form-group">
                  <label htmlFor="avatar">Select Image</label>
                  <input 
                    type="file" 
                    id="avatar" 
                    name="avatar"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </div>
                
                {avatarPreview && (
                  <div className="avatar-preview">
                    <img src={avatarPreview} alt="Avatar preview" />
                  </div>
                )}
                
                <div className="form-actions">
                  <button type="submit" disabled={uploadProgress || !avatar}>
                    {uploadProgress ? 'Uploading...' : 'Upload Avatar'}
                  </button>
                </div>
              </form>
            </div>
            
            <div className="profile-section">
              <h3>Change Password</h3>
              <form onSubmit={handlePasswordSubmit} className="password-form">
                <div className="form-group">
                  <label htmlFor="currentPassword">Current Password</label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    placeholder="Enter current password"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    placeholder="Enter new password"
                    minLength={8}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    placeholder="Confirm new password"
                  />
                </div>
                
                <div className="form-actions">
                  <button type="submit" disabled={loading}>
                    {loading ? 'Changing Password...' : 'Change Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile; 
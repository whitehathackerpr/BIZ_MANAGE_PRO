/**
 * Authentication API request types
 */

/**
 * Login request payload
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Registration request payload
 */
export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
}

/**
 * Password reset request (initiates reset process)
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * Password update request (completes reset process with token)
 */
export interface PasswordUpdateRequest {
  token: string;
  password: string;
}

/**
 * Refresh token request
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Password change request (for logged in users)
 */
export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

/**
 * Avatar upload request
 */
export interface AvatarUploadRequest {
  file: File;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export interface ResetPasswordData {
    token: string;
    password: string;
}

export interface ChangePasswordData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface ProfileData {
    name: string;
    email: string;
    phone?: string;
    address?: string;
} 
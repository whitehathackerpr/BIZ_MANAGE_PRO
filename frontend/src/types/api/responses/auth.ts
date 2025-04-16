/**
 * Authentication API response types
 */
import { User } from '../../models/user';

/**
 * User data returned from auth endpoints
 */
export interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  avatar?: string;
}

/**
 * Authentication tokens
 */
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

/**
 * Complete authentication response with user data and tokens
 */
export interface AuthResponse {
  user: UserData;
  tokens: TokenResponse;
  message?: string;
}

/**
 * Login response
 */
export type LoginResponse = AuthResponse;

/**
 * Register response
 */
export type RegisterResponse = AuthResponse;

/**
 * Refresh token response
 */
export interface RefreshTokenResponse {
  tokens: TokenResponse;
  message: string;
}

/**
 * Password reset request response
 */
export interface PasswordResetResponse {
  message: string;
}

/**
 * Password update response
 */
export interface PasswordUpdateResponse {
  message: string;
  success: boolean;
}

/**
 * Get current user response
 */
export interface GetCurrentUserResponse {
  user: UserData;
}

/**
 * Logout response
 */
export interface LogoutResponse {
  message: string;
  success: boolean;
}

/**
 * Avatar upload response
 */
export interface AvatarUploadResponse {
  message: string;
  avatarUrl?: string;
}

/**
 * Password change response (for logged in users)
 */
export interface PasswordChangeResponse {
  message: string;
  success: boolean;
} 
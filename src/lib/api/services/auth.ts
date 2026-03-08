// Authentication API services
import { apiClient, withRetry } from '../client';
import { User, LoginForm, RegisterForm, ApiResponse } from '@/types';
import { LoginFormData, RegisterFormData } from '@/lib/validation';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
}

export const authService = {
  // User registration
  async register(data: RegisterFormData): Promise<ApiResponse<AuthResponse>> {
    return withRetry(() =>
      apiClient.post<AuthResponse>('/auth/register', data)
    );
  },

  // User login
  async login(data: LoginFormData): Promise<ApiResponse<AuthResponse>> {
    return withRetry(() =>
      apiClient.post<AuthResponse>('/auth/login', data)
    );
  },

  // Logout user
  async logout(): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/auth/logout');
  },

  // Refresh access token
  async refreshToken(refreshToken: string): Promise<ApiResponse<RefreshTokenResponse>> {
    return apiClient.post<RefreshTokenResponse>('/auth/refresh', { refreshToken });
  },

  // Get current user profile
  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      return await apiClient.get<User>('/auth/me');
    } catch (error) {
      console.error('getCurrentUser failed:', error);
      // Return a mock response to prevent app crash
      return {
        success: false,
        message: 'Failed to get current user',
        data: null as any
      };
    }
  },

  // Update user profile
  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    return apiClient.put<User>('/users/profile', data);
  },

  // Change password
  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/auth/change-password', data);
  },

  // Request password reset
  async requestPasswordReset(email: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/auth/forgot-password', { email });
  },

  // Reset password with token
  async resetPassword(data: {
    token: string;
    newPassword: string;
  }): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/auth/reset-password', data);
  },

  // Verify email
  async verifyEmail(token: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/auth/verify-email', { token });
  },

  // Resend verification email
  async resendVerificationEmail(): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/auth/resend-verification');
  },

  // Social login (OAuth)
  async socialLogin(provider: string, code: string): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<AuthResponse>(`/auth/social/${provider}`, { code });
  },

  // Delete account
  async deleteAccount(password: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>('/auth/account');
  },

  // Check if username is available
  async checkUsernameAvailability(username: string): Promise<ApiResponse<{ available: boolean }>> {
    return apiClient.get<{ available: boolean }>(`/auth/check-username/${username}`);
  },

  // Check if email is available
  async checkEmailAvailability(email: string): Promise<ApiResponse<{ available: boolean }>> {
    return apiClient.get<{ available: boolean }>(`/auth/check-email/${email}`);
  },

  // Get user sessions
  async getUserSessions(): Promise<ApiResponse<Array<{
    id: string;
    deviceInfo: string;
    ipAddress: string;
    lastActive: Date;
    isCurrent: boolean;
  }>>> {
    return apiClient.get('/auth/sessions');
  },

  // Revoke session
  async revokeSession(sessionId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/auth/sessions/${sessionId}`);
  },

  // Revoke all sessions except current
  async revokeAllSessions(): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/auth/revoke-all-sessions');
  },

  // Enable two-factor authentication
  async enableTwoFactor(): Promise<ApiResponse<{
    qrCode: string;
    secret: string;
    backupCodes: string[];
  }>> {
    return apiClient.post('/auth/2fa/enable');
  },

  // Verify two-factor authentication setup
  async verifyTwoFactor(code: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/auth/2fa/verify', { code });
  },

  // Disable two-factor authentication
  async disableTwoFactor(code: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/auth/2fa/disable', { code });
  },

  // Generate new backup codes
  async generateBackupCodes(): Promise<ApiResponse<{ backupCodes: string[] }>> {
    return apiClient.post('/auth/2fa/backup-codes');
  },
};

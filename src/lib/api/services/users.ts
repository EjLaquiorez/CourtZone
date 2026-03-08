import { apiClient, withCache, withRetry } from '../client';
import type { ApiResponse, PaginatedResponse } from '../types';
import type { User } from '@/types';

export const usersService = {
  // Get current user profile
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return withCache(
      'current-user',
      () => apiClient.get<User>('/users/me'),
      5 * 60 * 1000 // 5 minutes cache
    );
  },

  // Get user profile
  async getUserProfile(userId: string): Promise<ApiResponse<User>> {
    return withCache(
      `user-profile-${userId}`,
      () => apiClient.get<User>(`/users/${userId}`),
      5 * 60 * 1000 // 5 minutes cache
    );
  },

  // Update user profile
  async updateUserProfile(userId: string, data: Partial<User>): Promise<ApiResponse<User>> {
    return withRetry(() =>
      apiClient.patch<User>(`/users/${userId}`, data)
    );
  },

  // Get user statistics
  async getUserStats(
    userId: string,
    season?: string,
    timeframe?: 'all' | 'last30' | 'last7'
  ): Promise<ApiResponse<any>> {
    const params: any = {};
    if (season) params.season = season;
    if (timeframe) params.timeframe = timeframe;

    return withCache(
      `user-stats-${userId}-${JSON.stringify(params)}`,
      () => apiClient.get<any>(`/users/${userId}/stats`, params),
      2 * 60 * 1000 // 2 minutes cache
    );
  },

  // Search users
  async searchUsers(
    query: string,
    filters?: {
      position?: string;
      skillLevelMin?: number;
      skillLevelMax?: number;
      city?: string;
      isVerified?: boolean;
    },
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<PaginatedResponse<User>>> {
    const params = { q: query, ...filters, page, limit };
    return apiClient.get<PaginatedResponse<User>>('/users/search', params);
  },

  // Get user's teams
  async getUserTeams(userId: string): Promise<ApiResponse<any[]>> {
    return withCache(
      `user-teams-${userId}`,
      () => apiClient.get<any[]>(`/users/${userId}/teams`),
      5 * 60 * 1000 // 5 minutes cache
    );
  },

  // Get user's games
  async getUserGames(
    userId: string,
    status?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<PaginatedResponse<any>>> {
    const params = { status, page, limit };
    return apiClient.get<PaginatedResponse<any>>(`/users/${userId}/games`, params);
  },

  // Get user's court reservations
  async getUserReservations(
    userId: string,
    status?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<PaginatedResponse<any>>> {
    const params = { status, page, limit };
    return apiClient.get<PaginatedResponse<any>>(`/users/${userId}/reservations`, params);
  },

  // Follow/unfollow user
  async followUser(userId: string): Promise<ApiResponse<void>> {
    return withRetry(() =>
      apiClient.post<void>(`/users/${userId}/follow`)
    );
  },

  async unfollowUser(userId: string): Promise<ApiResponse<void>> {
    return withRetry(() =>
      apiClient.delete<void>(`/users/${userId}/follow`)
    );
  },

  // Get user's followers/following
  async getUserFollowers(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<PaginatedResponse<User>>> {
    const params = { page, limit };
    return apiClient.get<PaginatedResponse<User>>(`/users/${userId}/followers`, params);
  },

  async getUserFollowing(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<PaginatedResponse<User>>> {
    const params = { page, limit };
    return apiClient.get<PaginatedResponse<User>>(`/users/${userId}/following`, params);
  },

  // Upload user avatar
  async uploadAvatar(userId: string, file: File): Promise<ApiResponse<{ avatarUrl: string }>> {
    const formData = new FormData();
    formData.append('avatar', file);

    return withRetry(() =>
      apiClient.post<{ avatarUrl: string }>(`/users/${userId}/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    );
  },

  // Delete user account
  async deleteUser(userId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/users/${userId}`);
  },

  // Get user notifications
  async getUserNotifications(
    userId: string,
    unreadOnly: boolean = false,
    page: number = 1,
    limit: number = 20
  ): Promise<ApiResponse<PaginatedResponse<any>>> {
    const params = { unreadOnly, page, limit };
    return apiClient.get<PaginatedResponse<any>>(`/users/${userId}/notifications`, params);
  },

  // Mark notifications as read
  async markNotificationsRead(userId: string, notificationIds?: string[]): Promise<ApiResponse<void>> {
    const data = notificationIds ? { notificationIds } : {};
    return apiClient.patch<void>(`/users/${userId}/notifications/read`, data);
  },

  // Get user preferences
  async getUserPreferences(userId: string): Promise<ApiResponse<any>> {
    return withCache(
      `user-preferences-${userId}`,
      () => apiClient.get<any>(`/users/${userId}/preferences`),
      10 * 60 * 1000 // 10 minutes cache
    );
  },

  // Update user preferences
  async updateUserPreferences(userId: string, preferences: any): Promise<ApiResponse<any>> {
    return withRetry(() =>
      apiClient.patch<any>(`/users/${userId}/preferences`, preferences)
    );
  },
};

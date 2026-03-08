// Games API services
import { apiClient, withCache, withRetry } from '../client';
import {
  Game,
  GameWithDetails,
  GameInvitation,
  GameForm,
  GameFilters,
  PaginatedResponse,
  ApiResponse
} from '@/types';
import { CreateGameFormData } from '@/lib/validation';

export interface GameStats {
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
  averageScore: number;
  mvpCount: number;
  currentStreak: number;
  bestStreak: number;
}

export interface LiveGameUpdate {
  gameId: string;
  hostScore: number;
  opponentScore: number;
  timeRemaining: number;
  quarter: number;
  status: 'in_progress' | 'halftime' | 'completed';
  lastUpdate: Date;
}

export const gamesService = {
  // Get paginated games list
  async getGames(
    filters?: GameFilters,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<PaginatedResponse<GameWithDetails>>> {
    const params = { ...filters, page, limit };
    return withCache(
      `games-${JSON.stringify(params)}`,
      () => apiClient.get<PaginatedResponse<GameWithDetails>>('/games', params),
      2 * 60 * 1000 // 2 minutes cache
    );
  },

  // Get game by ID
  async getGameById(gameId: string): Promise<ApiResponse<GameWithDetails>> {
    return withCache(
      `game-${gameId}`,
      () => apiClient.get<GameWithDetails>(`/games/${gameId}`),
      1 * 60 * 1000 // 1 minute cache
    );
  },

  // Create new game
  async createGame(data: CreateGameFormData): Promise<ApiResponse<Game>> {
    return withRetry(() =>
      apiClient.post<Game>('/games', data)
    );
  },

  // Update game
  async updateGame(gameId: string, data: Partial<GameForm>): Promise<ApiResponse<Game>> {
    return apiClient.patch<Game>(`/games/${gameId}`, data);
  },

  // Delete game
  async deleteGame(gameId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/games/${gameId}`);
  },

  // Join game
  async joinGame(gameId: string): Promise<ApiResponse<any>> {
    return withRetry(() =>
      apiClient.post<any>(`/games/${gameId}/join`)
    );
  },

  // Leave game
  async leaveGame(gameId: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>(`/games/${gameId}/leave`);
  },

  // Get game participants
  async getGameParticipants(gameId: string): Promise<ApiResponse<any>> {
    return withCache(
      `game-participants-${gameId}`,
      () => apiClient.get<any>(`/games/${gameId}/participants`),
      1 * 60 * 1000 // 1 minute cache
    );
  },

  // Complete game with results
  async completeGame(gameId: string, data: {
    finalScore?: string;
    hostScore?: number;
    opponentScore?: number;
    winnerTeamId?: string;
    playerStats?: Array<{
      userId: string;
      points?: number;
      assists?: number;
      rebounds?: number;
      steals?: number;
      blocks?: number;
      turnovers?: number;
      fouls?: number;
      minutesPlayed?: number;
    }>;
  }): Promise<ApiResponse<Game>> {
    return apiClient.post<Game>(`/games/${gameId}/complete`, data);
  },

  // Start game
  async startGame(gameId: string): Promise<ApiResponse<Game>> {
    return apiClient.post<Game>(`/games/${gameId}/start`);
  },

  // End game
  async endGame(gameId: string, scores: {
    hostScore: number;
    opponentScore: number;
  }): Promise<ApiResponse<Game>> {
    return apiClient.post<Game>(`/games/${gameId}/end`, scores);
  },

  // Cancel game
  async cancelGame(gameId: string, reason?: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>(`/games/${gameId}/cancel`, { reason });
  },

  // Get user's games
  async getUserGames(
    userId: string,
    status?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<PaginatedResponse<GameWithDetails>>> {
    const params = { status, page, limit };
    return apiClient.get<PaginatedResponse<GameWithDetails>>(`/users/${userId}/games`, params);
  },

  // Get team's games
  async getTeamGames(
    teamId: string,
    status?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<PaginatedResponse<GameWithDetails>>> {
    const params = { status, page, limit };
    return apiClient.get<PaginatedResponse<GameWithDetails>>(`/teams/${teamId}/games`, params);
  },

  // Get nearby games
  async getNearbyGames(
    latitude: number,
    longitude: number,
    radius: number = 10,
    filters?: GameFilters
  ): Promise<ApiResponse<GameWithDetails[]>> {
    const params = { latitude, longitude, radius, ...filters };
    return withCache(
      `nearby-games-${JSON.stringify(params)}`,
      () => apiClient.get<GameWithDetails[]>('/games/nearby', params),
      2 * 60 * 1000 // 2 minutes cache
    );
  },

  // Search games
  async searchGames(
    query: string,
    filters?: GameFilters,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<PaginatedResponse<GameWithDetails>>> {
    const params = { q: query, ...filters, page, limit };
    return apiClient.get<PaginatedResponse<GameWithDetails>>('/games/search', params);
  },

  // Get game invitations
  async getGameInvitations(
    status?: 'pending' | 'accepted' | 'declined',
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<PaginatedResponse<GameInvitation>>> {
    const params = { status, page, limit };
    return apiClient.get<PaginatedResponse<GameInvitation>>('/games/invitations', params);
  },

  // Send game invitation
  async sendGameInvitation(
    gameId: string,
    teamId: string,
    message?: string
  ): Promise<ApiResponse<GameInvitation>> {
    return apiClient.post<GameInvitation>(`/games/${gameId}/invite`, { teamId, message });
  },

  // Respond to game invitation
  async respondToInvitation(
    invitationId: string,
    response: 'accept' | 'decline'
  ): Promise<ApiResponse<GameInvitation>> {
    return apiClient.post<GameInvitation>(`/games/invitations/${invitationId}/respond`, { response });
  },

  // Get game statistics
  async getGameStats(gameId: string): Promise<ApiResponse<{
    totalPlayers: number;
    averageRating: number;
    skillLevelDistribution: Record<number, number>;
    teamStats: {
      hostTeam: GameStats;
      opponentTeam: GameStats;
    };
  }>> {
    return apiClient.get(`/games/${gameId}/stats`);
  },

  // Get user game statistics
  async getUserGameStats(userId: string): Promise<ApiResponse<GameStats>> {
    return withCache(
      `user-game-stats-${userId}`,
      () => apiClient.get<GameStats>(`/users/${userId}/game-stats`),
      5 * 60 * 1000 // 5 minutes cache
    );
  },

  // Get live game updates
  async getLiveGameUpdate(gameId: string): Promise<ApiResponse<LiveGameUpdate>> {
    return apiClient.get<LiveGameUpdate>(`/games/${gameId}/live`);
  },

  // Update live game score
  async updateLiveScore(
    gameId: string,
    scores: { hostScore: number; opponentScore: number }
  ): Promise<ApiResponse<LiveGameUpdate>> {
    return apiClient.post<LiveGameUpdate>(`/games/${gameId}/live/score`, scores);
  },

  // Get game history
  async getGameHistory(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<ApiResponse<PaginatedResponse<GameWithDetails>>> {
    const params = { page, limit };
    return apiClient.get<PaginatedResponse<GameWithDetails>>(`/users/${userId}/game-history`, params);
  },

  // Report game result
  async reportGameResult(
    gameId: string,
    result: {
      hostScore: number;
      opponentScore: number;
      mvpPlayerId?: string;
      notes?: string;
    }
  ): Promise<ApiResponse<Game>> {
    return apiClient.post<Game>(`/games/${gameId}/result`, result);
  },
};

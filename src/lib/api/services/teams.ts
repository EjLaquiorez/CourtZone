// Teams API services
import { apiClient, withCache, withRetry } from '../client';
import { 
  Team, 
  TeamWithMembers, 
  TeamMember, 
  TeamForm, 
  TeamFilters,
  PaginatedResponse,
  ApiResponse 
} from '@/types';
import { CreateTeamFormData } from '@/lib/validation';

export interface TeamInvitation {
  id: string;
  teamId: string;
  invitedUserId: string;
  invitedBy: string;
  role: 'member' | 'co_captain';
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  message?: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface TeamStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
  averageScore: number;
  totalPoints: number;
  currentStreak: number;
  bestStreak: number;
  ranking: number;
}

export const teamsService = {
  // Get paginated teams list
  async getTeams(
    filters?: TeamFilters,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<PaginatedResponse<TeamWithMembers>>> {
    const params = { ...filters, page, limit };
    return withCache(
      `teams-${JSON.stringify(params)}`,
      () => apiClient.get<PaginatedResponse<TeamWithMembers>>('/teams', params),
      3 * 60 * 1000 // 3 minutes cache
    );
  },

  // Get team by ID
  async getTeamById(teamId: string): Promise<ApiResponse<TeamWithMembers>> {
    return withCache(
      `team-${teamId}`,
      () => apiClient.get<TeamWithMembers>(`/teams/${teamId}`),
      2 * 60 * 1000 // 2 minutes cache
    );
  },

  // Create new team
  async createTeam(data: CreateTeamFormData): Promise<ApiResponse<Team>> {
    return withRetry(() => 
      apiClient.post<Team>('/teams', data)
    );
  },

  // Update team
  async updateTeam(teamId: string, data: Partial<TeamForm>): Promise<ApiResponse<Team>> {
    return apiClient.patch<Team>(`/teams/${teamId}`, data);
  },

  // Delete team
  async deleteTeam(teamId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/teams/${teamId}`);
  },

  // Join team
  async joinTeam(teamId: string, message?: string): Promise<ApiResponse<TeamMember>> {
    return apiClient.post<TeamMember>(`/teams/${teamId}/join`, { message });
  },

  // Leave team
  async leaveTeam(teamId: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>(`/teams/${teamId}/leave`);
  },

  // Get user's teams
  async getUserTeams(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<PaginatedResponse<TeamWithMembers>>> {
    const params = { page, limit };
    return apiClient.get<PaginatedResponse<TeamWithMembers>>(`/users/${userId}/teams`, params);
  },

  // Get team members
  async getTeamMembers(
    teamId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<ApiResponse<PaginatedResponse<TeamMember>>> {
    const params = { page, limit };
    return withCache(
      `team-members-${teamId}-${page}-${limit}`,
      () => apiClient.get<PaginatedResponse<TeamMember>>(`/teams/${teamId}/members`, params),
      2 * 60 * 1000 // 2 minutes cache
    );
  },

  // Add team member
  async addTeamMember(
    teamId: string,
    userId: string,
    role: 'member' | 'co_captain' = 'member'
  ): Promise<ApiResponse<TeamMember>> {
    return apiClient.post<TeamMember>(`/teams/${teamId}/members`, { userId, role });
  },

  // Update team member
  async updateTeamMember(
    teamId: string,
    memberId: string,
    data: Partial<TeamMember>
  ): Promise<ApiResponse<TeamMember>> {
    return apiClient.patch<TeamMember>(`/teams/${teamId}/members/${memberId}`, data);
  },

  // Remove team member
  async removeTeamMember(teamId: string, memberId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/teams/${teamId}/members/${memberId}`);
  },

  // Search teams
  async searchTeams(
    query: string,
    filters?: TeamFilters,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<PaginatedResponse<TeamWithMembers>>> {
    const params = { q: query, ...filters, page, limit };
    return apiClient.get<PaginatedResponse<TeamWithMembers>>('/teams/search', params);
  },

  // Get nearby teams
  async getNearbyTeams(
    latitude: number,
    longitude: number,
    radius: number = 10,
    filters?: TeamFilters
  ): Promise<ApiResponse<TeamWithMembers[]>> {
    const params = { latitude, longitude, radius, ...filters };
    return withCache(
      `nearby-teams-${JSON.stringify(params)}`,
      () => apiClient.get<TeamWithMembers[]>('/teams/nearby', params),
      3 * 60 * 1000 // 3 minutes cache
    );
  },

  // Get team invitations
  async getTeamInvitations(
    status?: 'pending' | 'accepted' | 'declined',
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<PaginatedResponse<TeamInvitation>>> {
    const params = { status, page, limit };
    return apiClient.get<PaginatedResponse<TeamInvitation>>('/teams/invitations', params);
  },

  // Send team invitation
  async sendTeamInvitation(
    teamId: string,
    userId: string,
    role: 'member' | 'co_captain' = 'member',
    message?: string
  ): Promise<ApiResponse<TeamInvitation>> {
    return apiClient.post<TeamInvitation>(`/teams/${teamId}/invite`, { userId, role, message });
  },

  // Respond to team invitation
  async respondToInvitation(
    invitationId: string,
    response: 'accept' | 'decline'
  ): Promise<ApiResponse<TeamInvitation>> {
    return apiClient.post<TeamInvitation>(`/teams/invitations/${invitationId}/respond`, { response });
  },

  // Get team statistics
  async getTeamStats(teamId: string): Promise<ApiResponse<TeamStats>> {
    return withCache(
      `team-stats-${teamId}`,
      () => apiClient.get<TeamStats>(`/teams/${teamId}/stats`),
      5 * 60 * 1000 // 5 minutes cache
    );
  },

  // Get team leaderboard
  async getTeamLeaderboard(
    filters?: { skillLevel?: number; location?: string },
    page: number = 1,
    limit: number = 20
  ): Promise<ApiResponse<PaginatedResponse<TeamWithMembers & { rank: number; stats: TeamStats }>>> {
    const params = { ...filters, page, limit };
    return withCache(
      `team-leaderboard-${JSON.stringify(params)}`,
      () => apiClient.get(`/teams/leaderboard`, params),
      10 * 60 * 1000 // 10 minutes cache
    );
  },

  // Transfer team ownership
  async transferOwnership(teamId: string, newCaptainId: string): Promise<ApiResponse<Team>> {
    return apiClient.post<Team>(`/teams/${teamId}/transfer-ownership`, { newCaptainId });
  },

  // Set team lineup
  async setTeamLineup(
    teamId: string,
    lineup: { memberId: string; position: string; isStarter: boolean }[]
  ): Promise<ApiResponse<TeamMember[]>> {
    return apiClient.post<TeamMember[]>(`/teams/${teamId}/lineup`, { lineup });
  },

  // Get team lineup
  async getTeamLineup(teamId: string): Promise<ApiResponse<TeamMember[]>> {
    return withCache(
      `team-lineup-${teamId}`,
      () => apiClient.get<TeamMember[]>(`/teams/${teamId}/lineup`),
      2 * 60 * 1000 // 2 minutes cache
    );
  },

  // Upload team logo
  async uploadTeamLogo(teamId: string, file: File): Promise<ApiResponse<{ logoUrl: string }>> {
    const formData = new FormData();
    formData.append('logo', file);
    
    return apiClient.post(`/teams/${teamId}/logo`, formData);
  },

  // Get team achievements
  async getTeamAchievements(teamId: string): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    description: string;
    iconUrl: string;
    earnedAt: Date;
  }>>> {
    return withCache(
      `team-achievements-${teamId}`,
      () => apiClient.get(`/teams/${teamId}/achievements`),
      10 * 60 * 1000 // 10 minutes cache
    );
  },
};

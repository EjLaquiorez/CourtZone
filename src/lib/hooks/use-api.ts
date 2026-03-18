// React Query hooks for API calls
import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import {
  authService,
  gamesService,
  teamsService,
  courtsService,
  ApiError
} from '@/lib/api';
import { usersService } from '@/lib/api/services/users';
import type {
  LoginFormData,
  RegisterFormData,
  CreateGameFormData,
  CreateTeamFormData,
} from '@/lib/validation';
import type {
  User,
  Game,
  Team,
  Court,
  GameWithDetails,
  TeamWithMembers,
  TeamMember,
  TeamHubData,
  TeamInvite,
  TeamActivity,
  PaginatedResponse,
  ApiResponse,
  GameFilters,
  TeamFilters,
  CourtFilters
} from '@/types';

type QueryHookOptions<TData> = Omit<
  UseQueryOptions<TData, ApiError>,
  'queryKey' | 'queryFn'
>;


// Query keys
export const queryKeys = {
  auth: {
    user: ['auth', 'user'] as const,
    sessions: ['auth', 'sessions'] as const,
  },
  games: {
    all: ['games'] as const,
    list: (filters?: GameFilters, page?: number, limit?: number) =>
      ['games', 'list', { filters, page, limit }] as const,
    detail: (id: string) => ['games', 'detail', id] as const,
    nearby: (lat: number, lng: number, radius: number, filters?: GameFilters) =>
      ['games', 'nearby', { lat, lng, radius, filters }] as const,
    userGames: (userId: string, status?: string, page?: number, limit?: number) =>
      ['games', 'user', userId, { status, page, limit }] as const,
    teamGames: (teamId: string, status?: string, page?: number, limit?: number) =>
      ['games', 'team', teamId, { status, page, limit }] as const,
    invitations: (status?: string, page?: number, limit?: number) =>
      ['games', 'invitations', { status, page, limit }] as const,
    stats: (gameId: string) => ['games', 'stats', gameId] as const,
    userStats: (userId: string) => ['games', 'user-stats', userId] as const,
    live: (gameId: string) => ['games', 'live', gameId] as const,
  },
  teams: {
    all: ['teams'] as const,
    list: (filters?: TeamFilters, page?: number, limit?: number) =>
      ['teams', 'list', { filters, page, limit }] as const,
    detail: (id: string) => ['teams', 'detail', id] as const,
    hub: (id: string) => ['teams', 'hub', id] as const,
    nearby: (lat: number, lng: number, radius: number, filters?: TeamFilters) =>
      ['teams', 'nearby', { lat, lng, radius, filters }] as const,
    userTeams: (userId: string, page?: number, limit?: number) =>
      ['teams', 'user', userId, { page, limit }] as const,
    members: (teamId: string, page?: number, limit?: number) =>
      ['teams', 'members', teamId, { page, limit }] as const,
    invitations: (status?: string, page?: number, limit?: number) =>
      ['teams', 'invitations', { status, page, limit }] as const,
    teamInvites: (teamId: string, status?: string) =>
      ['teams', 'team-invites', teamId, { status }] as const,
    activity: (teamId: string, page?: number, limit?: number) =>
      ['teams', 'activity', teamId, { page, limit }] as const,
    stats: (teamId: string) => ['teams', 'stats', teamId] as const,
    leaderboard: (filters?: any, page?: number, limit?: number) =>
      ['teams', 'leaderboard', { filters, page, limit }] as const,
    lineup: (teamId: string) => ['teams', 'lineup', teamId] as const,
  },
  courts: {
    all: ['courts'] as const,
    list: (filters?: CourtFilters, page?: number, limit?: number) =>
      ['courts', 'list', { filters, page, limit }] as const,
    detail: (id: string) => ['courts', 'detail', id] as const,
    nearby: (lat: number, lng: number, radius: number, filters?: CourtFilters) =>
      ['courts', 'nearby', { lat, lng, radius, filters }] as const,
    availability: (courtId: string, startDate: string, endDate: string) =>
      ['courts', 'availability', courtId, { startDate, endDate }] as const,
    reviews: (courtId: string, page?: number, limit?: number) =>
      ['courts', 'reviews', courtId, { page, limit }] as const,
    reservations: (userId: string, status?: string, page?: number, limit?: number) =>
      ['courts', 'reservations', userId, { status, page, limit }] as const,
    stats: (courtId: string) => ['courts', 'stats', courtId] as const,
    popular: (lat?: number, lng?: number, radius?: number, limit?: number) =>
      ['courts', 'popular', { lat, lng, radius, limit }] as const,
  },
} as const;

// Auth hooks
export const useCurrentUser = (options?: UseQueryOptions<ApiResponse<User>, ApiError>) => {
  return useQuery({
    queryKey: queryKeys.auth.user,
    queryFn: () => authService.getCurrentUser(),
    ...options,
  });
};

export const useLogin = (options?: UseMutationOptions<ApiResponse<any>, ApiError, LoginFormData>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginFormData) => authService.login(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user });
    },
    ...options,
  });
};

export const useRegister = (options?: UseMutationOptions<ApiResponse<any>, ApiError, RegisterFormData>) => {
  return useMutation({
    mutationFn: (data: RegisterFormData) => authService.register(data),
    ...options,
  });
};

export const useLogout = (options?: UseMutationOptions<ApiResponse<void>, ApiError, void>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      queryClient.clear();
    },
    ...options,
  });
};

// Games hooks
export const useGames = (
  filters?: GameFilters,
  page: number = 1,
  limit: number = 10,
  options?: UseQueryOptions<ApiResponse<PaginatedResponse<GameWithDetails>>, ApiError>
) => {
  return useQuery({
    queryKey: queryKeys.games.list(filters, page, limit),
    queryFn: () => gamesService.getGames(filters, page, limit),
    ...options,
  });
};

export const useTeamGames = (
  teamId: string,
  status?: string,
  page: number = 1,
  limit: number = 10,
  options?: QueryHookOptions<ApiResponse<PaginatedResponse<GameWithDetails>>>
) => {
  return useQuery({
    queryKey: queryKeys.games.teamGames(teamId, status, page, limit),
    queryFn: () => gamesService.getTeamGames(teamId, status, page, limit),
    enabled: !!teamId,
    ...options,
  });
};

export const useGame = (
  gameId: string,
  options?: UseQueryOptions<ApiResponse<GameWithDetails>, ApiError>
) => {
  return useQuery({
    queryKey: queryKeys.games.detail(gameId),
    queryFn: () => gamesService.getGameById(gameId),
    enabled: !!gameId,
    ...options,
  });
};

export const useCreateGame = (options?: UseMutationOptions<ApiResponse<Game>, ApiError, CreateGameFormData>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGameFormData) => gamesService.createGame(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.games.all });
    },
    ...options,
  });
};

export const useUpdateGame = (options?: UseMutationOptions<ApiResponse<Game>, ApiError, { gameId: string; data: any }>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ gameId, data }) => gamesService.updateGame(gameId, data),
    onSuccess: (_, { gameId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.games.detail(gameId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.games.all });
    },
    ...options,
  });
};

export const useNearbyGames = (
  latitude: number,
  longitude: number,
  radius: number = 10,
  filters?: GameFilters,
  options?: UseQueryOptions<ApiResponse<GameWithDetails[]>, ApiError>
) => {
  return useQuery({
    queryKey: queryKeys.games.nearby(latitude, longitude, radius, filters),
    queryFn: () => gamesService.getNearbyGames(latitude, longitude, radius, filters),
    enabled: !!(latitude && longitude),
    ...options,
  });
};

// Teams hooks
export const useTeams = (
  filters?: TeamFilters,
  page: number = 1,
  limit: number = 10,
  options?: UseQueryOptions<ApiResponse<PaginatedResponse<TeamWithMembers>>, ApiError>
) => {
  return useQuery({
    queryKey: queryKeys.teams.list(filters, page, limit),
    queryFn: () => teamsService.getTeams(filters, page, limit),
    ...options,
  });
};

export const useUserTeams = (
  userId: string,
  page: number = 1,
  limit: number = 10,
  options?: QueryHookOptions<ApiResponse<PaginatedResponse<TeamWithMembers>>>
) => {
  return useQuery({
    queryKey: queryKeys.teams.userTeams(userId, page, limit),
    queryFn: () => teamsService.getUserTeams(userId, page, limit),
    enabled: !!userId,
    ...options,
  });
};

export const useTeam = (
  teamId: string,
  options?: UseQueryOptions<ApiResponse<TeamWithMembers>, ApiError>
) => {
  return useQuery({
    queryKey: queryKeys.teams.detail(teamId),
    queryFn: () => teamsService.getTeamById(teamId),
    enabled: !!teamId,
    ...options,
  });
};

export const useTeamHub = (
  teamId: string,
  options?: QueryHookOptions<ApiResponse<TeamHubData>>
) => {
  return useQuery({
    queryKey: queryKeys.teams.hub(teamId),
    queryFn: () => teamsService.getTeamHub(teamId),
    enabled: !!teamId,
    staleTime: 30 * 1000,
    ...options,
  });
};

export const useTeamInvites = (
  teamId: string,
  status?: 'pending' | 'accepted' | 'expired' | 'declined' | 'cancelled',
  options?: QueryHookOptions<ApiResponse<TeamInvite[]>>
) => {
  return useQuery({
    queryKey: queryKeys.teams.teamInvites(teamId, status),
    queryFn: () => teamsService.getTeamInvites(teamId, status),
    enabled: !!teamId,
    ...options,
  });
};

export const useTeamActivity = (
  teamId: string,
  page: number = 1,
  limit: number = 20,
  options?: QueryHookOptions<ApiResponse<PaginatedResponse<TeamActivity>>>
) => {
  return useQuery({
    queryKey: queryKeys.teams.activity(teamId, page, limit),
    queryFn: () => teamsService.getTeamActivity(teamId, page, limit),
    enabled: !!teamId,
    ...options,
  });
};

export const useLeaveTeam = (options?: UseMutationOptions<ApiResponse<void>, ApiError, string>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (teamId: string) => teamsService.leaveTeam(teamId),
    onSuccess: (_, teamId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.detail(teamId) });
      queryClient.invalidateQueries({ queryKey: ['teams', 'user'] });
    },
    ...options,
  });
};

export const useCreateTeam = (options?: UseMutationOptions<ApiResponse<Team>, ApiError, CreateTeamFormData>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTeamFormData) => teamsService.createTeam(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.all });
      queryClient.invalidateQueries({ queryKey: ['teams', 'user'] });
    },
    ...options,
  });
};

export const useUpdateTeam = (
  options?: UseMutationOptions<ApiResponse<Team>, ApiError, { teamId: string; data: Partial<Team> }>
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, data }) => teamsService.updateTeam(teamId, data),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.hub(teamId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.detail(teamId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.activity(teamId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.all });
      queryClient.invalidateQueries({ queryKey: ['teams', 'user'] });
    },
    ...options,
  });
};

export const useJoinTeam = (options?: UseMutationOptions<any, ApiError, string>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (teamId: string) => teamsService.joinTeam(teamId),
    onSuccess: (_, teamId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.detail(teamId) });
    },
    ...options,
  });
};

export const useSendTeamInvite = (
  options?: UseMutationOptions<ApiResponse<TeamInvite>, ApiError, { teamId: string; username: string }>
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, username }) => teamsService.sendTeamInviteByUsername(teamId, username),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.hub(teamId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.teamInvites(teamId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.activity(teamId) });
    },
    ...options,
  });
};

export const useUpdateTeamInviteStatus = (
  options?: UseMutationOptions<ApiResponse<TeamInvite>, ApiError, { teamId: string; inviteId: string; status: 'accepted' | 'declined' | 'cancelled' | 'expired' }>
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, inviteId, status }) =>
      teamsService.updateTeamInviteStatus(teamId, inviteId, status),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.hub(teamId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.teamInvites(teamId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.activity(teamId) });
      queryClient.invalidateQueries({ queryKey: ['teams', 'user'] });
    },
    ...options,
  });
};

export const useUpdateTeamMemberRole = (
  options?: UseMutationOptions<ApiResponse<TeamMember>, ApiError, { teamId: string; memberId: string; role: 'co_captain' | 'member' }>
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, memberId, role }) => teamsService.updateMemberRole(teamId, memberId, role),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.hub(teamId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.detail(teamId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.activity(teamId) });
    },
    ...options,
  });
};

export const useRemoveTeamMember = (
  options?: UseMutationOptions<ApiResponse<void>, ApiError, { teamId: string; memberId: string }>
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, memberId }) => teamsService.removeMember(teamId, memberId),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.hub(teamId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.detail(teamId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.activity(teamId) });
    },
    ...options,
  });
};

export const useTransferTeamCaptain = (
  options?: UseMutationOptions<ApiResponse<{ teamId: string; captainId: string }>, ApiError, { teamId: string; newCaptainUserId: string }>
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, newCaptainUserId }) => teamsService.transferCaptain(teamId, newCaptainUserId),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.hub(teamId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.detail(teamId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.activity(teamId) });
      queryClient.invalidateQueries({ queryKey: ['teams', 'user'] });
    },
    ...options,
  });
};

// Courts hooks
export const useCourts = (
  filters?: CourtFilters,
  page: number = 1,
  limit: number = 10,
  options?: UseQueryOptions<ApiResponse<PaginatedResponse<Court>>, ApiError>
) => {
  return useQuery({
    queryKey: queryKeys.courts.list(filters, page, limit),
    queryFn: () => courtsService.getCourts(filters, page, limit),
    ...options,
  });
};

// Game participant management hooks
export const useJoinGame = (options?: UseMutationOptions<any, ApiError, string>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (gameId: string) => gamesService.joinGame(gameId),
    onSuccess: (data, gameId) => {
      // Invalidate game details and participants
      queryClient.invalidateQueries({ queryKey: queryKeys.games.detail(gameId) });
      queryClient.invalidateQueries({ queryKey: ['games', 'participants', gameId] });
      queryClient.invalidateQueries({ queryKey: queryKeys.games.all });
    },
    ...options,
  });
};

export const useLeaveGame = (options?: UseMutationOptions<any, ApiError, string>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (gameId: string) => gamesService.leaveGame(gameId),
    onSuccess: (data, gameId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.games.detail(gameId) });
      queryClient.invalidateQueries({ queryKey: ['games', 'participants', gameId] });
      queryClient.invalidateQueries({ queryKey: queryKeys.games.all });
    },
    ...options,
  });
};

export const useGameParticipants = (
  gameId: string,
  options?: UseQueryOptions<any, ApiError>
) => {
  return useQuery({
    queryKey: ['games', 'participants', gameId],
    queryFn: () => gamesService.getGameParticipants(gameId),
    enabled: !!gameId,
    ...options,
  });
};

export const useCompleteGame = (options?: UseMutationOptions<any, ApiError, { gameId: string; data: any }>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ gameId, data }) => gamesService.completeGame(gameId, data),
    onSuccess: (result, { gameId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.games.detail(gameId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.games.all });
      // Invalidate user stats
      queryClient.invalidateQueries({ queryKey: ['users', 'stats'] });
    },
    ...options,
  });
};

// Court booking hooks
export const useCourtAvailability = (
  courtId: string,
  date?: string,
  startDate?: string,
  endDate?: string,
  options?: UseQueryOptions<any, ApiError>
) => {
  return useQuery({
    queryKey: ['courts', 'availability', courtId, { date, startDate, endDate }],
    queryFn: () => courtsService.getCourtAvailability(courtId, date, startDate, endDate),
    enabled: !!courtId,
    ...options,
  });
};

export const useBookCourt = (options?: UseMutationOptions<any, ApiError, { courtId: string; data: any }>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courtId, data }) => courtsService.bookCourt(courtId, data),
    onSuccess: (result, { courtId }) => {
      queryClient.invalidateQueries({ queryKey: ['courts', 'availability', courtId] });
      queryClient.invalidateQueries({ queryKey: ['users', 'reservations'] });
    },
    ...options,
  });
};

export const useCourt = (
  courtId: string,
  options?: UseQueryOptions<ApiResponse<Court>, ApiError>
) => {
  return useQuery({
    queryKey: queryKeys.courts.detail(courtId),
    queryFn: () => courtsService.getCourtById(courtId),
    enabled: !!courtId,
    ...options,
  });
};

export const useNearbyCourts = (
  latitude: number,
  longitude: number,
  radius: number = 10,
  filters?: CourtFilters,
  options?: UseQueryOptions<ApiResponse<Court[]>, ApiError>
) => {
  return useQuery({
    queryKey: queryKeys.courts.nearby(latitude, longitude, radius, filters),
    queryFn: () => courtsService.getNearbyCourts(latitude, longitude, radius, filters),
    enabled: !!(latitude && longitude),
    ...options,
  });
};

// User statistics hooks
export const useUserStats = (
  userId: string,
  season?: string,
  timeframe?: 'all' | 'last30' | 'last7',
  options?: UseQueryOptions<any, ApiError>
) => {
  return useQuery({
    queryKey: ['users', 'stats', userId, { season, timeframe }],
    queryFn: () => usersService.getUserStats(userId, season, timeframe),
    enabled: !!userId,
    ...options,
  });
};

export const useUserProfile = (
  userId: string,
  options?: UseQueryOptions<ApiResponse<User>, ApiError>
) => {
  return useQuery({
    queryKey: ['users', 'profile', userId],
    queryFn: () => usersService.getUserProfile(userId),
    enabled: !!userId,
    ...options,
  });
};

export const useUpdateUserProfile = (options?: UseMutationOptions<ApiResponse<User>, ApiError, { userId: string; data: Partial<User> }>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }) => usersService.updateUserProfile(userId, data),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['users', 'profile', userId] });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user });
    },
    ...options,
  });
};

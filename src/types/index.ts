// Basketball Position Types
export type Position = 'PG' | 'SG' | 'SF' | 'PF' | 'C';

export const POSITIONS = {
  PG: 'Point Guard',
  SG: 'Shooting Guard',
  SF: 'Small Forward',
  PF: 'Power Forward',
  C: 'Center'
} as const;

// User Types
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  position?: Position;
  skillLevel: number; // 1-10 scale
  rating: number;
  latitude?: number;
  longitude?: number;
  locationLat?: number;
  locationLng?: number;
  city?: string;
  maxDistance: number;
  isVerified: boolean;
  profileComplete?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserStats {
  userId: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  mvpCount: number;
  currentStreak: number;
  bestStreak: number;
  totalPoints: number;
  totalAssists: number;
  totalRebounds: number;
  updatedAt: Date;
}

export interface UserProfile extends User {
  stats?: UserStats;
  achievements?: Achievement[];
}

// Team Types
export interface Team {
  id: string;
  name: string;
  logoUrl?: string;
  captainId: string;
  maxSize: number;
  minSkillLevel: number;
  maxSkillLevel: number;
  description?: string;
  isPublic: boolean;
  rating: number;
  gamesPlayed: number;
  wins: number;
  createdAt: Date;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: 'captain' | 'co_captain' | 'member';
  position?: Position;
  isStarter: boolean;
  joinedAt: Date;
  user?: User;
}

export interface TeamWithMembers extends Team {
  captain: User;
  members: TeamMember[];
  memberCount: number;
}

export interface TeamActivity {
  id: string;
  teamId: string;
  userId?: string;
  type:
    | 'team_created'
    | 'member_joined'
    | 'member_left'
    | 'member_removed'
    | 'member_promoted'
    | 'captain_transferred'
    | 'game_scheduled'
    | 'game_result'
    | 'invite_sent'
    | 'invite_accepted'
    | 'team_updated';
  description: string;
  createdAt: Date | string;
  user?: Pick<User, 'id' | 'username' | 'avatar'>;
}

export interface TeamInvite {
  id: string;
  teamId: string;
  invitedUserId: string;
  invitedById: string;
  status: 'pending' | 'accepted' | 'expired' | 'declined' | 'cancelled';
  inviteCode: string;
  expiresAt: Date | string;
  createdAt: Date | string;
  invitedUser?: Pick<User, 'id' | 'username' | 'avatar' | 'rating' | 'skillLevel'>;
  invitedBy?: Pick<User, 'id' | 'username' | 'avatar'>;
}

export interface TeamHubStats {
  currentMembers: number;
  averageSkillLevel: number;
  teamRating: number;
  winRecord: string;
  winRate: number;
  totalGamesPlayed: number;
  averagePointsScored: number;
  averagePointsAllowed: number;
}

export interface TeamHubData {
  team: TeamWithMembers;
  role: 'captain' | 'co_captain' | 'member';
  stats: TeamHubStats;
  upcomingGames: GameWithDetails[];
  recentResults: GameWithDetails[];
  activity: TeamActivity[];
  pendingInvites: TeamInvite[];
}

// Court Types
export interface Court {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  courtType: 'indoor' | 'outdoor';
  surfaceType?: string;
  hasLighting: boolean;
  hasParking: boolean;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  createdBy?: string | User;
  hourlyRate?: number | null;
  isBookable?: boolean;
  distance?: number;
  createdAt: Date;
  photos?: string[];
  amenities?: string[];
}

// Game Types
export type GameType = 'pickup' | 'scrimmage' | 'practice' | 'tournament' | 'casual' | 'competitive';
export type GameStatus =
  | 'scheduled'
  | 'open'
  | 'matched'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface Game {
  id: string;
  title?: string;
  description?: string;
  organizerId?: string;
  hostTeamId?: string;
  opponentTeamId?: string;
  courtId: string;
  scheduledAt?: Date | string;
  scheduledTime?: Date | string;
  duration?: number;
  durationMinutes?: number;
  gameType: GameType;
  status: GameStatus;
  minSkillLevel?: number;
  maxSkillLevel?: number;
  skillLevelMin?: number;
  skillLevelMax?: number;
  maxPlayers?: number;
  currentPlayers?: number;
  participantCount?: number;
  spotsLeft?: number;
  maxDistance?: number;
  winnerTeamId?: string;
  finalScore?: string;
  hostScore?: number;
  opponentScore?: number;
  hostRatingChange?: number;
  opponentRatingChange?: number;
  organizer?: User;
  court?: Court;
  hostTeam?: Team;
  opponentTeam?: Team;
  participants?: TeamMember[];
  createdAt: Date;
  updatedAt?: Date;
}

export interface GameWithDetails extends Game {
  hostTeam?: Team;
  opponentTeam?: Team;
  court: Court;
  organizer?: User;
}

export interface GameInvitation {
  id: string;
  gameId: string;
  invitedTeamId: string;
  invitedBy: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  invitationCode: string;
  expiresAt: Date;
  createdAt: Date;
  game?: Game;
  invitedTeam?: Team;
  inviter?: User;
}

// Achievement Types
export interface Achievement {
  id: string;
  name: string;
  description: string;
  iconUrl?: string;
  badgeType: 'bronze' | 'silver' | 'gold' | 'platinum';
  requirements: Record<string, any>;
  createdAt: Date;
}

export interface UserAchievement {
  userId: string;
  achievementId: string;
  earnedAt: Date;
  achievement?: Achievement;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  position?: Position;
  skillLevel: number;
  city?: string;
}

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  position?: Position;
  skillLevel: number;
  city?: string;
}

export interface TeamForm {
  name: string;
  description?: string;
  maxSize: number;
  minSkillLevel: number;
  maxSkillLevel: number;
  isPublic: boolean;
}

export interface GameForm {
  title: string;
  courtId: string;
  scheduledAt: string;
  duration: number;
  maxPlayers: number;
  gameType: GameType;
  skillLevel: {
    min: number;
    max: number;
  };
  isPrivate?: boolean;
  description?: string;
}

// Component Props Types
export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: number;
    label?: string;
  };
  animated?: boolean;
  glowColor?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
}

export interface GameButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'rounded' | 'hexagonal' | 'sharp';
  glow?: boolean;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export interface PlayerCardProps {
  player: User;
  variant?: 'compact' | 'detailed' | 'lineup';
  interactive?: boolean;
  selected?: boolean;
  onSelect?: (playerId: string) => void;
  showStats?: boolean;
}

// Location Types
export interface Location {
  lat: number;
  lng: number;
}

export interface LocationWithAddress extends Location {
  address: string;
  city?: string;
  state?: string;
  country?: string;
}

// Filter Types
export interface CourtFilters {
  courtType?: 'indoor' | 'outdoor';
  hasLighting?: boolean;
  hasParking?: boolean;
  maxDistance?: number;
  minRating?: number;
}

export interface GameFilters {
  gameType?: GameType;
  status?: GameStatus;
  skillRange?: [number, number];
  dateRange?: [Date, Date];
  maxDistance?: number;
}

export interface TeamFilters {
  isPublic?: boolean;
  skillRange?: [number, number];
  hasOpenings?: boolean;
  maxDistance?: number;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  /**
   * Backward-compatible notification event type.
   * Keep existing values to avoid breaking server payloads, but allow richer app events.
   */
  type:
    | 'game_invite'
    | 'team_invite'
    | 'game_result'
    | 'achievement'
    | 'system'
    | 'game_alert'
    | 'game_starting'
    | 'game_schedule_change'
    | 'game_cancelled'
    | 'team_activity'
    | 'team_roster_update'
    | 'message'
    | 'court_activity'
    | 'court_availability'
    | 'milestone';
  /**
   * High-level category used for filters and grouping in UI.
   * If omitted, UI derives it from `type`.
   */
  category?: 'games' | 'team' | 'messages' | 'courts' | 'achievements' | 'system';
  /**
   * Importance level used for subtle accent cues (not loud styling).
   * If omitted, UI derives from `type` and/or `data`.
   */
  priority?: 'high' | 'medium' | 'low';
  /**
   * Optional deep link (route) for navigation.
   * Prefer absolute app paths like `/games/123` or `/teams/abc`.
   */
  deepLink?: string;
  /**
   * Optional source metadata (avatar/icon rendering).
   */
  source?: {
    type: 'team' | 'user' | 'court' | 'system';
    id?: string;
    name?: string;
    avatarUrl?: string;
  };
  /**
   * Optional grouping key (e.g., "team:123:member_joined") and count.
   * UI can also compute grouping without server support.
   */
  groupKey?: string;
  groupCount?: number;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Loading States
export interface LoadingState {
  isLoading: boolean;
  error?: AppError | null;
}

// Basketball-specific constants
export const SKILL_LEVELS = [
  { value: 1, label: 'Beginner' },
  { value: 2, label: 'Novice' },
  { value: 3, label: 'Recreational' },
  { value: 4, label: 'Intermediate' },
  { value: 5, label: 'Intermediate+' },
  { value: 6, label: 'Advanced' },
  { value: 7, label: 'Competitive' },
  { value: 8, label: 'Elite' },
  { value: 9, label: 'Professional' },
  { value: 10, label: 'All-Star' }
] as const;

export const GAME_DURATIONS = [
  { value: 60, label: '1 Hour' },
  { value: 90, label: '1.5 Hours' },
  { value: 120, label: '2 Hours' },
  { value: 150, label: '2.5 Hours' },
  { value: 180, label: '3 Hours' }
] as const;

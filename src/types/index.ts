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
  locationLat?: number;
  locationLng?: number;
  city?: string;
  maxDistance: number;
  isVerified: boolean;
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
  createdBy?: string;
  createdAt: Date;
  photos?: string[];
  amenities?: string[];
}

// Game Types
export type GameType = 'casual' | 'competitive' | 'tournament' | 'pickup';
export type GameStatus = 'open' | 'matched' | 'in_progress' | 'completed' | 'cancelled';

export interface Game {
  id: string;
  hostTeamId: string;
  opponentTeamId?: string;
  courtId: string;
  scheduledTime: Date;
  durationMinutes: number;
  gameType: GameType;
  status: GameStatus;
  minSkillLevel?: number;
  maxSkillLevel?: number;
  maxDistance?: number;
  winnerTeamId?: string;
  hostScore?: number;
  opponentScore?: number;
  createdAt: Date;
}

export interface GameWithDetails extends Game {
  hostTeam: Team;
  opponentTeam?: Team;
  court: Court;
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
  courtId: string;
  scheduledTime: Date;
  durationMinutes: number;
  gameType: GameType;
  minSkillLevel?: number;
  maxSkillLevel?: number;
  maxDistance?: number;
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
  type: 'game_invite' | 'team_invite' | 'game_result' | 'achievement' | 'system';
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

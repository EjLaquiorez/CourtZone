// API services exports
export * from './client';
export * from './services/auth';
export * from './services/games';
export * from './services/teams';
export * from './services/courts';

// Re-export all services for convenience
export { authService } from './services/auth';
export { gamesService } from './services/games';
export { teamsService } from './services/teams';
export { courtsService } from './services/courts';
export { usersService } from './services/users';

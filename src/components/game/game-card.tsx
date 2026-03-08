'use client';

import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Star, 
  Trophy,
  UserPlus,
  MessageCircle,
  Share2,
  Edit3,
  X,
  Check,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { GameButton } from '@/components/ui/game-button';
import { formatDate, formatTime } from '@/lib/utils';
import { Game, GameStatus } from '@/types';

interface GameCardProps {
  game: Game;
  variant?: 'compact' | 'detailed' | 'dashboard';
  userRole?: 'organizer' | 'participant' | 'invited' | 'none';
  showActions?: boolean;
  onJoin?: () => void;
  onLeave?: () => void;
  onEdit?: () => void;
  onCancel?: () => void;
  onViewDetails?: () => void;
  onShare?: () => void;
  className?: string;
}

export function GameCard({
  game,
  variant = 'detailed',
  userRole = 'none',
  showActions = true,
  onJoin,
  onLeave,
  onEdit,
  onCancel,
  onViewDetails,
  onShare,
  className
}: GameCardProps) {
  const getStatusColor = (status: GameStatus) => {
    switch (status) {
      case 'scheduled': return 'text-blue-400 bg-blue-500/20';
      case 'in_progress': return 'text-court-400 bg-court-500/20';
      case 'completed': return 'text-gray-400 bg-gray-500/20';
      case 'cancelled': return 'text-red-400 bg-red-500/20';
      default: return 'text-primary-400 bg-primary-500/20';
    }
  };

  const getStatusIcon = (status: GameStatus) => {
    switch (status) {
      case 'scheduled': return <Calendar className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4" />;
      case 'completed': return <Trophy className="w-4 h-4" />;
      case 'cancelled': return <X className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const getGameTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'pickup': 'Pickup Game',
      'scrimmage': 'Scrimmage',
      'tournament': 'Tournament',
      'practice': 'Practice',
      'league': 'League Game'
    };
    return types[type] || type;
  };

  const spotsRemaining = game.maxPlayers - game.currentPlayers;
  const isGameFull = spotsRemaining <= 0;
  const isGameSoon = new Date(game.scheduledAt).getTime() - Date.now() < 2 * 60 * 60 * 1000; // 2 hours

  if (variant === 'compact') {
    return (
      <motion.div
        className={cn(
          'bg-gradient-to-r from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-lg p-4 border border-primary-400/20',
          'hover:border-primary-400/40 transition-all duration-300',
          className
        )}
        whileHover={{ y: -2 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Game Type Icon */}
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
              <span className="text-xl">🏀</span>
            </div>

            {/* Game Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-bold text-primary-100 truncate">{game.title}</h3>
                <span className={cn('px-2 py-1 rounded-full text-xs font-medium', getStatusColor(game.status))}>
                  {game.status.replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-primary-300">
                <span className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatTime(game.scheduledAt)}
                </span>
                <span className="flex items-center">
                  <Users className="w-3 h-3 mr-1" />
                  {game.currentPlayers}/{game.maxPlayers}
                </span>
                <span className="flex items-center">
                  <MapPin className="w-3 h-3 mr-1" />
                  {game.court.name}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          {showActions && (
            <div className="flex items-center space-x-2">
              {userRole === 'none' && !isGameFull && game.status === 'scheduled' && (
                <GameButton variant="primary" size="sm" onClick={onJoin}>
                  Join
                </GameButton>
              )}
              {userRole === 'organizer' && (
                <GameButton variant="secondary" size="sm" onClick={onEdit}>
                  <Edit3 className="w-4 h-4" />
                </GameButton>
              )}
              <GameButton variant="ghost" size="sm" onClick={onViewDetails}>
                View
              </GameButton>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  if (variant === 'dashboard') {
    return (
      <motion.div
        className={cn(
          'bg-gradient-to-br from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-xl p-6 border border-primary-400/20',
          'hover:border-primary-400/40 transition-all duration-300',
          className
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center basketball-glow">
              <span className="text-2xl">🏀</span>
            </div>
            <div>
              <h3 className="text-xl font-display font-bold text-white">{game.title}</h3>
              <p className="text-primary-300">{getGameTypeLabel(game.gameType)}</p>
            </div>
          </div>

          <div className={cn('px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1', getStatusColor(game.status))}>
            {getStatusIcon(game.status)}
            <span>{game.status.replace('_', ' ')}</span>
          </div>
        </div>

        {/* Game Details */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2 text-primary-200">
            <Calendar className="w-4 h-4 text-primary-400" />
            <span>{formatDate(game.scheduledAt)}</span>
          </div>
          <div className="flex items-center space-x-2 text-primary-200">
            <Clock className="w-4 h-4 text-primary-400" />
            <span>{formatTime(game.scheduledAt)}</span>
          </div>
          <div className="flex items-center space-x-2 text-primary-200">
            <MapPin className="w-4 h-4 text-primary-400" />
            <span>{game.court.name}</span>
          </div>
          <div className="flex items-center space-x-2 text-primary-200">
            <Users className="w-4 h-4 text-primary-400" />
            <span>{game.currentPlayers}/{game.maxPlayers} players</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-primary-300">Players</span>
            <span className="text-primary-300">{spotsRemaining} spots left</span>
          </div>
          <div className="w-full bg-dark-200 rounded-full h-2">
            <motion.div
              className={cn(
                'h-2 rounded-full transition-all duration-500',
                isGameFull ? 'bg-court-500' : 'bg-primary-500'
              )}
              style={{ width: `${(game.currentPlayers / game.maxPlayers) * 100}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${(game.currentPlayers / game.maxPlayers) * 100}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center space-x-2">
            {userRole === 'none' && !isGameFull && game.status === 'scheduled' && (
              <GameButton variant="primary" size="sm" onClick={onJoin} className="flex-1">
                Join Game
              </GameButton>
            )}
            {userRole === 'organizer' && (
              <GameButton variant="secondary" size="sm" onClick={onEdit} className="flex-1">
                Manage
              </GameButton>
            )}
            <GameButton variant="ghost" size="sm" onClick={onViewDetails}>
              Details
            </GameButton>
          </div>
        )}
      </motion.div>
    );
  }

  // Default: detailed variant
  return (
    <motion.div
      className={cn(
        'bg-gradient-to-br from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-xl p-6 border border-primary-400/20',
        'hover:border-primary-400/40 transition-all duration-300 relative overflow-hidden',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 text-6xl opacity-5">🏀</div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-4">
          {/* Game Type Icon */}
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center basketball-glow">
              <span className="text-2xl">🏀</span>
            </div>
            {/* Urgency indicator */}
            {isGameSoon && game.status === 'scheduled' && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                <AlertCircle className="w-3 h-3 text-white" />
              </div>
            )}
          </div>

          {/* Game Info */}
          <div>
            <h3 className="text-xl font-display font-bold text-white mb-1">{game.title}</h3>
            <div className="flex items-center space-x-3 text-sm text-primary-300">
              <span className="font-medium text-primary-200">{getGameTypeLabel(game.gameType)}</span>
              <span>•</span>
              <span>Skill Level: {game.skillLevel.min}-{game.skillLevel.max}</span>
              {game.isPrivate && (
                <>
                  <span>•</span>
                  <span className="text-yellow-400">Private</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Status badge */}
        <div className={cn('px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1', getStatusColor(game.status))}>
          {getStatusIcon(game.status)}
          <span>{game.status.replace('_', ' ')}</span>
        </div>
      </div>

      {/* Game Details Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-dark-200/50 rounded-lg">
          <Calendar className="w-5 h-5 text-primary-400 mx-auto mb-1" />
          <p className="text-sm font-medium text-primary-100">{formatDate(game.scheduledAt)}</p>
          <p className="text-xs text-primary-300">Date</p>
        </div>
        
        <div className="text-center p-3 bg-dark-200/50 rounded-lg">
          <Clock className="w-5 h-5 text-primary-400 mx-auto mb-1" />
          <p className="text-sm font-medium text-primary-100">{formatTime(game.scheduledAt)}</p>
          <p className="text-xs text-primary-300">Time</p>
        </div>

        <div className="text-center p-3 bg-dark-200/50 rounded-lg">
          <Users className="w-5 h-5 text-primary-400 mx-auto mb-1" />
          <p className="text-sm font-medium text-primary-100">{game.currentPlayers}/{game.maxPlayers}</p>
          <p className="text-xs text-primary-300">Players</p>
        </div>

        <div className="text-center p-3 bg-dark-200/50 rounded-lg">
          <Star className="w-5 h-5 text-primary-400 mx-auto mb-1" />
          <p className="text-sm font-medium text-primary-100">{game.skillLevel.min}-{game.skillLevel.max}</p>
          <p className="text-xs text-primary-300">Skill Level</p>
        </div>
      </div>

      {/* Court Information */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <MapPin className="w-5 h-5 text-primary-400" />
          <h4 className="text-lg font-medium text-primary-200">Location</h4>
        </div>
        <div className="bg-dark-200/50 rounded-lg p-4">
          <p className="font-medium text-primary-100">{game.court.name}</p>
          <p className="text-sm text-primary-300">{game.court.address}</p>
          <div className="flex items-center space-x-4 mt-2 text-xs text-primary-300">
            <span className="flex items-center">
              <span className="mr-1">{game.court.courtType === 'indoor' ? '🏢' : '🌳'}</span>
              {game.court.courtType === 'indoor' ? 'Indoor' : 'Outdoor'}
            </span>
            {game.court.hasLighting && (
              <span className="flex items-center">
                <span className="mr-1">💡</span>
                Lighting
              </span>
            )}
            {game.court.hasParking && (
              <span className="flex items-center">
                <span className="mr-1">🚗</span>
                Parking
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {game.description && (
        <div className="mb-6">
          <p className="text-primary-200 text-sm">{game.description}</p>
        </div>
      )}

      {/* Player Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-primary-200">Players Joined</span>
          <span className="text-sm text-primary-300">
            {spotsRemaining > 0 ? `${spotsRemaining} spots left` : 'Game Full'}
          </span>
        </div>
        <div className="w-full bg-dark-200 rounded-full h-3">
          <motion.div
            className={cn(
              'h-3 rounded-full transition-all duration-500',
              isGameFull ? 'bg-court-500' : 
              game.currentPlayers / game.maxPlayers > 0.8 ? 'bg-yellow-500' : 'bg-primary-500'
            )}
            style={{ width: `${(game.currentPlayers / game.maxPlayers) * 100}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${(game.currentPlayers / game.maxPlayers) * 100}%` }}
          />
        </div>
      </div>

      {/* Organizer Info */}
      <div className="mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {game.organizer.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-primary-200">Organized by {game.organizer.username}</p>
            <p className="text-xs text-primary-300">Rating: {game.organizer.rating}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex items-center justify-between pt-4 border-t border-primary-400/20">
          <div className="flex items-center space-x-2">
            {userRole === 'none' && !isGameFull && game.status === 'scheduled' && (
              <GameButton variant="primary" size="sm" onClick={onJoin} icon={<UserPlus className="w-4 h-4" />}>
                Join Game
              </GameButton>
            )}
            {userRole === 'participant' && game.status === 'scheduled' && (
              <GameButton variant="ghost" size="sm" onClick={onLeave}>
                Leave Game
              </GameButton>
            )}
            {userRole === 'organizer' && (
              <>
                <GameButton variant="secondary" size="sm" onClick={onEdit} icon={<Edit3 className="w-4 h-4" />}>
                  Edit
                </GameButton>
                {game.status === 'scheduled' && (
                  <GameButton variant="ghost" size="sm" onClick={onCancel} icon={<X className="w-4 h-4" />}>
                    Cancel
                  </GameButton>
                )}
              </>
            )}
            <GameButton variant="ghost" size="sm" onClick={onShare} icon={<Share2 className="w-4 h-4" />}>
              Share
            </GameButton>
          </div>

          <GameButton variant="secondary" size="sm" onClick={onViewDetails}>
            View Details
          </GameButton>
        </div>
      )}

      {/* Warning for game starting soon */}
      {isGameSoon && game.status === 'scheduled' && (
        <motion.div
          className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center space-x-2 text-yellow-400">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Game starts soon! Make sure you're ready.</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

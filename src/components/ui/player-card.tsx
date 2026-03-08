'use client';

import { motion } from 'framer-motion';
import { MapPin, Star, Trophy, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PlayerSkillRating } from './skill-rating';
import { GameButton } from './game-button';
import { User, PlayerCardProps } from '@/types';
import { getPositionName } from '@/lib/utils';

export function PlayerCard({
  player,
  variant = 'detailed',
  interactive = false,
  selected = false,
  onSelect,
  showStats = false,
  className
}: PlayerCardProps & { className?: string }) {
  const handleClick = () => {
    if (interactive && onSelect) {
      onSelect(player.id);
    }
  };

  if (variant === 'compact') {
    return (
      <motion.div
        className={cn(
          'flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200',
          interactive ? 'cursor-pointer hover:scale-102' : '',
          selected
            ? 'border-primary-500 bg-primary-500/10'
            : 'border-primary-400/20 bg-dark-300/50',
          className
        )}
        onClick={handleClick}
        whileHover={interactive ? { scale: 1.02 } : {}}
        whileTap={interactive ? { scale: 0.98 } : {}}
      >
        {/* Avatar */}
        <div className="relative">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
            {player.avatar ? (
              <img
                src={player.avatar}
                alt={player.username || 'User'}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              (player.username || 'U').charAt(0).toUpperCase()
            )}
          </div>
          {/* Online indicator */}
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-court-500 border-2 border-dark-300 rounded-full" />
        </div>

        {/* Player info */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-primary-100 truncate">{player.username}</p>
          <div className="flex items-center space-x-2 text-sm text-primary-300">
            {player.position && (
              <span>{player.position}</span>
            )}
            <span>•</span>
            <span>Rating: {player.rating}</span>
          </div>
        </div>

        {/* Skill rating */}
        <PlayerSkillRating level={player.skillLevel} />
      </motion.div>
    );
  }

  if (variant === 'lineup') {
    return (
      <motion.div
        className={cn(
          'relative p-4 rounded-lg border-2 border-dashed transition-all duration-200',
          interactive ? 'cursor-pointer' : '',
          selected
            ? 'border-primary-500 bg-primary-500/10'
            : 'border-primary-400/30 bg-dark-300/30 hover:border-primary-400/50',
          className
        )}
        onClick={handleClick}
        whileHover={interactive ? { scale: 1.05 } : {}}
        whileTap={interactive ? { scale: 0.95 } : {}}
      >
        {/* Position label */}
        {player.position && (
          <div className="absolute -top-2 left-2 px-2 py-1 bg-primary-500 text-white text-xs font-bold rounded">
            {player.position}
          </div>
        )}

        <div className="text-center">
          {/* Avatar */}
          <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-2">
            {player.avatar ? (
              <img
                src={player.avatar}
                alt={player.username || 'User'}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              (player.username || 'U').charAt(0).toUpperCase()
            )}
          </div>

          {/* Name */}
          <p className="font-medium text-primary-100 text-sm truncate">{player.username || 'User'}</p>

          {/* Skill stars */}
          <div className="flex justify-center mt-1">
            <PlayerSkillRating level={player.skillLevel} />
          </div>
        </div>
      </motion.div>
    );
  }

  // Default: detailed variant
  return (
    <motion.div
      className={cn(
        'bg-gradient-to-br from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-xl p-6 border border-primary-400/20',
        'hover:border-primary-400/40 transition-all duration-300',
        interactive ? 'cursor-pointer' : '',
        selected && 'ring-2 ring-primary-500 border-primary-500',
        className
      )}
      onClick={handleClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={interactive ? { y: -5, scale: 1.02 } : { y: -2 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {/* Avatar */}
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg basketball-glow">
              {player.avatar ? (
                <img
                  src={player.avatar}
                  alt={player.username || 'User'}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                (player.username || 'U').charAt(0).toUpperCase()
              )}
            </div>
            {/* Online indicator */}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-court-500 border-2 border-dark-300 rounded-full" />
          </div>

          {/* Basic info */}
          <div>
            <h3 className="font-bold text-primary-100 text-lg">{player.username || 'User'}</h3>
            <div className="flex items-center space-x-2 text-sm text-primary-300">
              {player.position && (
                <>
                  <span className="font-medium">{getPositionName(player.position)}</span>
                  <span>•</span>
                </>
              )}
              <span className="flex items-center">
                <Star className="w-4 h-4 mr-1 text-primary-400" />
                Rating: {player.rating}
              </span>
            </div>
          </div>
        </div>

        {/* Action button */}
        {interactive && (
          <GameButton variant="secondary" size="sm">
            {selected ? 'Selected' : 'Select'}
          </GameButton>
        )}
      </div>

      {/* Skill level */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-primary-200">Skill Level</span>
          <span className="text-sm font-bold text-primary-400">{player.skillLevel}/10</span>
        </div>
        <PlayerSkillRating level={player.skillLevel} />
      </div>

      {/* Location */}
      {player.city && (
        <div className="flex items-center space-x-2 text-sm text-primary-300 mb-4">
          <MapPin className="w-4 h-4" />
          <span>{player.city}</span>
        </div>
      )}

      {/* Stats (if enabled) */}
      {showStats && (
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-primary-400/20">
          <div className="text-center">
            <p className="text-lg font-bold text-primary-100 font-accent">127</p>
            <p className="text-xs text-primary-300">Games</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-court-500 font-accent">74%</p>
            <p className="text-xs text-primary-300">Win Rate</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-yellow-400 font-accent">23</p>
            <p className="text-xs text-primary-300">MVPs</p>
          </div>
        </div>
      )}

      {/* Basketball decoration */}
      <div className="absolute top-2 right-2 text-primary-400/20 text-2xl">
        🏀
      </div>
    </motion.div>
  );
}

// Preset player card variants
export function TeamMemberCard({
  player,
  role = 'member',
  onRemove,
  className
}: {
  player: User;
  role?: 'captain' | 'co_captain' | 'member';
  onRemove?: () => void;
  className?: string;
}) {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'captain': return 'text-yellow-400';
      case 'co_captain': return 'text-blue-400';
      default: return 'text-primary-300';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'captain': return '👑';
      case 'co_captain': return '⭐';
      default: return '👤';
    }
  };

  return (
    <div className={cn('relative', className)}>
      <PlayerCard player={player} variant="compact" showStats />

      {/* Role badge */}
      <div className={cn(
        'absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1',
        'bg-dark-200 border border-primary-400/30',
        getRoleColor(role)
      )}>
        <span>{getRoleIcon(role)}</span>
        <span className="capitalize">{role.replace('_', ' ')}</span>
      </div>

      {/* Remove button */}
      {onRemove && role !== 'captain' && (
        <button
          onClick={onRemove}
          className="absolute -top-1 -left-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
        >
          ×
        </button>
      )}
    </div>
  );
}

export function PlayerSearchResult({
  player,
  onInvite,
  className
}: {
  player: User;
  onInvite?: () => void;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center justify-between p-4 bg-dark-300/50 rounded-lg border border-primary-400/20', className)}>
      <PlayerCard player={player} variant="compact" />

      {onInvite && (
        <GameButton variant="primary" size="sm" onClick={onInvite}>
          Invite
        </GameButton>
      )}
    </div>
  );
}

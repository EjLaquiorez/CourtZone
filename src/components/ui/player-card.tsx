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
          'flex items-center space-x-3 rounded-lg border border-slate-800 bg-slate-900/70 p-3 text-xs transition-all duration-200',
          interactive ? 'cursor-pointer hover:border-slate-700 hover:bg-slate-900' : '',
          selected && 'ring-1 ring-primary-500 border-primary-500',
          className
        )}
        onClick={handleClick}
        whileHover={interactive ? { scale: 1.02 } : {}}
        whileTap={interactive ? { scale: 0.98 } : {}}
      >
        {/* Avatar */}
        <div className="relative">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-slate-100">
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
          <div className="absolute -bottom-1 -right-1 h-2.5 w-2.5 rounded-full border border-slate-900 bg-emerald-500" />
        </div>

        {/* Player info */}
        <div className="flex-1 min-w-0">
          <p className="truncate text-xs font-medium text-slate-100">{player.username}</p>
          <div className="flex items-center space-x-2 text-[11px] text-slate-500">
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
          <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800 text-lg font-semibold text-slate-100">
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
          <p className="truncate text-xs font-medium text-slate-100">{player.username || 'User'}</p>

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
          'rounded-xl border border-slate-800 bg-slate-900/80 p-5 text-sm transition-all duration-200 hover:border-slate-700 hover:bg-slate-900',
          interactive ? 'cursor-pointer' : '',
          selected && 'ring-1 ring-primary-500 border-primary-500',
          className
        )}
      onClick={handleClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={interactive ? { y: -5, scale: 1.02 } : { y: -2 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center space-x-3">
          {/* Avatar */}
          <div className="relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-base font-semibold text-slate-100">
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
            <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border border-slate-900 bg-emerald-500" />
          </div>

          {/* Basic info */}
          <div>
            <h3 className="text-sm font-medium text-slate-100">{player.username || 'User'}</h3>
            <div className="mt-0.5 flex items-center space-x-2 text-xs text-slate-500">
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
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Skill level</span>
          <span className="text-xs font-semibold text-slate-100">{player.skillLevel}/10</span>
        </div>
        <PlayerSkillRating level={player.skillLevel} />
      </div>

      {/* Location */}
      {player.city && (
        <div className="mb-4 flex items-center space-x-2 text-xs text-slate-500">
          <MapPin className="h-4 w-4" />
          <span>{player.city}</span>
        </div>
      )}

      {/* Stats (if enabled) */}
      {showStats && (
        <div className="grid grid-cols-3 gap-4 border-t border-slate-800 pt-4 text-xs">
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-100">127</p>
            <p className="text-[11px] text-slate-500">Games</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-emerald-400">74%</p>
            <p className="text-[11px] text-slate-500">Win rate</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-amber-400">23</p>
            <p className="text-[11px] text-slate-500">MVPs</p>
          </div>
        </div>
      )}
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

  return (
    <div className={cn('relative', className)}>
      <PlayerCard player={player} variant="compact" showStats />

      {/* Role badge */}
      <div className={cn(
        'absolute -top-2 -right-2 flex items-center space-x-1 rounded-full border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] font-medium',
        getRoleColor(role)
      )}>
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

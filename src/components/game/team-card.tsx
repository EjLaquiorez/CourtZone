'use client';

import { motion } from 'framer-motion';
import { Users, Trophy, TrendingUp, MapPin, Star, Crown, Settings, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { GameButton } from '@/components/ui/game-button';
import { StatCard } from '@/components/ui/stat-card';
import { TeamWithMembers } from '@/types';

interface TeamCardProps {
  team: TeamWithMembers;
  variant?: 'compact' | 'detailed' | 'dashboard';
  interactive?: boolean;
  showActions?: boolean;
  userRole?: 'captain' | 'co_captain' | 'member' | 'none';
  onJoin?: () => void;
  onLeave?: () => void;
  onManage?: () => void;
  className?: string;
}

export function TeamCard({
  team,
  variant = 'detailed',
  interactive = false,
  showActions = true,
  userRole = 'none',
  onJoin,
  onLeave,
  onManage,
  className
}: TeamCardProps) {
  const winRate = team.gamesPlayed > 0 ? Math.round((team.wins / team.gamesPlayed) * 100) : 0;
  const avgSkillLevel = team.members.length > 0
    ? team.members.reduce((sum, member) => sum + member.user.skillLevel, 0) / team.members.length
    : 0;

  if (variant === 'compact') {
    return (
      <motion.div
        className={cn(
          'bg-gradient-to-r from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-lg p-4 border border-primary-400/20',
          'hover:border-primary-400/40 transition-all duration-300',
          interactive && 'cursor-pointer hover:scale-102',
          className
        )}
        whileHover={interactive ? { y: -2 } : {}}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Team Logo */}
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center basketball-glow">
              {team.logoUrl ? (
                <img src={team.logoUrl} alt={team.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <Users className="w-6 h-6 text-white" />
              )}
            </div>

            {/* Team Info */}
            <div>
              <h3 className="font-bold text-primary-100 flex items-center">
                {team.name}
                {!team.isPublic && (
                  <span className="ml-2 px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                    Private
                  </span>
                )}
              </h3>
              <div className="flex items-center space-x-3 text-sm text-primary-300">
                <span>{team.memberCount}/{team.maxSize} members</span>
                <span>•</span>
                <span>Rating: {team.rating}</span>
                <span>•</span>
                <span>{winRate}% win rate</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex items-center space-x-2">
              {userRole === 'none' && team.isPublic && (
                <GameButton variant="primary" size="sm" onClick={onJoin}>
                  Join
                </GameButton>
              )}
              {(userRole === 'captain' || userRole === 'co_captain') && (
                <GameButton variant="secondary" size="sm" onClick={onManage}>
                  Manage
                </GameButton>
              )}
              {userRole === 'member' && (
                <GameButton variant="ghost" size="sm" onClick={onLeave}>
                  Leave
                </GameButton>
              )}
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
              {team.logoUrl ? (
                <img src={team.logoUrl} alt={team.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <Users className="w-8 h-8 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-display font-bold text-white">{team.name}</h3>
              <p className="text-primary-300">
                {userRole === 'captain' ? '👑 Captain' :
                 userRole === 'co_captain' ? '⭐ Co-Captain' :
                 userRole === 'member' ? '👤 Member' : 'Not a member'}
              </p>
            </div>
          </div>

          {showActions && (userRole === 'captain' || userRole === 'co_captain') && (
            <Link href={`/teams/${team.id}/manage`}>
              <GameButton variant="secondary" size="sm" icon={<Settings className="w-4 h-4" />}>
                Manage
              </GameButton>
            </Link>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-100 font-accent">{team.memberCount}</p>
            <p className="text-xs text-primary-300">Members</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-court-500 font-accent">{winRate}%</p>
            <p className="text-xs text-primary-300">Win Rate</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-400 font-accent">{team.rating}</p>
            <p className="text-xs text-primary-300">Rating</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-primary-200">Recent Activity</h4>
          <div className="space-y-1 text-sm text-primary-300">
            <p>• Last game: Won vs Thunder Bolts (+25 rating)</p>
            <p>• New member: Alex joined the team</p>
            <p>• Upcoming: Game vs City Ballers tomorrow</p>
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
        'hover:border-primary-400/40 transition-all duration-300 relative overflow-hidden',
        interactive && 'cursor-pointer',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={interactive ? { y: -5, scale: 1.02 } : { y: -2 }}
      transition={{ duration: 0.3 }}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 text-6xl opacity-5">🏀</div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-4">
          {/* Team Logo */}
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center basketball-glow">
              {team.logoUrl ? (
                <img src={team.logoUrl} alt={team.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <Users className="w-8 h-8 text-white" />
              )}
            </div>
            {/* Team status indicator */}
            <div className={cn(
              "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-dark-300",
              team.isPublic ? "bg-court-500" : "bg-yellow-500"
            )} />
          </div>

          {/* Team Info */}
          <div>
            <h3 className="text-xl font-display font-bold text-white mb-1">{team.name}</h3>
            <div className="flex items-center space-x-3 text-sm text-primary-300">
              <span className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {team.memberCount}/{team.maxSize}
              </span>
              <span className="flex items-center">
                <Star className="w-4 h-4 mr-1" />
                {avgSkillLevel.toFixed(1)} avg
              </span>
              <span className="flex items-center">
                <Trophy className="w-4 h-4 mr-1" />
                {team.rating}
              </span>
            </div>
          </div>
        </div>

        {/* Privacy badge */}
        {!team.isPublic && (
          <div className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded-full border border-yellow-500/30">
            Private
          </div>
        )}
      </div>

      {/* Description */}
      {team.description && (
        <p className="text-primary-200 text-sm mb-4 line-clamp-2">
          {team.description}
        </p>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-dark-200/50 rounded-lg">
          <p className="text-lg font-bold text-primary-100 font-accent">{team.gamesPlayed}</p>
          <p className="text-xs text-primary-300">Games</p>
        </div>
        <div className="text-center p-3 bg-dark-200/50 rounded-lg">
          <p className="text-lg font-bold text-court-500 font-accent">{team.wins}</p>
          <p className="text-xs text-primary-300">Wins</p>
        </div>
        <div className="text-center p-3 bg-dark-200/50 rounded-lg">
          <p className="text-lg font-bold text-yellow-400 font-accent">{winRate}%</p>
          <p className="text-xs text-primary-300">Win Rate</p>
        </div>
        <div className="text-center p-3 bg-dark-200/50 rounded-lg">
          <p className="text-lg font-bold text-blue-400 font-accent">{team.rating}</p>
          <p className="text-xs text-primary-300">Rating</p>
        </div>
      </div>

      {/* Team Members Preview */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-primary-200">Team Members</h4>
          <Link href={`/teams/${team.id}`} className="text-xs text-primary-400 hover:text-primary-300">
            View All
          </Link>
        </div>

        <div className="flex items-center space-x-2">
          {team.members.slice(0, 5).map((member) => (
            <div
              key={member.user.id}
              className="relative w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-xs font-bold"
            >
              {member.user.avatar ? (
                <img
                  src={member.user.avatar}
                  alt={member.user.username || 'User'}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                (member.user.username || 'U').charAt(0).toUpperCase()
              )}

              {/* Role indicator */}
              {member.role === 'captain' && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Crown className="w-2 h-2 text-white" />
                </div>
              )}
            </div>
          ))}

          {team.memberCount > 5 && (
            <div className="w-8 h-8 bg-dark-200 rounded-full flex items-center justify-center text-primary-300 text-xs font-bold">
              +{team.memberCount - 5}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex items-center justify-between pt-4 border-t border-primary-400/20">
          <div className="flex items-center space-x-2">
            {userRole === 'none' && team.isPublic && (
              <GameButton variant="primary" size="sm" onClick={onJoin} icon={<UserPlus className="w-4 h-4" />}>
                Join Team
              </GameButton>
            )}
            {(userRole === 'captain' || userRole === 'co_captain') && (
              <GameButton variant="secondary" size="sm" onClick={onManage} icon={<Settings className="w-4 h-4" />}>
                Manage
              </GameButton>
            )}
            {userRole === 'member' && (
              <GameButton variant="ghost" size="sm" onClick={onLeave}>
                Leave Team
              </GameButton>
            )}
          </div>

          <Link href={`/teams/${team.id}`}>
            <GameButton variant="ghost" size="sm">
              View Details
            </GameButton>
          </Link>
        </div>
      )}
    </motion.div>
  );
}

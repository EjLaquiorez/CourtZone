'use client';

import { motion } from 'framer-motion';
import {
  Users,
  MapPin,
  Calendar,
  Trophy,
  Target,
  Plus,
  Search,
  Circle
} from 'lucide-react';
import { GameButton } from './game-button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  variant: 'games' | 'teams' | 'courts' | 'players' | 'achievements' | 'notifications' | 'search';
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  showAction?: boolean;
}

const emptyStateConfig = {
  games: {
    icon: Calendar,
    emoji: '🏀',
    title: 'No games found',
    description: 'Ready to ball? Create your first game and start building your basketball legacy!',
    actionLabel: 'Create Game',
    motivationalQuote: '"Every great game starts with a single shot"'
  },
  teams: {
    icon: Users,
    emoji: '👥',
    title: 'No teams yet',
    description: 'Build your squad! Create or join a team to compete with the best ballers in your area.',
    actionLabel: 'Create Team',
    motivationalQuote: '"Teamwork makes the dream work"'
  },
  courts: {
    icon: MapPin,
    emoji: '🏟️',
    title: 'No courts nearby',
    description: 'Help the community grow! Add courts in your area so everyone can find their perfect playing spot.',
    actionLabel: 'Add Court',
    motivationalQuote: '"Every legend needs their home court"'
  },
  players: {
    icon: Users,
    emoji: '⭐',
    title: 'No players found',
    description: 'The court is waiting! Connect with players in your area and start building your basketball network.',
    actionLabel: 'Find Players',
    motivationalQuote: '"Great players inspire great games"'
  },
  achievements: {
    icon: Trophy,
    emoji: '🏆',
    title: 'No achievements yet',
    description: 'Your journey starts now! Play games, win matches, and unlock achievements to showcase your skills.',
    actionLabel: 'Play Game',
    motivationalQuote: '"Champions are made one game at a time"'
  },
  notifications: {
    icon: Target,
    emoji: '🔔',
    title: 'All caught up!',
    description: 'No new notifications. Keep playing and connecting with the basketball community for updates.',
    actionLabel: 'Explore Games',
    motivationalQuote: '"Stay ready so you don\'t have to get ready"'
  },
  search: {
    icon: Search,
    emoji: '🔍',
    title: 'No results found',
    description: 'Try adjusting your search terms or filters. The perfect game or player might be just a search away!',
    actionLabel: 'Clear Filters',
    motivationalQuote: '"Keep searching, keep playing"'
  }
};

export function EmptyState({
  variant,
  title,
  description,
  actionLabel,
  onAction,
  className,
  showAction = true
}: EmptyStateProps) {
  const config = emptyStateConfig[variant];
  const Icon = config.icon;

  return (
    <motion.div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 lg:p-12',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated Icon */}
      <motion.div
        className="relative mb-6"
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Background circle */}
        <motion.div
          className="w-24 h-24 bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-full flex items-center justify-center border border-primary-400/30"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Icon className="w-10 h-10 text-primary-400" />
        </motion.div>

        {/* Floating emoji */}
        <motion.div
          className="absolute -top-2 -right-2 text-2xl"
          animate={{
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        >
          {config.emoji}
        </motion.div>
      </motion.div>

      {/* Title */}
      <motion.h3
        className="text-2xl font-display font-bold text-white mb-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {title || config.title}
      </motion.h3>

      {/* Description */}
      <motion.p
        className="text-primary-300 max-w-md mb-6 leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {description || config.description}
      </motion.p>

      {/* Action Button */}
      {showAction && onAction && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <GameButton
            variant="primary"
            size="lg"
            onClick={onAction}
            icon={<Plus className="w-5 h-5" />}
            className="mb-6"
          >
            {actionLabel || config.actionLabel}
          </GameButton>
        </motion.div>
      )}

      {/* Motivational Quote */}
      <motion.div
        className="mt-4 pt-4 border-t border-primary-400/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-sm text-primary-400 italic">
          {config.motivationalQuote}
        </p>
      </motion.div>

      {/* Basketball animation */}
      <motion.div
        className="absolute bottom-4 right-4 text-4xl opacity-10"
        animate={{
          rotate: [0, 360],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <Circle className="w-8 h-8 fill-current" />
      </motion.div>
    </motion.div>
  );
}

// Specialized empty state components
export function EmptyGamesList({ onCreateGame }: { onCreateGame?: () => void }) {
  return (
    <EmptyState
      variant="games"
      onAction={onCreateGame}
      className="min-h-[400px]"
    />
  );
}

export function EmptyTeamsList({ onCreateTeam }: { onCreateTeam?: () => void }) {
  return (
    <EmptyState
      variant="teams"
      onAction={onCreateTeam}
      className="min-h-[400px]"
    />
  );
}

export function EmptyCourtsList({ onAddCourt }: { onAddCourt?: () => void }) {
  return (
    <EmptyState
      variant="courts"
      onAction={onAddCourt}
      className="min-h-[400px]"
    />
  );
}

export function EmptyPlayersList({ onFindPlayers }: { onFindPlayers?: () => void }) {
  return (
    <EmptyState
      variant="players"
      onAction={onFindPlayers}
      className="min-h-[400px]"
    />
  );
}

export function EmptySearchResults({ onClearFilters }: { onClearFilters?: () => void }) {
  return (
    <EmptyState
      variant="search"
      onAction={onClearFilters}
      className="min-h-[300px]"
    />
  );
}

export function EmptyNotifications({ onExploreGames }: { onExploreGames?: () => void }) {
  return (
    <EmptyState
      variant="notifications"
      onAction={onExploreGames}
      className="min-h-[300px]"
      showAction={false}
    />
  );
}

'use client';

import { useMemo, memo, ReactNode } from 'react';
import { Calendar, Clock } from 'lucide-react';
import type { GameStatus } from '@/types';

interface Game {
  id: string;
  hostTeamId: string;
  opponentTeamId?: string;
  courtId: string;
  scheduledTime: Date;
  durationMinutes: number;
  gameType: 'casual' | 'competitive' | 'tournament' | 'pickup';
  status: GameStatus;
  minSkillLevel?: number;
  maxSkillLevel?: number;
  maxDistance?: number;
  winnerTeamId?: string;
  hostScore?: number;
  opponentScore?: number;
  createdAt: Date;
}

interface GameCardProps {
  game: Game;
  onJoin?: () => void;
  onView?: () => void;
  className?: string;
}

interface StatusConfig {
  label: string;
  color: string;
  icon?: ReactNode;
}

const GAME_STATUS_CONFIG: Record<GameStatus, StatusConfig> = {
  open: {
    label: 'Open',
    color: 'text-green-500',
    icon: <Clock className="w-4 h-4" />
  },
  matched: {
    label: 'Matched',
    color: 'text-blue-500',
    icon: <Calendar className="w-4 h-4" />
  },
  in_progress: {
    label: 'In Progress',
    color: 'text-yellow-500',
    icon: <Clock className="w-4 h-4" />
  },
  completed: {
    label: 'Completed',
    color: 'text-gray-500',
    icon: <Calendar className="w-4 h-4" />
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-red-500',
    icon: <Calendar className="w-4 h-4" />
  }
};

const useGameStatus = (game: Game) => {
  return useMemo(() => {
    const config = GAME_STATUS_CONFIG[game.status];
    return {
      ...config,
      isActive: game.status === 'in_progress',
      isCompleted: game.status === 'completed',
      isCancelled: game.status === 'cancelled',
      canJoin: game.status === 'open'
    };
  }, [game.status]);
};

const GameCard = memo(({ game, onJoin, onView, className = '' }: GameCardProps): ReactNode => {
  const status = useGameStatus(game);

  return (
    <div className={`p-4 rounded-lg border ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {status.icon}
          <span className={`font-medium ${status.color}`}>{status.label}</span>
        </div>
        <div className="text-sm text-gray-500">
          {new Date(game.scheduledTime).toLocaleDateString()}
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Host Team</span>
          <span className="font-medium">{game.hostTeamId}</span>
        </div>
        {game.opponentTeamId && (
          <div className="flex justify-between">
            <span>Opponent Team</span>
            <span className="font-medium">{game.opponentTeamId}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Duration</span>
          <span>{game.durationMinutes} minutes</span>
        </div>
      </div>
      <div className="mt-4 flex space-x-2">
        {status.canJoin && onJoin && (
          <button
            onClick={onJoin}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Join Game
          </button>
        )}
        {onView && (
          <button
            onClick={onView}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            View Details
          </button>
        )}
      </div>
    </div>
  );
});

GameCard.displayName = 'GameCard';

export default GameCard; 
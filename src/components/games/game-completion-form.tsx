'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Target, 
  Users, 
  Plus,
  Minus,
  Check,
  X,
  Save
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { GameButton } from '@/components/ui/game-button';
import { useCompleteGame } from '@/lib/hooks/use-api';

interface GameCompletionFormProps {
  gameId: string;
  participants: Array<{
    id: string;
    userId: string;
    user: {
      id: string;
      username: string;
      skillLevel: number;
      rating: number;
    };
  }>;
  teams?: {
    hostTeam?: { id: string; name: string };
    opponentTeam?: { id: string; name: string };
  };
  onComplete?: (result: any) => void;
  onCancel?: () => void;
}

interface PlayerStats {
  userId: string;
  points: number;
  assists: number;
  rebounds: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fouls: number;
  minutesPlayed: number;
}

export function GameCompletionForm({ 
  gameId, 
  participants, 
  teams,
  onComplete,
  onCancel 
}: GameCompletionFormProps) {
  const [gameType, setGameType] = useState<'pickup' | 'team'>('pickup');
  const [finalScore, setFinalScore] = useState('');
  const [hostScore, setHostScore] = useState<number | ''>('');
  const [opponentScore, setOpponentScore] = useState<number | ''>('');
  const [winnerTeamId, setWinnerTeamId] = useState<string>('');
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>(
    participants.map(p => ({
      userId: p.userId,
      points: 0,
      assists: 0,
      rebounds: 0,
      steals: 0,
      blocks: 0,
      turnovers: 0,
      fouls: 0,
      minutesPlayed: 0
    }))
  );
  const [showPlayerStats, setShowPlayerStats] = useState(false);

  const completeGameMutation = useCompleteGame({
    onSuccess: (data) => {
      console.log('Game completed successfully:', data);
      onComplete?.(data);
    },
    onError: (error) => {
      console.error('Failed to complete game:', error);
    }
  });

  // Update player stat
  const updatePlayerStat = (userId: string, stat: keyof Omit<PlayerStats, 'userId'>, value: number) => {
    setPlayerStats(prev => prev.map(p => 
      p.userId === userId ? { ...p, [stat]: Math.max(0, value) } : p
    ));
  };

  // Handle form submission
  const handleSubmit = () => {
    const data: any = {
      finalScore: finalScore.trim() || undefined,
      hostScore: hostScore !== '' ? Number(hostScore) : undefined,
      opponentScore: opponentScore !== '' ? Number(opponentScore) : undefined,
      winnerTeamId: winnerTeamId || undefined,
      playerStats: showPlayerStats ? playerStats : undefined
    };

    completeGameMutation.mutate({ gameId, data });
  };

  // Validate form
  const isFormValid = () => {
    if (gameType === 'team') {
      return hostScore !== '' && opponentScore !== '';
    }
    return finalScore.trim() !== '';
  };

  return (
    <motion.div
      className="bg-gradient-to-br from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-xl p-6 border border-primary-400/20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Trophy className="w-6 h-6 text-yellow-400" />
          <h3 className="text-xl font-display font-bold text-white">Complete Game</h3>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-primary-300 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Game Type Selection */}
        <div>
          <label className="block text-sm font-medium text-primary-200 mb-3">
            Game Type
          </label>
          <div className="flex space-x-3">
            <button
              onClick={() => setGameType('pickup')}
              className={cn(
                'flex-1 p-3 rounded-lg border transition-all duration-200',
                gameType === 'pickup'
                  ? 'border-primary-400 bg-primary-500/20 text-primary-100'
                  : 'border-primary-400/30 bg-primary-500/5 text-primary-300 hover:bg-primary-500/10'
              )}
            >
              Pickup Game
            </button>
            <button
              onClick={() => setGameType('team')}
              className={cn(
                'flex-1 p-3 rounded-lg border transition-all duration-200',
                gameType === 'team'
                  ? 'border-primary-400 bg-primary-500/20 text-primary-100'
                  : 'border-primary-400/30 bg-primary-500/5 text-primary-300 hover:bg-primary-500/10'
              )}
            >
              Team Game
            </button>
          </div>
        </div>

        {/* Score Input */}
        {gameType === 'pickup' ? (
          <div>
            <label className="block text-sm font-medium text-primary-200 mb-2">
              Final Score
            </label>
            <input
              type="text"
              value={finalScore}
              onChange={(e) => setFinalScore(e.target.value)}
              placeholder="e.g., 21-18, 15-12"
              className="w-full px-4 py-3 bg-dark-200/50 border border-primary-400/30 rounded-lg text-white placeholder-primary-400 focus:outline-none focus:border-primary-400"
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-200 mb-2">
                {teams?.hostTeam?.name || 'Host Team'} Score
              </label>
              <input
                type="number"
                value={hostScore}
                onChange={(e) => setHostScore(e.target.value === '' ? '' : Number(e.target.value))}
                min="0"
                className="w-full px-4 py-3 bg-dark-200/50 border border-primary-400/30 rounded-lg text-white placeholder-primary-400 focus:outline-none focus:border-primary-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-200 mb-2">
                {teams?.opponentTeam?.name || 'Opponent Team'} Score
              </label>
              <input
                type="number"
                value={opponentScore}
                onChange={(e) => setOpponentScore(e.target.value === '' ? '' : Number(e.target.value))}
                min="0"
                className="w-full px-4 py-3 bg-dark-200/50 border border-primary-400/30 rounded-lg text-white placeholder-primary-400 focus:outline-none focus:border-primary-400"
              />
            </div>
          </div>
        )}

        {/* Winner Selection for Team Games */}
        {gameType === 'team' && teams && hostScore !== '' && opponentScore !== '' && (
          <div>
            <label className="block text-sm font-medium text-primary-200 mb-3">
              Winner
            </label>
            <div className="flex space-x-3">
              <button
                onClick={() => setWinnerTeamId(teams.hostTeam?.id || '')}
                className={cn(
                  'flex-1 p-3 rounded-lg border transition-all duration-200',
                  winnerTeamId === teams.hostTeam?.id
                    ? 'border-court-400 bg-court-500/20 text-court-100'
                    : 'border-primary-400/30 bg-primary-500/5 text-primary-300 hover:bg-primary-500/10'
                )}
              >
                {teams.hostTeam?.name || 'Host Team'}
              </button>
              <button
                onClick={() => setWinnerTeamId(teams.opponentTeam?.id || '')}
                className={cn(
                  'flex-1 p-3 rounded-lg border transition-all duration-200',
                  winnerTeamId === teams.opponentTeam?.id
                    ? 'border-court-400 bg-court-500/20 text-court-100'
                    : 'border-primary-400/30 bg-primary-500/5 text-primary-300 hover:bg-primary-500/10'
                )}
              >
                {teams.opponentTeam?.name || 'Opponent Team'}
              </button>
            </div>
          </div>
        )}

        {/* Player Statistics Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-primary-200">Player Statistics</h4>
            <p className="text-sm text-primary-300">Record individual player performance</p>
          </div>
          <button
            onClick={() => setShowPlayerStats(!showPlayerStats)}
            className={cn(
              'px-4 py-2 rounded-lg border transition-all duration-200',
              showPlayerStats
                ? 'border-primary-400 bg-primary-500/20 text-primary-100'
                : 'border-primary-400/30 bg-primary-500/5 text-primary-300 hover:bg-primary-500/10'
            )}
          >
            {showPlayerStats ? 'Hide Stats' : 'Add Stats'}
          </button>
        </div>

        {/* Player Statistics Form */}
        {showPlayerStats && (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="bg-dark-200/30 rounded-lg p-4">
              <h5 className="font-medium text-primary-200 mb-4">Player Performance</h5>
              <div className="space-y-4">
                {participants.map((participant) => {
                  const stats = playerStats.find(s => s.userId === participant.userId);
                  if (!stats) return null;

                  return (
                    <div key={participant.userId} className="border border-primary-400/20 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {participant.user.username.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-primary-100">{participant.user.username}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 lg:grid-cols-8 gap-3">
                        {[
                          { key: 'points', label: 'PTS' },
                          { key: 'assists', label: 'AST' },
                          { key: 'rebounds', label: 'REB' },
                          { key: 'steals', label: 'STL' },
                          { key: 'blocks', label: 'BLK' },
                          { key: 'turnovers', label: 'TO' },
                          { key: 'fouls', label: 'PF' },
                          { key: 'minutesPlayed', label: 'MIN' }
                        ].map((stat) => (
                          <div key={stat.key} className="text-center">
                            <div className="text-xs text-primary-400 mb-1">{stat.label}</div>
                            <div className="flex items-center justify-center space-x-1">
                              <button
                                onClick={() => updatePlayerStat(
                                  participant.userId, 
                                  stat.key as keyof Omit<PlayerStats, 'userId'>, 
                                  stats[stat.key as keyof Omit<PlayerStats, 'userId'>] - 1
                                )}
                                className="w-6 h-6 bg-red-500/20 text-red-400 rounded flex items-center justify-center hover:bg-red-500/30 transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-8 text-center text-primary-100 font-medium">
                                {stats[stat.key as keyof Omit<PlayerStats, 'userId'>]}
                              </span>
                              <button
                                onClick={() => updatePlayerStat(
                                  participant.userId, 
                                  stat.key as keyof Omit<PlayerStats, 'userId'>, 
                                  stats[stat.key as keyof Omit<PlayerStats, 'userId'>] + 1
                                )}
                                className="w-6 h-6 bg-court-500/20 text-court-400 rounded flex items-center justify-center hover:bg-court-500/30 transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex space-x-3 pt-4 border-t border-primary-400/20">
          {onCancel && (
            <GameButton
              variant="ghost"
              size="md"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </GameButton>
          )}
          <GameButton
            variant="primary"
            size="md"
            onClick={handleSubmit}
            disabled={!isFormValid()}
            loading={completeGameMutation.isPending}
            icon={<Save className="w-4 h-4" />}
            className="flex-1"
            glow
          >
            Complete Game
          </GameButton>
        </div>
      </div>
    </motion.div>
  );
}

'use client';

import { useState } from 'react';
import { useUserStats } from '@/lib/hooks/use-api';
import { motion } from 'framer-motion';
import {
  Trophy,
  TrendingUp,
  Target,
  Award,
  Calendar,
  Users,
  Star,
  BarChart3,
  Activity,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatCard } from '@/components/ui/stat-card';
import { GameButton } from '@/components/ui/game-button';

export interface PlayerStatsProps {
  userId: string;
  season?: string;
  timeframe?: 'all' | 'last30' | 'last7';
}

interface PlayerStats {
  user: {
    id: string;
    username: string;
    avatar?: string;
    skillLevel: number;
    rating: number;
    position?: string;
  };
  seasonStats: {
    season: string;
    gamesPlayed: number;
    wins: number;
    losses: number;
    winPercentage: number;
    avgPoints: number;
    avgAssists: number;
    avgRebounds: number;
  };
  currentPeriodStats: {
    gamesPlayed: number;
    wins: number;
    losses: number;
    winPercentage: number;
    averages: {
      points: number;
      assists: number;
      rebounds: number;
      steals: number;
      blocks: number;
      turnovers: number;
      fouls: number;
      minutesPlayed: number;
    };
  };
  recentGames: Array<{
    gameId: string;
    gameTitle: string;
    gameType: string;
    date: string;
    court: string;
    stats: {
      points: number;
      assists: number;
      rebounds: number;
      steals: number;
      blocks: number;
      turnovers: number;
      fouls: number;
      minutesPlayed: number;
    };
    finalScore?: string;
  }>;
  rankings: {
    position?: string;
    rank?: number;
    totalPlayers: number;
  };
  achievements: Array<{
    name: string;
    description: string;
  }>;
}

// Mock data for demonstration
const mockStats: PlayerStats = {
  user: {
    id: 'user1',
    username: 'HoopMaster',
    skillLevel: 8,
    rating: 1850,
    position: 'PG'
  },
  seasonStats: {
    season: '2024',
    gamesPlayed: 42,
    wins: 28,
    losses: 14,
    winPercentage: 66.7,
    avgPoints: 18.5,
    avgAssists: 7.2,
    avgRebounds: 4.8
  },
  currentPeriodStats: {
    gamesPlayed: 8,
    wins: 6,
    losses: 2,
    winPercentage: 75.0,
    averages: {
      points: 21.3,
      assists: 8.1,
      rebounds: 5.2,
      steals: 2.4,
      blocks: 0.8,
      turnovers: 3.1,
      fouls: 2.7,
      minutesPlayed: 38.5
    }
  },
  recentGames: [
    {
      gameId: 'game1',
      gameTitle: 'Venice Beach Pickup',
      gameType: 'pickup',
      date: '2024-01-15',
      court: 'Venice Beach Courts',
      stats: {
        points: 24,
        assists: 9,
        rebounds: 6,
        steals: 3,
        blocks: 1,
        turnovers: 2,
        fouls: 3,
        minutesPlayed: 42
      },
      finalScore: '21-18'
    }
  ],
  rankings: {
    position: 'PG',
    rank: 12,
    totalPlayers: 156
  },
  achievements: [
    { name: 'Playmaker', description: '5+ APG average' },
    { name: 'Winner', description: '70%+ win rate' },
    { name: 'Iron Man', description: '50+ games played' }
  ]
};

export function PlayerStatsDashboard({ userId, season = '2024', timeframe = 'all' }: PlayerStatsProps) {
  const [activeTimeframe, setActiveTimeframe] = useState(timeframe);
  const [activeView, setActiveView] = useState<'overview' | 'detailed' | 'games'>('overview');

  // Fetch player stats using API hook
  const { data: statsResponse, isLoading, error } = useUserStats(
    userId,
    season,
    activeTimeframe
  );

  // Use stats from API or fallback to mock data if API fails
  const stats = statsResponse?.data || mockStats;

  const getStatColor = (value: number, threshold: number) => {
    if (value >= threshold * 1.2) return 'text-court-400';
    if (value >= threshold) return 'text-primary-400';
    return 'text-yellow-400';
  };

  const getPerformanceGrade = (winPercentage: number) => {
    if (winPercentage >= 70) return { grade: 'A', color: 'text-court-400' };
    if (winPercentage >= 60) return { grade: 'B', color: 'text-primary-400' };
    if (winPercentage >= 50) return { grade: 'C', color: 'text-yellow-400' };
    return { grade: 'D', color: 'text-red-400' };
  };

  const performance = getPerformanceGrade(stats.currentPeriodStats.winPercentage);

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-primary-400/20 rounded-full"></div>
          <div className="space-y-2">
            <div className="h-6 w-32 bg-primary-400/20 rounded"></div>
            <div className="h-4 w-48 bg-primary-400/20 rounded"></div>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-primary-400/20 rounded-lg"></div>
          ))}
        </div>
        <div className="h-64 bg-primary-400/20 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center space-x-4 mb-4 lg:mb-0">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
            {(stats.user.username || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-white">{stats.user.username || 'User'}</h1>
            <div className="flex items-center space-x-4 text-sm text-primary-300">
              <span>Rating: {stats.user.rating}</span>
              <span>•</span>
              <span>Skill: {stats.user.skillLevel}/10</span>
              <span>•</span>
              <span>Position: {stats.user.position}</span>
            </div>
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="flex space-x-1 bg-dark-300/50 rounded-lg p-1">
          {[
            { id: 'last7', label: 'Last 7 Days' },
            { id: 'last30', label: 'Last 30 Days' },
            { id: 'all', label: 'Season' }
          ].map((option) => (
            <button
              key={option.id}
              onClick={() => setActiveTimeframe(option.id as any)}
              className={cn(
                'px-4 py-2 rounded-lg font-medium transition-all duration-200',
                activeTimeframe === option.id
                  ? 'bg-primary-500 text-white'
                  : 'text-primary-300 hover:text-primary-100 hover:bg-primary-400/10'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Games Played"
          value={stats.currentPeriodStats.gamesPlayed}
          icon={<Calendar className="w-6 h-6" />}
          trend={{ direction: 'up', value: 2, label: 'this week' }}
        />
        <StatCard
          title="Win Rate"
          value={`${stats.currentPeriodStats.winPercentage}%`}
          icon={<Trophy className="w-6 h-6" />}
          trend={{ direction: 'up', value: 5, label: 'vs last period' }}
        />
        <StatCard
          title="Points/Game"
          value={stats.currentPeriodStats.averages.points}
          icon={<Target className="w-6 h-6" />}
          trend={{ direction: 'up', value: 2.8, label: 'vs season avg' }}
        />
        <StatCard
          title="Assists/Game"
          value={stats.currentPeriodStats.averages.assists}
          icon={<Users className="w-6 h-6" />}
          trend={{ direction: 'up', value: 0.9, label: 'vs season avg' }}
        />
        <StatCard
          title="Performance"
          value={performance.grade}
          icon={<Star className="w-6 h-6" />}
          trend={{ direction: 'neutral', value: 0, label: 'grade' }}
        />
      </div>

      {/* View Tabs */}
      <div className="flex space-x-1 bg-dark-300/50 rounded-lg p-1">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'detailed', label: 'Detailed Stats', icon: Activity },
          { id: 'games', label: 'Recent Games', icon: Zap }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              className={cn(
                'flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200',
                activeView === tab.id
                  ? 'bg-primary-500 text-white'
                  : 'text-primary-300 hover:text-primary-100 hover:bg-primary-400/10'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <motion.div
        key={activeView}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {activeView === 'overview' && (
          <div className="space-y-6">
            {/* Season Summary */}
            <div className="bg-gradient-to-br from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-xl p-6 border border-primary-400/20">
              <h3 className="text-xl font-display font-bold text-white mb-4">Season {stats.seasonStats.season} Summary</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-400">{stats.seasonStats.gamesPlayed}</div>
                  <div className="text-sm text-primary-300">Games Played</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-court-400">{stats.seasonStats.wins}</div>
                  <div className="text-sm text-primary-300">Wins</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">{stats.seasonStats.losses}</div>
                  <div className="text-sm text-primary-300">Losses</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">{stats.seasonStats.winPercentage}%</div>
                  <div className="text-sm text-primary-300">Win Rate</div>
                </div>
              </div>
            </div>

            {/* Achievements */}
            {stats.achievements.length > 0 && (
              <div className="bg-gradient-to-br from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-xl p-6 border border-primary-400/20">
                <h3 className="text-xl font-display font-bold text-white mb-4">Achievements</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {stats.achievements.map((achievement, index) => (
                    <motion.div
                      key={achievement.name}
                      className="flex items-center space-x-3 p-4 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-lg border border-yellow-500/30"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Award className="w-8 h-8 text-yellow-400" />
                      <div>
                        <div className="font-bold text-yellow-400">{achievement.name}</div>
                        <div className="text-sm text-yellow-300">{achievement.description}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Rankings */}
            {stats.rankings.rank && (
              <div className="bg-gradient-to-br from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-xl p-6 border border-primary-400/20">
                <h3 className="text-xl font-display font-bold text-white mb-4">Position Rankings</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-primary-400">#{stats.rankings.rank}</div>
                    <div className="text-sm text-primary-300">
                      out of {stats.rankings.totalPlayers} {stats.rankings.position} players
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-medium text-primary-200">
                      Top {Math.round((stats.rankings.rank / stats.rankings.totalPlayers) * 100)}%
                    </div>
                    <div className="text-sm text-primary-300">in your position</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeView === 'detailed' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Offensive Stats */}
            <div className="bg-gradient-to-br from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-xl p-6 border border-primary-400/20">
              <h3 className="text-xl font-display font-bold text-white mb-4">Offensive Stats</h3>
              <div className="space-y-4">
                {[
                  { label: 'Points per Game', value: stats.currentPeriodStats.averages.points, threshold: 15 },
                  { label: 'Assists per Game', value: stats.currentPeriodStats.averages.assists, threshold: 5 },
                  { label: 'Minutes Played', value: stats.currentPeriodStats.averages.minutesPlayed, threshold: 30 }
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between">
                    <span className="text-primary-300">{stat.label}</span>
                    <span className={cn('font-bold', getStatColor(stat.value, stat.threshold))}>
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Defensive Stats */}
            <div className="bg-gradient-to-br from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-xl p-6 border border-primary-400/20">
              <h3 className="text-xl font-display font-bold text-white mb-4">Defensive Stats</h3>
              <div className="space-y-4">
                {[
                  { label: 'Rebounds per Game', value: stats.currentPeriodStats.averages.rebounds, threshold: 5 },
                  { label: 'Steals per Game', value: stats.currentPeriodStats.averages.steals, threshold: 2 },
                  { label: 'Blocks per Game', value: stats.currentPeriodStats.averages.blocks, threshold: 1 }
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between">
                    <span className="text-primary-300">{stat.label}</span>
                    <span className={cn('font-bold', getStatColor(stat.value, stat.threshold))}>
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeView === 'games' && (
          <div className="space-y-4">
            {stats.recentGames.map((game, index) => (
              <motion.div
                key={game.gameId}
                className="bg-gradient-to-br from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-xl p-6 border border-primary-400/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-bold text-primary-100">{game.gameTitle}</h4>
                    <div className="flex items-center space-x-2 text-sm text-primary-300">
                      <span>{game.court}</span>
                      <span>•</span>
                      <span>{new Date(game.date).toLocaleDateString()}</span>
                      {game.finalScore && (
                        <>
                          <span>•</span>
                          <span className="text-primary-200">{game.finalScore}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <GameButton variant="ghost" size="sm">
                    View Game
                  </GameButton>
                </div>

                <div className="grid grid-cols-4 lg:grid-cols-8 gap-4 text-center">
                  {[
                    { label: 'PTS', value: game.stats.points },
                    { label: 'AST', value: game.stats.assists },
                    { label: 'REB', value: game.stats.rebounds },
                    { label: 'STL', value: game.stats.steals },
                    { label: 'BLK', value: game.stats.blocks },
                    { label: 'TO', value: game.stats.turnovers },
                    { label: 'PF', value: game.stats.fouls },
                    { label: 'MIN', value: game.stats.minutesPlayed }
                  ].map((stat) => (
                    <div key={stat.label}>
                      <div className="text-lg font-bold text-primary-200">{stat.value}</div>
                      <div className="text-xs text-primary-400">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

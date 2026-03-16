'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  MapPin,
  Users,
  Trophy,
  Star
} from 'lucide-react';
import { AuthenticatedHeader } from '@/components/layout/header';
import { Sidebar, MobileSidebar } from '@/components/layout/sidebar';
import { MobileBottomNav } from '@/components/layout/mobile-nav';
import { GameButton } from '@/components/ui/game-button';
import { GameCard } from '@/components/game/game-card';
import { cn } from '@/lib/utils';
import { Game, GameFilters, GameStatus } from '@/types';
import { useCurrentUser, useGames, useJoinGame } from '@/lib/hooks/use-api';
import { trackEvent } from '@/lib/analytics';

// Mock data for games
const mockUser = {
  username: 'CourtKing23',
  avatar: '',
  rating: 1847
};

const mockGames: Game[] = [
  {
    id: '1',
    hostTeamId: 'team1',
    courtId: '1',
    scheduledTime: new Date('2024-12-28T18:00:00'),
    durationMinutes: 120,
    gameType: 'pickup',
    status: 'open' as GameStatus,
    minSkillLevel: 4,
    maxSkillLevel: 8,
    maxDistance: 25,
    createdAt: new Date('2024-12-20')
  },
  {
    id: '2',
    hostTeamId: 'team2',
    courtId: '2',
    scheduledTime: new Date('2024-12-29T09:00:00'),
    durationMinutes: 180,
    gameType: 'competitive',
    status: 'open' as GameStatus,
    minSkillLevel: 6,
    maxSkillLevel: 10,
    maxDistance: 30,
    createdAt: new Date('2024-12-18')
  },
  {
    id: '3',
    hostTeamId: 'team3',
    courtId: '3',
    scheduledTime: new Date('2024-12-30T16:00:00'),
    durationMinutes: 150,
    gameType: 'casual',
    status: 'open' as GameStatus,
    minSkillLevel: 8,
    maxSkillLevel: 10,
    maxDistance: 20,
    createdAt: new Date('2024-12-15')
  }
];

export default function GamesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'my_games' | 'past'>('upcoming');
  const [filters, setFilters] = useState({
    gameType: undefined as string | undefined,
    maxDistance: undefined as number | undefined,
    dateRange: undefined as string | undefined,
    status: undefined as string | undefined
  });
  const { data: currentUserResponse } = useCurrentUser();
  const { data: gamesResponse } = useGames(undefined, 1, 50);
  const joinGameMutation = useJoinGame();
  const user = currentUserResponse?.data || mockUser;
  const games = gamesResponse?.data?.data || mockGames;

  const filteredGames = games.filter(game => {
    const scheduledAt = game.scheduledAt || game.scheduledTime;

    // Search filter - simplified since Game interface changed
    if (searchQuery && !String(game.title || game.id).toLowerCase().includes(searchQuery.toLowerCase()) &&
        !game.gameType.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !String(game.court?.name || '').toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Tab filter
    const now = new Date();
    switch (activeTab) {
      case 'upcoming':
        return (game.status === 'open' || game.status === 'scheduled') && new Date(scheduledAt || now).getTime() > now.getTime();
      case 'my_games':
        return Boolean(game.organizerId === user.id || game.participants?.some((participant) => participant.userId === user.id));
      case 'past':
        return game.status === 'completed' || new Date(scheduledAt || now).getTime() < now.getTime();
      default:
        return true;
    }
  });

  const handleCreateGame = () => {
    window.location.href = '/games/create';
  };

  const handleJoinGame = (gameId: string) => {
    trackEvent({
      name: 'game_join_attempted',
      properties: { gameId },
    });
    joinGameMutation.mutate(gameId);
  };

  const handleViewGame = (gameId: string) => {
    window.location.href = `/games/${gameId}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 lg:h-screen lg:overflow-hidden">
      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      <div className="flex lg:h-full">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0 lg:flex lg:h-full lg:flex-col lg:overflow-hidden">
          {/* Header */}
          <AuthenticatedHeader
            user={user}
            onMenuToggle={() => setMobileSidebarOpen(true)}
          />

          {/* Page Content */}
          <main className="p-4 lg:flex-1 lg:overflow-y-auto lg:p-8">
            {/* Page Header */}
            <motion.div
              className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div>
                <h1 className="mb-1 text-xl lg:text-2xl font-semibold text-slate-100">
                  Games
                </h1>
                <p className="text-sm text-slate-400">
                  Find games to join or create your own basketball events
                </p>
              </div>

              <div className="flex items-center space-x-3 mt-4 lg:mt-0">
                <GameButton
                  variant="primary"
                  size="sm"
                  onClick={handleCreateGame}
                  icon={<Plus className="w-5 h-5" />}
                >
                  Create Game
                </GameButton>
              </div>
            </motion.div>

            {/* Search and Filters */}
            <motion.div
              className="mb-6 rounded-xl border border-slate-800 bg-slate-900/80 p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
                {/* Search */}
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full rounded-lg border border-slate-700 bg-slate-900 pl-9 pr-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="Search games by title, description, or court..."
                  />
                </div>

                {/* Filter Toggle */}
                <GameButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  icon={<Filter className="w-5 h-5" />}
                >
                  Filters
                </GameButton>
              </div>
            </motion.div>

            {/* Navigation Tabs */}
            <motion.div
              className="mb-6 flex space-x-1 rounded-lg border border-slate-800 bg-slate-900 p-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {[
                { id: 'upcoming', label: 'Upcoming', icon: Calendar },
                { id: 'all', label: 'All Games', icon: Trophy },
                { id: 'my_games', label: 'My Games', icon: Users },
                { id: 'past', label: 'Past Games', icon: Clock }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      'flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150',
                      activeTab === tab.id
                        ? 'bg-slate-800 text-slate-100'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </motion.div>

            {/* Results Summary */}
            <motion.div
              className="mb-4 flex items-center justify-between"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <p className="text-sm text-slate-400">
                Found {filteredGames.length} games
                {searchQuery && ` matching "${searchQuery}"`}
              </p>

              <div className="flex items-center space-x-2 text-xs text-slate-500">
                <span>Sort by:</span>
                <select className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500">
                  <option value="date">Date</option>
                  <option value="players">Players</option>
                  <option value="skill">Skill Level</option>
                  <option value="distance">Distance</option>
                </select>
              </div>
            </motion.div>

            {/* Games Grid */}
            <motion.div
              className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {filteredGames.map((game, index) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                    <GameCard
                    game={game}
                    variant="dashboardMinimal"
                    userRole="none" // In real app, determine based on user participation
                    onJoin={() => handleJoinGame(game.id)}
                    onViewDetails={() => handleViewGame(game.id)}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Empty State */}
            {filteredGames.length === 0 && (
              <motion.div
                className="py-16 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <h3 className="mb-2 text-sm font-semibold text-slate-100">
                  No games found
                </h3>
                <p className="mb-4 text-sm text-slate-500">
                  {searchQuery
                    ? `No games match your search for "${searchQuery}"`
                    : 'No games match your current filters'
                  }
                </p>
                <GameButton
                  variant="primary"
                  size="lg"
                  onClick={handleCreateGame}
                  icon={<Plus className="w-5 h-5" />}
                  glow
                >
                  Create Your First Game
                </GameButton>
              </motion.div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileBottomNav
        notifications={{
          games: 3
        }}
      />
    </div>
  );
}

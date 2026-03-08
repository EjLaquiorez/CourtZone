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
import { MobileBottomNav, MobileQuickAction } from '@/components/layout/mobile-nav';
import { GameButton } from '@/components/ui/game-button';
import { GameCard } from '@/components/game/game-card';
import { cn } from '@/lib/utils';
import { Game, GameFilters, GameStatus } from '@/types';

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

  const filteredGames = mockGames.filter(game => {
    // Search filter - simplified since Game interface changed
    if (searchQuery && !game.id.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !game.gameType.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Tab filter
    const now = new Date();
    switch (activeTab) {
      case 'upcoming':
        return game.status === 'open' && new Date(game.scheduledTime) > now;
      case 'my_games':
        // In real app, filter by user participation
        return Math.random() > 0.7; // Mock participation
      case 'past':
        return game.status === 'completed' || new Date(game.scheduledTime) < now;
      default:
        return true;
    }
  });

  const handleCreateGame = () => {
    window.location.href = '/games/create';
  };

  const handleJoinGame = (gameId: string) => {
    console.log('Joining game:', gameId);
    // Implement join game logic
  };

  const handleViewGame = (gameId: string) => {
    window.location.href = `/games/${gameId}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <AuthenticatedHeader
            user={mockUser}
            onMenuToggle={() => setMobileSidebarOpen(true)}
          />

          {/* Page Content */}
          <main className="p-4 lg:p-8">
            {/* Page Header */}
            <motion.div
              className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div>
                <h1 className="text-3xl lg:text-4xl font-display font-bold text-white mb-2">
                  Games 🏀
                </h1>
                <p className="text-primary-200 text-lg">
                  Find games to join or create your own basketball events
                </p>
              </div>

              <div className="flex items-center space-x-3 mt-4 lg:mt-0">
                <GameButton
                  variant="primary"
                  size="md"
                  onClick={handleCreateGame}
                  icon={<Plus className="w-5 h-5" />}
                  glow
                >
                  Create Game
                </GameButton>
              </div>
            </motion.div>

            {/* Search and Filters */}
            <motion.div
              className="bg-gradient-to-r from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-xl p-6 border border-primary-400/20 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-primary-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-primary-400/30 rounded-lg bg-dark-200/50 text-primary-100 placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Search games by title, description, or court..."
                  />
                </div>

                {/* Filter Toggle */}
                <GameButton
                  variant="secondary"
                  size="md"
                  onClick={() => setShowFilters(!showFilters)}
                  icon={<Filter className="w-5 h-5" />}
                >
                  Filters
                </GameButton>
              </div>
            </motion.div>

            {/* Navigation Tabs */}
            <motion.div
              className="flex space-x-1 bg-dark-300/50 rounded-lg p-1 mb-8"
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
                      'flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200',
                      activeTab === tab.id
                        ? 'bg-primary-500 text-white'
                        : 'text-primary-300 hover:text-primary-100 hover:bg-primary-400/10'
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
              className="flex items-center justify-between mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <p className="text-primary-300">
                Found {filteredGames.length} games
                {searchQuery && ` matching "${searchQuery}"`}
              </p>

              <div className="flex items-center space-x-2 text-sm text-primary-300">
                <span>Sort by:</span>
                <select className="bg-dark-200/50 border border-primary-400/30 rounded px-2 py-1 text-primary-100 focus:outline-none focus:ring-1 focus:ring-primary-500">
                  <option value="date">Date</option>
                  <option value="players">Players</option>
                  <option value="skill">Skill Level</option>
                  <option value="distance">Distance</option>
                </select>
              </div>
            </motion.div>

            {/* Games Grid */}
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
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
                    variant="detailed"
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
                className="text-center py-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <Trophy className="w-16 h-16 text-primary-400 mx-auto mb-4" />
                <h3 className="text-xl font-display font-bold text-white mb-2">
                  No games found
                </h3>
                <p className="text-primary-300 mb-6">
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

      {/* Mobile Quick Action Button */}
      <MobileQuickAction />
    </div>
  );
}

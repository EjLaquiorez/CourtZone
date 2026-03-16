'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Plus, Search, Filter, Users, Trophy, Star, MapPin } from 'lucide-react';
import { AuthenticatedHeader } from '@/components/layout/header';
import { Sidebar, MobileSidebar } from '@/components/layout/sidebar';
import { MobileBottomNav } from '@/components/layout/mobile-nav';
import { GameButton, CreateTeamButton } from '@/components/ui/game-button';
import { TeamCard } from '@/components/game/team-card';
import { cn } from '@/lib/utils';
import { TeamWithMembers, TeamFilters } from '@/types';
import { useCurrentUser, useJoinTeam, useTeams } from '@/lib/hooks/use-api';
import { trackEvent } from '@/lib/analytics';

// Mock data for teams
const mockUser = {
  username: 'CourtKing23',
  avatar: '',
  rating: 1847
};

const mockTeams: TeamWithMembers[] = [
  {
    id: '1',
    name: 'Thunder Bolts',
    logoUrl: '',
    captainId: 'user1',
    maxSize: 12,
    minSkillLevel: 6,
    maxSkillLevel: 10,
    description: 'Competitive team looking for skilled players. We practice twice a week and compete in local tournaments.',
    isPublic: true,
    rating: 1892,
    gamesPlayed: 45,
    wins: 32,
    createdAt: new Date('2024-01-15'),
    captain: {
      id: 'user1',
      username: 'ThunderCap',
      email: 'thunder@example.com',
      skillLevel: 8,
      rating: 1950,
      maxDistance: 25,
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    members: [
      {
        id: 'member1',
        teamId: '1',
        userId: 'user1',
        role: 'captain' as const,
        position: 'PG',
        isStarter: true,
        joinedAt: new Date(),
        user: {
          id: 'user1',
          username: 'ThunderCap',
          email: 'thunder@example.com',
          skillLevel: 8,
          rating: 1950,
          position: 'PG',
          maxDistance: 25,
          isVerified: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      },
      // Add more members...
    ],
    memberCount: 8
  },
  {
    id: '2',
    name: 'Street Warriors',
    logoUrl: '',
    captainId: 'user2',
    maxSize: 10,
    minSkillLevel: 4,
    maxSkillLevel: 8,
    description: 'Casual team for weekend games. All skill levels welcome!',
    isPublic: true,
    rating: 1654,
    gamesPlayed: 28,
    wins: 18,
    createdAt: new Date('2024-02-01'),
    captain: {
      id: 'user2',
      username: 'WarriorLeader',
      email: 'warrior@example.com',
      skillLevel: 6,
      rating: 1700,
      maxDistance: 20,
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    members: [],
    memberCount: 6
  },
  {
    id: '3',
    name: 'Elite Ballers',
    logoUrl: '',
    captainId: 'user3',
    maxSize: 15,
    minSkillLevel: 8,
    maxSkillLevel: 10,
    description: 'Professional level team. Tryouts required.',
    isPublic: false,
    rating: 2156,
    gamesPlayed: 67,
    wins: 54,
    createdAt: new Date('2023-12-10'),
    captain: {
      id: 'user3',
      username: 'EliteCaptain',
      email: 'elite@example.com',
      skillLevel: 10,
      rating: 2200,
      maxDistance: 30,
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    members: [],
    memberCount: 12
  }
];

export default function TeamsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<TeamFilters>({
    isPublic: undefined,
    skillRange: undefined,
    hasOpenings: undefined,
    maxDistance: undefined
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { data: currentUserResponse } = useCurrentUser();
  const { data: teamsResponse, isLoading: loading, error: teamsError } = useTeams(filters, 1, 50);
  const joinTeamMutation = useJoinTeam();
  const user = currentUserResponse?.data || mockUser;
  const teams = teamsResponse?.data?.data || mockTeams;
  const error = teamsError ? teamsError.message : null;

  const filteredTeams = teams.filter(team => {
    // Search filter
    if (searchQuery && !team.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Public/Private filter
    if (filters.isPublic !== undefined && team.isPublic !== filters.isPublic) {
      return false;
    }

    // Has openings filter
    if (filters.hasOpenings && team.memberCount >= team.maxSize) {
      return false;
    }

    return true;
  });

  const handleJoinTeam = async (teamId: string) => {
    try {
      await trackEvent({
        name: 'team_join_attempted',
        properties: { teamId },
      });
      const result = await joinTeamMutation.mutateAsync(teamId);
      alert(result.message || 'Successfully joined team!');
    } catch (error) {
      console.error('Error joining team:', error);
      alert(error instanceof Error ? error.message : 'Failed to join team');
    }
  };

  const handleCreateTeam = () => {
    window.location.href = '/teams/create';
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
              className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div>
                <h1 className="text-xl lg:text-2xl font-semibold text-slate-100 mb-1">
                  Teams
                </h1>
                <p className="text-sm text-slate-400">
                  Find your squad or build your own championship team
                </p>
              </div>

              <div className="flex items-center space-x-3 mt-4 lg:mt-0">
                <CreateTeamButton
                  size="md"
                  onClick={handleCreateTeam}
                  icon={<Plus className="w-5 h-5" />}
                />
              </div>
            </motion.div>

            {/* Search and Filters */}
            <motion.div
              className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="Search teams by name..."
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

                {/* View Mode Toggle */}
                <div className="flex items-center rounded-lg border border-slate-800 bg-slate-900 p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                      viewMode === 'grid'
                        ? 'bg-slate-800 text-slate-100'
                        : 'text-slate-400 hover:text-slate-100'
                    )}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn(
                      'px-3 py-2 rounded-md text-sm font-medium transition-all',
                      viewMode === 'list'
                        ? 'bg-slate-800 text-slate-100'
                        : 'text-slate-400 hover:text-slate-100'
                    )}
                  >
                    List
                  </button>
                </div>
              </div>

              {/* Expanded Filters */}
              {showFilters && (
                <motion.div
                  className="mt-4 pt-4 border-t border-slate-800"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Team Type */}
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">
                        Team Type
                      </label>
                      <select
                        value={filters.isPublic === undefined ? 'all' : filters.isPublic ? 'public' : 'private'}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          isPublic: e.target.value === 'all' ? undefined : e.target.value === 'public'
                        }))}
                        className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      >
                        <option value="all">All Teams</option>
                        <option value="public">Public Teams</option>
                        <option value="private">Private Teams</option>
                      </select>
                    </div>

                    {/* Availability */}
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">
                        Availability
                      </label>
                      <select
                        value={filters.hasOpenings === undefined ? 'all' : filters.hasOpenings ? 'open' : 'full'}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          hasOpenings: e.target.value === 'all' ? undefined : e.target.value === 'open'
                        }))}
                        className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      >
                        <option value="all">All Teams</option>
                        <option value="open">Has Openings</option>
                        <option value="full">Full Teams</option>
                      </select>
                    </div>

                    {/* Skill Range */}
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">
                        Skill Level
                      </label>
                      <select className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500">
                        <option value="all">All Levels</option>
                        <option value="beginner">Beginner (1-3)</option>
                        <option value="intermediate">Intermediate (4-6)</option>
                        <option value="advanced">Advanced (7-8)</option>
                        <option value="elite">Elite (9-10)</option>
                      </select>
                    </div>

                    {/* Distance */}
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">
                        Distance
                      </label>
                      <select className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500">
                        <option value="all">Any Distance</option>
                        <option value="5">Within 5 miles</option>
                        <option value="10">Within 10 miles</option>
                        <option value="25">Within 25 miles</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Results Summary */}
            <motion.div
              className="flex items-center justify-between mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <p className="text-sm text-slate-400">
                Found {filteredTeams.length} teams
                {searchQuery && ` matching "${searchQuery}"`}
              </p>

              <div className="flex items-center space-x-2 text-xs text-slate-500">
                <span>Sort by:</span>
                <select className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500">
                  <option value="rating">Rating</option>
                  <option value="members">Members</option>
                  <option value="winRate">Win Rate</option>
                  <option value="created">Newest</option>
                </select>
              </div>
            </motion.div>

            {/* Loading State */}
            {loading && (
              <motion.div
                className="py-16 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="mx-auto mb-4 h-10 w-10 rounded-full border-2 border-slate-600 border-t-transparent animate-spin" />
                <p className="text-sm text-slate-400">Loading teams…</p>
              </motion.div>
            )}

            {/* Error State */}
            {error && !loading && (
              <motion.div
                className="py-16 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <h3 className="mb-2 text-sm font-semibold text-slate-100">
                  Unable to load teams
                </h3>
                <p className="mb-4 text-sm text-slate-500">{error}</p>
                <GameButton
                  variant="primary"
                  size="md"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </GameButton>
              </motion.div>
            )}

            {/* Teams Grid/List */}
            {!loading && !error && (
              <motion.div
                className={cn(
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'
                    : 'space-y-4'
                )}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                {filteredTeams.map((team, index) => (
                  <motion.div
                    key={team.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <TeamCard
                      team={team}
                      variant={viewMode === 'grid' ? 'detailed' : 'compact'}
                      interactive
                      userRole="none"
                      onJoin={() => handleJoinTeam(team.id)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Empty State */}
            {filteredTeams.length === 0 && (
              <motion.div
                className="py-16 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <h3 className="mb-2 text-sm font-semibold text-slate-100">
                  No teams found
                </h3>
                <p className="mb-4 text-sm text-slate-500">
                  {searchQuery
                    ? `No teams match your search for "${searchQuery}"`
                    : 'No teams match your current filters'
                  }
                </p>
                <CreateTeamButton
                  size="lg"
                  onClick={handleCreateTeam}
                  icon={<Plus className="w-5 h-5" />}
                >
                  Create Your Team
                </CreateTeamButton>
              </motion.div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileBottomNav
        notifications={{
          teams: 1
        }}
      />
    </div>
  );
}

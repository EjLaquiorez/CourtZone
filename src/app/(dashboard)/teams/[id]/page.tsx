'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Users,
  Settings,
  UserPlus,
  MessageCircle,
  Calendar,
  Trophy,
  Star,
  MapPin,
  Crown,
  Edit3,
  Share2
} from 'lucide-react';
import { AuthenticatedHeader } from '@/components/layout/header';
import { Sidebar, MobileSidebar } from '@/components/layout/sidebar';
import { MobileBottomNav, MobileQuickAction } from '@/components/layout/mobile-nav';
import { GameButton } from '@/components/ui/game-button';
import { StatCard } from '@/components/ui/stat-card';
import { TeamLineup } from '@/components/game/team-lineup';
import { PlayerCard } from '@/components/ui/player-card';
import { cn } from '@/lib/utils';
import { TeamWithMembers, User, Position } from '@/types';

// Mock data for team detail
const mockUser = {
  username: 'CourtKing23',
  avatar: '',
  rating: 1847
};

const mockTeamMembers = [
  {
    id: 'member1',
    teamId: '1',
    userId: 'user1',
    role: 'captain' as const,
    position: 'PG' as Position,
    isStarter: true,
    joinedAt: new Date(),
    user: {
      id: 'user1',
      username: 'ThunderCap',
      email: 'thunder@example.com',
      skillLevel: 8,
      rating: 1950,
      position: 'PG' as Position,
      city: 'Los Angeles',
      maxDistance: 25,
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },
  {
    id: 'member2',
    teamId: '1',
    userId: 'user2',
    role: 'member' as const,
    position: 'SG' as Position,
    isStarter: true,
    joinedAt: new Date(),
    user: {
      id: 'user2',
      username: 'SharpShooter',
      email: 'shooter@example.com',
      skillLevel: 7,
      rating: 1820,
      position: 'SG' as Position,
      city: 'Los Angeles',
      maxDistance: 20,
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },
  {
    id: 'member3',
    teamId: '1',
    userId: 'user3',
    role: 'member' as const,
    position: 'SF' as Position,
    isStarter: true,
    joinedAt: new Date(),
    user: {
      id: 'user3',
      username: 'WingMaster',
      email: 'wing@example.com',
      skillLevel: 6,
      rating: 1750,
      position: 'SF' as Position,
      city: 'Los Angeles',
      maxDistance: 30,
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },
  {
    id: 'member4',
    teamId: '1',
    userId: 'user4',
    role: 'member' as const,
    position: 'PF' as Position,
    isStarter: true,
    joinedAt: new Date(),
    user: {
      id: 'user4',
      username: 'PowerForward',
      email: 'power@example.com',
      skillLevel: 7,
      rating: 1800,
      position: 'PF' as Position,
      city: 'Los Angeles',
      maxDistance: 25,
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },
  {
    id: 'member5',
    teamId: '1',
    userId: 'user5',
    role: 'member' as const,
    position: 'C' as Position,
    isStarter: true,
    joinedAt: new Date(),
    user: {
      id: 'user5',
      username: 'BigMan',
      email: 'center@example.com',
      skillLevel: 8,
      rating: 1880,
      position: 'C' as Position,
      city: 'Los Angeles',
      maxDistance: 15,
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },
  // Bench players
  {
    id: 'member6',
    teamId: '1',
    userId: 'user6',
    role: 'member' as const,
    position: 'PG' as Position,
    isStarter: false,
    joinedAt: new Date(),
    user: {
      id: 'user6',
      username: 'BenchBoss',
      email: 'bench@example.com',
      skillLevel: 6,
      rating: 1720,
      position: 'PG' as Position,
      city: 'Los Angeles',
      maxDistance: 20,
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }
];

const mockTeam: TeamWithMembers = {
  id: '1',
  name: 'Thunder Bolts',
  logoUrl: '',
  captainId: 'user1',
  maxSize: 12,
  minSkillLevel: 6,
  maxSkillLevel: 10,
  description: 'Competitive team looking for skilled players. We practice twice a week and compete in local tournaments. Our goal is to win the city championship this year!',
  isPublic: true,
  rating: 1892,
  gamesPlayed: 45,
  wins: 32,
  createdAt: new Date('2024-01-15'),
  captain: mockTeamMembers[0].user!,
  members: mockTeamMembers,
  memberCount: mockTeamMembers.length
};

export default function TeamDetailPage() {
  const params = useParams();
  const teamId = params.id as string;

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'lineup' | 'members' | 'games'>('overview');

  // Mock user role - in real app, this would come from auth/API
  const userRole = 'captain'; // 'captain' | 'co_captain' | 'member' | 'none'

  const handlePlayerMove = (playerId: string, position: Position, isStarter: boolean) => {
    console.log('Moving player:', { playerId, position, isStarter });
    // Implement player move logic
  };

  const handleSaveLineup = (lineup: any) => {
    console.log('Saving lineup:', lineup);
    // Implement save lineup logic
  };

  const winRate = mockTeam.gamesPlayed > 0 ? Math.round((mockTeam.wins / mockTeam.gamesPlayed) * 100) : 0;
  const avgSkillLevel = mockTeam.members.reduce((sum, member) => sum + (member.user?.skillLevel || 0), 0) / mockTeam.members.length;

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
            {/* Team Header */}
            <motion.div
              className="bg-gradient-to-r from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-xl p-6 border border-primary-400/20 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                  {/* Team Logo */}
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center basketball-glow">
                    {mockTeam.logoUrl ? (
                      <img src={mockTeam.logoUrl} alt={mockTeam.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <Users className="w-10 h-10 text-white" />
                    )}
                  </div>

                  {/* Team Info */}
                  <div>
                    <h1 className="text-3xl font-display font-bold text-white flex items-center">
                      {mockTeam.name}
                      {!mockTeam.isPublic && (
                        <span className="ml-3 px-2 py-1 bg-yellow-500/20 text-yellow-400 text-sm rounded-full">
                          Private
                        </span>
                      )}
                    </h1>
                    <div className="flex items-center space-x-4 text-primary-300 mt-1">
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {mockTeam.memberCount}/{mockTeam.maxSize} members
                      </span>
                      <span className="flex items-center">
                        <Star className="w-4 h-4 mr-1" />
                        {avgSkillLevel.toFixed(1)} avg skill
                      </span>
                      <span className="flex items-center">
                        <Trophy className="w-4 h-4 mr-1" />
                        {mockTeam.rating} rating
                      </span>
                    </div>
                    <p className="text-primary-200 mt-2 max-w-2xl">
                      {mockTeam.description}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-3">
                  {userRole === 'captain' && (
                    <>
                      <GameButton variant="secondary" size="md" icon={<UserPlus className="w-5 h-5" />}>
                        Invite Players
                      </GameButton>
                      <GameButton variant="secondary" size="md" icon={<Settings className="w-5 h-5" />}>
                        Manage Team
                      </GameButton>
                    </>
                  )}
                  <GameButton variant="ghost" size="md" icon={<Share2 className="w-5 h-5" />}>
                    Share
                  </GameButton>
                </div>
              </div>
            </motion.div>

            {/* Navigation Tabs */}
            <motion.div
              className="flex space-x-1 bg-dark-300/50 rounded-lg p-1 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {[
                { id: 'overview', label: 'Overview', icon: Trophy },
                { id: 'lineup', label: 'Lineup', icon: Users },
                { id: 'members', label: 'Members', icon: Crown },
                { id: 'games', label: 'Games', icon: Calendar }
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

            {/* Tab Content */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {/* Team Stats */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                      title="Games Played"
                      value={mockTeam.gamesPlayed}
                      icon={<Calendar className="w-6 h-6" />}
                      trend={{ direction: 'up', value: 12, label: 'this month' }}
                    />
                    <StatCard
                      title="Win Rate"
                      value={`${winRate}%`}
                      icon={<Trophy className="w-6 h-6" />}
                      trend={{ direction: 'up', value: 5, label: 'this week' }}
                    />
                    <StatCard
                      title="Team Rating"
                      value={mockTeam.rating}
                      icon={<Star className="w-6 h-6" />}
                      trend={{ direction: 'up', value: 3, label: 'this week' }}
                    />
                    <StatCard
                      title="Active Members"
                      value={mockTeam.memberCount}
                      icon={<Users className="w-6 h-6" />}
                      trend={{ direction: 'neutral', value: 0, label: 'no change' }}
                    />
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-gradient-to-br from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-xl p-6 border border-primary-400/20">
                    <h3 className="text-xl font-display font-bold text-white mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-dark-200/50 rounded-lg">
                        <div className="w-2 h-2 bg-court-500 rounded-full" />
                        <p className="text-primary-200">Won against Street Warriors 78-65 (+25 rating)</p>
                        <span className="text-xs text-primary-400 ml-auto">2 days ago</span>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-dark-200/50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <p className="text-primary-200">BenchBoss joined the team</p>
                        <span className="text-xs text-primary-400 ml-auto">1 week ago</span>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-dark-200/50 rounded-lg">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                        <p className="text-primary-200">Upcoming game vs City Ballers scheduled</p>
                        <span className="text-xs text-primary-400 ml-auto">1 week ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'lineup' && (
                <TeamLineup
                  team={mockTeam}
                  interactive={userRole === 'captain' || userRole === 'co_captain'}
                  onPlayerMove={handlePlayerMove}
                  onSaveLineup={handleSaveLineup}
                  showSubstitutes
                />
              )}

              {activeTab === 'members' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-display font-bold text-white">
                      Team Members ({mockTeam.memberCount})
                    </h3>
                    {userRole === 'captain' && (
                      <GameButton variant="primary" size="md" icon={<UserPlus className="w-5 h-5" />}>
                        Invite Player
                      </GameButton>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {mockTeam.members.filter(member => member.user).map((member) => (
                      <PlayerCard
                        key={member.id}
                        player={member.user!}
                        variant="detailed"
                        showStats
                        className="relative"
                      >
                        {/* Role badge */}
                        <div className={cn(
                          'absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1',
                          member.role === 'captain' ? 'bg-yellow-500/20 text-yellow-400' :
                          member.role === 'co_captain' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-primary-500/20 text-primary-400'
                        )}>
                          <span>
                            {member.role === 'captain' ? '👑' :
                             member.role === 'co_captain' ? '⭐' : '👤'}
                          </span>
                          <span className="capitalize">{member.role.replace('_', ' ')}</span>
                        </div>
                      </PlayerCard>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'games' && (
                <div className="text-center py-16">
                  <Calendar className="w-16 h-16 text-primary-400 mx-auto mb-4" />
                  <h3 className="text-xl font-display font-bold text-white mb-2">
                    Games Coming Soon
                  </h3>
                  <p className="text-primary-300">
                    Game scheduling and history will be available in the next update.
                  </p>
                </div>
              )}
            </motion.div>
          </main>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileBottomNav
        notifications={{
          teams: 1
        }}
      />

      {/* Mobile Quick Action Button */}
      <MobileQuickAction />
    </div>
  );
}

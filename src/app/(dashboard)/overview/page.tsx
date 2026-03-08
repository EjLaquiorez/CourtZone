'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  Trophy, 
  Users, 
  MapPin, 
  Calendar,
  Star,
  TrendingUp,
  Target,
  Award,
  Activity,
  Clock,
  Zap,
  Heart
} from 'lucide-react';
import { AuthenticatedHeader } from '@/components/layout/header';
import { Sidebar, MobileSidebar } from '@/components/layout/sidebar';
import { MobileBottomNav, MobileQuickAction } from '@/components/layout/mobile-nav';
import { GameButton } from '@/components/ui/game-button';
import { StatCard } from '@/components/ui/stat-card';
import { GameCard } from '@/components/game/game-card';
import { TeamCard } from '@/components/game/team-card';
import { CourtCard } from '@/components/game/court-card';
import { cn } from '@/lib/utils';

const mockUser = {
  username: 'CourtKing23',
  avatar: '',
  rating: 1847
};

// Mock data for overview
const mockStats = {
  gamesPlayed: 47,
  winRate: 68,
  avgRating: 1847,
  skillLevel: 7,
  teamsJoined: 3,
  courtsVisited: 12,
  hoursPlayed: 156,
  achievements: 8
};

const mockRecentActivity = [
  {
    id: '1',
    type: 'game_completed',
    title: 'Won Friday Night Pickup',
    description: 'Great game at Venice Beach Courts',
    timestamp: new Date('2024-12-27T20:00:00'),
    icon: Trophy,
    color: 'text-court-400'
  },
  {
    id: '2',
    type: 'team_joined',
    title: 'Joined Thunder Bolts',
    description: 'Welcome to the team!',
    timestamp: new Date('2024-12-26T15:30:00'),
    icon: Users,
    color: 'text-blue-400'
  },
  {
    id: '3',
    type: 'court_reviewed',
    title: 'Reviewed Downtown Athletic Club',
    description: 'Gave 5 stars for excellent facilities',
    timestamp: new Date('2024-12-25T18:45:00'),
    icon: Star,
    color: 'text-yellow-400'
  },
  {
    id: '4',
    type: 'game_organized',
    title: 'Created Saturday Scrimmage',
    description: '8 players already joined',
    timestamp: new Date('2024-12-24T12:00:00'),
    icon: Calendar,
    color: 'text-primary-400'
  }
];

const mockAchievements = [
  { id: '1', name: 'First Game', description: 'Played your first game', icon: '🏀', unlocked: true },
  { id: '2', name: 'Team Player', description: 'Joined your first team', icon: '👥', unlocked: true },
  { id: '3', name: 'Court Explorer', description: 'Visited 10 different courts', icon: '🗺️', unlocked: true },
  { id: '4', name: 'Organizer', description: 'Organized 5 games', icon: '📅', unlocked: true },
  { id: '5', name: 'Streak Master', description: 'Won 5 games in a row', icon: '🔥', unlocked: false },
  { id: '6', name: 'Elite Player', description: 'Reach skill level 9', icon: '⭐', unlocked: false }
];

export default function OverviewPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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
            {/* Welcome Section */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-gradient-to-r from-primary-500/20 to-court-500/20 rounded-xl p-6 border border-primary-400/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-display font-bold text-white mb-2">
                      Welcome back, {mockUser.username}! 🏀
                    </h1>
                    <p className="text-primary-200 text-lg">
                      Ready to dominate the court? Here's your basketball journey overview.
                    </p>
                  </div>
                  <div className="hidden lg:block text-6xl opacity-20">
                    🏆
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <StatCard
                title="Games Played"
                value={mockStats.gamesPlayed}
                icon={<Trophy className="w-6 h-6" />}
                trend={{ direction: 'up', value: 5, label: 'this month' }}
                glowColor="primary"
              />
              <StatCard
                title="Win Rate"
                value={`${mockStats.winRate}%`}
                icon={<Target className="w-6 h-6" />}
                trend={{ direction: 'up', value: 3, label: 'this week' }}
                glowColor="success"
              />
              <StatCard
                title="Current Rating"
                value={mockStats.avgRating}
                icon={<Star className="w-6 h-6" />}
                trend={{ direction: 'up', value: 47, label: 'points' }}
                glowColor="warning"
              />
              <StatCard
                title="Skill Level"
                value={`${mockStats.skillLevel}/10`}
                icon={<TrendingUp className="w-6 h-6" />}
                trend={{ direction: 'neutral', value: 0, label: 'stable' }}
                glowColor="info"
              />
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-8">
                {/* Recent Activity */}
                <motion.div
                  className="bg-gradient-to-br from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-xl p-6 border border-primary-400/20"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-display font-bold text-white">Recent Activity</h2>
                    <GameButton variant="ghost" size="sm">View All</GameButton>
                  </div>

                  <div className="space-y-4">
                    {mockRecentActivity.map((activity, index) => {
                      const Icon = activity.icon;
                      return (
                        <motion.div
                          key={activity.id}
                          className="flex items-center space-x-4 p-4 bg-dark-200/50 rounded-lg hover:bg-dark-200/70 transition-colors"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                        >
                          <div className={cn('p-2 rounded-full bg-dark-300', activity.color)}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-primary-100">{activity.title}</h3>
                            <p className="text-sm text-primary-300">{activity.description}</p>
                          </div>
                          <span className="text-xs text-primary-400">
                            {activity.timestamp.toLocaleDateString()}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>

                {/* Performance Insights */}
                <motion.div
                  className="bg-gradient-to-br from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-xl p-6 border border-primary-400/20"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <h2 className="text-xl font-display font-bold text-white mb-6">Performance Insights</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-court-500/20 rounded-lg">
                      <Activity className="w-8 h-8 text-court-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-court-100 font-accent">{mockStats.hoursPlayed}</div>
                      <div className="text-sm text-court-300">Hours Played</div>
                    </div>
                    
                    <div className="text-center p-4 bg-blue-500/20 rounded-lg">
                      <MapPin className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-blue-100 font-accent">{mockStats.courtsVisited}</div>
                      <div className="text-sm text-blue-300">Courts Visited</div>
                    </div>
                    
                    <div className="text-center p-4 bg-yellow-500/20 rounded-lg">
                      <Award className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-yellow-100 font-accent">{mockStats.achievements}</div>
                      <div className="text-sm text-yellow-300">Achievements</div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Right Column */}
              <div className="space-y-8">
                {/* Quick Actions */}
                <motion.div
                  className="bg-gradient-to-br from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-xl p-6 border border-primary-400/20"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  <h2 className="text-xl font-display font-bold text-white mb-6">Quick Actions</h2>
                  
                  <div className="space-y-3">
                    <GameButton 
                      variant="primary" 
                      size="lg" 
                      className="w-full justify-start" 
                      icon={<Calendar className="w-5 h-5" />}
                      onClick={() => window.location.href = '/games/create'}
                    >
                      Create Game
                    </GameButton>
                    
                    <GameButton 
                      variant="secondary" 
                      size="lg" 
                      className="w-full justify-start" 
                      icon={<MapPin className="w-5 h-5" />}
                      onClick={() => window.location.href = '/courts'}
                    >
                      Find Courts
                    </GameButton>
                    
                    <GameButton 
                      variant="secondary" 
                      size="lg" 
                      className="w-full justify-start" 
                      icon={<Users className="w-5 h-5" />}
                      onClick={() => window.location.href = '/teams'}
                    >
                      Join Team
                    </GameButton>
                    
                    <GameButton 
                      variant="ghost" 
                      size="lg" 
                      className="w-full justify-start" 
                      icon={<Trophy className="w-5 h-5" />}
                      onClick={() => window.location.href = '/games'}
                    >
                      Browse Games
                    </GameButton>
                  </div>
                </motion.div>

                {/* Achievements */}
                <motion.div
                  className="bg-gradient-to-br from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-xl p-6 border border-primary-400/20"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                >
                  <h2 className="text-xl font-display font-bold text-white mb-6">Achievements</h2>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {mockAchievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className={cn(
                          'p-3 rounded-lg border text-center transition-all',
                          achievement.unlocked
                            ? 'bg-court-500/20 border-court-500/30 text-court-100'
                            : 'bg-dark-200/30 border-dark-200/50 text-primary-400'
                        )}
                      >
                        <div className="text-2xl mb-1">{achievement.icon}</div>
                        <div className="text-xs font-medium">{achievement.name}</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 text-center">
                    <GameButton variant="ghost" size="sm">
                      View All Achievements
                    </GameButton>
                  </div>
                </motion.div>

                {/* App Features */}
                <motion.div
                  className="bg-gradient-to-br from-primary-500/10 to-court-500/10 rounded-xl p-6 border border-primary-400/20"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.2 }}
                >
                  <h2 className="text-lg font-display font-bold text-white mb-4">
                    🚀 Laro Features
                  </h2>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-court-500 rounded-full" />
                      <span className="text-primary-200">Interactive court discovery with maps</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-primary-500 rounded-full" />
                      <span className="text-primary-200">Real-time game scheduling & chat</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span className="text-primary-200">Team management & lineup builder</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                      <span className="text-primary-200">Player ratings & skill matching</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileBottomNav />
      
      {/* Mobile Quick Action Button */}
      <MobileQuickAction />
    </div>
  );
}

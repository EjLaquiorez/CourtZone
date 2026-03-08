'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
  Trophy,
  Star,
  Target,
  Users,
  Calendar,
  TrendingUp,
  Award,
  Search,
  Filter,
  Share2,
  Lock,
  CheckCircle,
  BarChart3,
  Zap,
  Crown,
  Medal,
  Flame
} from 'lucide-react';
import { AuthenticatedHeader } from '@/components/layout/header';
import { Sidebar, MobileSidebar } from '@/components/layout/sidebar';
import { MobileBottomNav, MobileQuickAction } from '@/components/layout/mobile-nav';
import { PageErrorBoundary } from '@/components/error/error-boundary';
import { GameButton } from '@/components/ui/game-button';
import { StatCard } from '@/components/ui/stat-card';
import { cn } from '@/lib/utils';
import type { User as UserType } from '@/types';

// Mock user data
const mockUser: UserType = {
  id: 'user1',
  username: 'ThunderCap',
  email: 'thunder@example.com',
  avatar: '',
  position: 'PG',
  skillLevel: 8,
  rating: 1847,
  city: 'Los Angeles',
  maxDistance: 25,
  isVerified: true,
  createdAt: new Date('2023-06-15'),
  updatedAt: new Date()
};

// Achievement types and categories
type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum';
type AchievementCategory = 'scoring' | 'teamwork' | 'participation' | 'skill' | 'special';

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  tier: AchievementTier;
  icon: string;
  points: number;
  requirement: string;
  progress?: {
    current: number;
    target: number;
  };
  isUnlocked: boolean;
  unlockedAt?: Date;
  rarity: number; // 1-100, lower is rarer
}

// Mock achievements data
const mockAchievements: Achievement[] = [
  // Scoring Achievements
  {
    id: 'first-basket',
    name: 'First Bucket',
    description: 'Score your first basket in a game',
    category: 'scoring',
    tier: 'bronze',
    icon: '🏀',
    points: 10,
    requirement: 'Score 1 basket',
    isUnlocked: true,
    unlockedAt: new Date('2023-06-20'),
    rarity: 95
  },
  {
    id: 'sharpshooter',
    name: 'Sharpshooter',
    description: 'Make 10 three-pointers in a single game',
    category: 'scoring',
    tier: 'gold',
    icon: '🎯',
    points: 100,
    requirement: 'Make 10 three-pointers in one game',
    progress: { current: 7, target: 10 },
    isUnlocked: false,
    rarity: 15
  },
  {
    id: 'century-club',
    name: 'Century Club',
    description: 'Score 100 total points across all games',
    category: 'scoring',
    tier: 'silver',
    icon: '💯',
    points: 50,
    requirement: 'Score 100 total points',
    isUnlocked: true,
    unlockedAt: new Date('2023-08-15'),
    rarity: 60
  },

  // Teamwork Achievements
  {
    id: 'assist-master',
    name: 'Assist Master',
    description: 'Record 15 assists in a single game',
    category: 'teamwork',
    tier: 'gold',
    icon: '🤝',
    points: 100,
    requirement: 'Get 15 assists in one game',
    progress: { current: 12, target: 15 },
    isUnlocked: false,
    rarity: 20
  },
  {
    id: 'team-player',
    name: 'Team Player',
    description: 'Play 50 games with different teammates',
    category: 'teamwork',
    tier: 'silver',
    icon: '👥',
    points: 75,
    requirement: 'Play with 50 different teammates',
    isUnlocked: true,
    unlockedAt: new Date('2023-12-01'),
    rarity: 40
  },

  // Participation Achievements
  {
    id: 'court-explorer',
    name: 'Court Explorer',
    description: 'Play at 10 different courts',
    category: 'participation',
    tier: 'bronze',
    icon: '🗺️',
    points: 25,
    requirement: 'Play at 10 different courts',
    isUnlocked: true,
    unlockedAt: new Date('2023-11-10'),
    rarity: 70
  },
  {
    id: 'marathon-player',
    name: 'Marathon Player',
    description: 'Play for 100 total hours',
    category: 'participation',
    tier: 'platinum',
    icon: '⏰',
    points: 200,
    requirement: 'Play for 100 hours total',
    progress: { current: 87, target: 100 },
    isUnlocked: false,
    rarity: 5
  },

  // Skill Achievements
  {
    id: 'triple-double',
    name: 'Triple Double',
    description: 'Achieve a triple-double in any game',
    category: 'skill',
    tier: 'gold',
    icon: '⭐',
    points: 150,
    requirement: 'Get double digits in 3 stat categories',
    isUnlocked: true,
    unlockedAt: new Date('2024-01-15'),
    rarity: 25
  },
  {
    id: 'defensive-wall',
    name: 'Defensive Wall',
    description: 'Record 10 blocks in a single game',
    category: 'skill',
    tier: 'silver',
    icon: '🛡️',
    points: 75,
    requirement: 'Get 10 blocks in one game',
    progress: { current: 6, target: 10 },
    isUnlocked: false,
    rarity: 30
  },

  // Special Achievements
  {
    id: 'buzzer-beater',
    name: 'Buzzer Beater',
    description: 'Win a game with a shot in the final 3 seconds',
    category: 'special',
    tier: 'platinum',
    icon: '🚨',
    points: 250,
    requirement: 'Win with a buzzer beater shot',
    isUnlocked: false,
    rarity: 3
  },
  {
    id: 'perfect-game',
    name: 'Perfect Game',
    description: 'Shoot 100% from the field (min. 10 attempts)',
    category: 'special',
    tier: 'platinum',
    icon: '💎',
    points: 300,
    requirement: 'Perfect shooting game (10+ attempts)',
    isUnlocked: false,
    rarity: 1
  }
];

const categoryInfo = {
  scoring: { name: 'Scoring', icon: Target, color: 'from-orange-400 to-orange-600', emoji: '🎯' },
  teamwork: { name: 'Teamwork', icon: Users, color: 'from-blue-400 to-blue-600', emoji: '🤝' },
  participation: { name: 'Participation', icon: Calendar, color: 'from-green-400 to-green-600', emoji: '📅' },
  skill: { name: 'Skill', icon: Star, color: 'from-purple-400 to-purple-600', emoji: '⭐' },
  special: { name: 'Special', icon: Crown, color: 'from-yellow-400 to-yellow-600', emoji: '👑' }
};

const tierInfo = {
  bronze: { name: 'Bronze', color: 'from-orange-600 to-orange-800', textColor: 'text-orange-400' },
  silver: { name: 'Silver', color: 'from-gray-400 to-gray-600', textColor: 'text-gray-300' },
  gold: { name: 'Gold', color: 'from-yellow-400 to-yellow-600', textColor: 'text-yellow-400' },
  platinum: { name: 'Platinum', color: 'from-cyan-400 to-cyan-600', textColor: 'text-cyan-400' }
};

function AchievementsPageContent() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all');
  const [selectedTier, setSelectedTier] = useState<AchievementTier | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);

  // Filter achievements
  const filteredAchievements = mockAchievements.filter(achievement => {
    const matchesCategory = selectedCategory === 'all' || achievement.category === selectedCategory;
    const matchesTier = selectedTier === 'all' || achievement.tier === selectedTier;
    const matchesSearch = achievement.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         achievement.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesUnlocked = !showUnlockedOnly || achievement.isUnlocked;

    return matchesCategory && matchesTier && matchesSearch && matchesUnlocked;
  });

  // Calculate stats
  const totalAchievements = mockAchievements.length;
  const unlockedAchievements = mockAchievements.filter(a => a.isUnlocked).length;
  const totalPoints = mockAchievements.filter(a => a.isUnlocked).reduce((sum, a) => sum + a.points, 0);
  const completionPercentage = Math.round((unlockedAchievements / totalAchievements) * 100);

  const handleShare = (achievement: Achievement) => {
    // In real app, this would share to social media or copy link
    console.log('Sharing achievement:', achievement.name);
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
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center basketball-glow">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-display font-bold text-white">Achievements</h1>
                  <p className="text-primary-300">Track your basketball journey and unlock rewards</p>
                </div>
              </div>
            </motion.div>

            {/* Stats Overview */}
            <motion.div
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <StatCard
                title="Unlocked"
                value={`${unlockedAchievements}/${totalAchievements}`}
                icon={<CheckCircle className="w-6 h-6" />}
                glowColor="success"
              />
              <StatCard
                title="Completion"
                value={`${completionPercentage}%`}
                icon={<BarChart3 className="w-6 h-6" />}
                glowColor="info"
              />
              <StatCard
                title="Total Points"
                value={totalPoints.toLocaleString()}
                icon={<Star className="w-6 h-6" />}
                glowColor="warning"
              />
              <StatCard
                title="Rarest Badge"
                value="Perfect Game"
                icon={<Medal className="w-6 h-6" />}
                glowColor="primary"
              />
            </motion.div>

            {/* Filters and Search */}
            <motion.div
              className="bg-gradient-to-br from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-xl p-6 border border-primary-400/20 mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                {/* Search */}
                <div className="relative flex-1 lg:max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-400" />
                  <input
                    type="text"
                    placeholder="Search achievements..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-dark-200/50 border border-primary-400/30 rounded-lg text-white placeholder-primary-400 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400"
                  />
                </div>

                {/* Filters */}
                <div className="flex items-center space-x-4">
                  {/* Category Filter */}
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as AchievementCategory | 'all')}
                    className="px-4 py-2 bg-dark-200/50 border border-primary-400/30 rounded-lg text-white focus:outline-none focus:border-primary-400"
                  >
                    <option value="all">All Categories</option>
                    {Object.entries(categoryInfo).map(([key, info]) => (
                      <option key={key} value={key}>{info.name}</option>
                    ))}
                  </select>

                  {/* Tier Filter */}
                  <select
                    value={selectedTier}
                    onChange={(e) => setSelectedTier(e.target.value as AchievementTier | 'all')}
                    className="px-4 py-2 bg-dark-200/50 border border-primary-400/30 rounded-lg text-white focus:outline-none focus:border-primary-400"
                  >
                    <option value="all">All Tiers</option>
                    {Object.entries(tierInfo).map(([key, info]) => (
                      <option key={key} value={key}>{info.name}</option>
                    ))}
                  </select>

                  {/* Show Unlocked Only */}
                  <label className="flex items-center space-x-2 text-primary-300">
                    <input
                      type="checkbox"
                      checked={showUnlockedOnly}
                      onChange={(e) => setShowUnlockedOnly(e.target.checked)}
                      className="rounded border-primary-400/30 bg-dark-200/50 text-primary-500 focus:ring-primary-400"
                    />
                    <span className="text-sm">Unlocked only</span>
                  </label>
                </div>
              </div>
            </motion.div>

            {/* Achievements Grid */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <AnimatePresence>
                {filteredAchievements.map((achievement, index) => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    index={index}
                    onShare={handleShare}
                  />
                ))}
              </AnimatePresence>
            </motion.div>

            {/* No Results */}
            {filteredAchievements.length === 0 && (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <div className="w-24 h-24 bg-dark-300/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-12 h-12 text-primary-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No achievements found</h3>
                <p className="text-primary-300">Try adjusting your filters or search terms</p>
              </motion.div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileBottomNav
        notifications={{
          achievements: 2 // New achievements available
        }}
      />

      {/* Mobile Quick Action Button */}
      <MobileQuickAction />
    </div>
  );
}

// Achievement Card Component
interface AchievementCardProps {
  achievement: Achievement;
  index: number;
  onShare: (achievement: Achievement) => void;
}

function AchievementCard({ achievement, index, onShare }: AchievementCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const category = categoryInfo[achievement.category];
  const tier = tierInfo[achievement.tier];

  const getRarityLabel = (rarity: number) => {
    if (rarity <= 5) return 'Legendary';
    if (rarity <= 15) return 'Epic';
    if (rarity <= 30) return 'Rare';
    if (rarity <= 60) return 'Uncommon';
    return 'Common';
  };

  const getRarityColor = (rarity: number) => {
    if (rarity <= 5) return 'text-purple-400';
    if (rarity <= 15) return 'text-yellow-400';
    if (rarity <= 30) return 'text-blue-400';
    if (rarity <= 60) return 'text-green-400';
    return 'text-gray-400';
  };

  return (
    <motion.div
      className={cn(
        'bg-gradient-to-br from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-xl p-6 border transition-all duration-300 cursor-pointer',
        achievement.isUnlocked
          ? 'border-primary-400/20 hover:border-primary-400/40'
          : 'border-gray-600/20 hover:border-gray-600/40'
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -5 }}
      onClick={() => setShowDetails(!showDetails)}
    >
      {/* Achievement Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {/* Achievement Icon */}
          <div className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center text-xl relative',
            achievement.isUnlocked
              ? `bg-gradient-to-br ${tier.color}`
              : 'bg-gray-600/50'
          )}>
            {achievement.isUnlocked ? achievement.icon : <Lock className="w-6 h-6 text-gray-400" />}

            {/* Tier Badge */}
            <div className={cn(
              'absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-dark-400',
              `bg-gradient-to-br ${tier.color}`
            )} />
          </div>

          {/* Achievement Info */}
          <div className="flex-1">
            <h3 className={cn(
              'font-bold text-lg',
              achievement.isUnlocked ? 'text-white' : 'text-gray-400'
            )}>
              {achievement.name}
            </h3>
            <div className="flex items-center space-x-2 text-sm">
              <span className={tier.textColor}>{tier.name}</span>
              <span className="text-primary-400">•</span>
              <span className={getRarityColor(achievement.rarity)}>
                {getRarityLabel(achievement.rarity)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {achievement.isUnlocked && (
          <div className="flex items-center space-x-2">
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                onShare(achievement);
              }}
              className="p-2 rounded-lg text-primary-400 hover:text-primary-300 hover:bg-primary-400/10 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Share2 className="w-4 h-4" />
            </motion.button>
          </div>
        )}
      </div>

      {/* Achievement Description */}
      <p className={cn(
        'text-sm mb-4',
        achievement.isUnlocked ? 'text-primary-300' : 'text-gray-500'
      )}>
        {achievement.description}
      </p>

      {/* Progress Bar (for incomplete achievements) */}
      {!achievement.isUnlocked && achievement.progress && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-primary-400">Progress</span>
            <span className="text-primary-300">
              {achievement.progress.current}/{achievement.progress.target}
            </span>
          </div>
          <div className="w-full bg-dark-200/50 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{
                width: `${(achievement.progress.current / achievement.progress.target) * 100}%`
              }}
              transition={{ duration: 1, delay: index * 0.1 }}
            />
          </div>
        </div>
      )}

      {/* Achievement Details (Expandable) */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-primary-400/20 pt-4 mt-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-primary-400">Category</span>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{category.emoji}</span>
                  <span className="text-sm text-primary-300">{category.name}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-primary-400">Points</span>
                <span className="text-sm text-primary-300">{achievement.points}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-primary-400">Requirement</span>
                <span className="text-sm text-primary-300 text-right max-w-48">
                  {achievement.requirement}
                </span>
              </div>

              {achievement.isUnlocked && achievement.unlockedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-primary-400">Unlocked</span>
                  <span className="text-sm text-primary-300">
                    {achievement.unlockedAt.toLocaleDateString()}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-primary-400">Rarity</span>
                <span className={cn('text-sm', getRarityColor(achievement.rarity))}>
                  {achievement.rarity}% of players
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unlock Animation Effect */}
      {achievement.isUnlocked && (
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.3, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        >
          <div className={cn(
            'absolute inset-0 rounded-xl',
            `bg-gradient-to-br ${tier.color} opacity-20`
          )} />
        </motion.div>
      )}
    </motion.div>
  );
}

export default function AchievementsPage() {
  return (
    <PageErrorBoundary>
      <AchievementsPageContent />
    </PageErrorBoundary>
  );
}
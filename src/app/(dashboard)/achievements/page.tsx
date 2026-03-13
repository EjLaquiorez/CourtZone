'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import {
  Trophy,
  Star,
  Target,
  Users,
  Calendar,
  TrendingUp,
  Award,
  Search,
  Share2,
  Lock,
  CheckCircle,
  BarChart3,
  Zap,
  Crown,
  Medal,
  Flame,
  MapPin
} from 'lucide-react';
import { AuthenticatedHeader } from '@/components/layout/header';
import { Sidebar, MobileSidebar } from '@/components/layout/sidebar';
import { MobileBottomNav } from '@/components/layout/mobile-nav';
import { PageErrorBoundary } from '@/components/error/error-boundary';
import { StatCard } from '@/components/ui/stat-card';
import { cn } from '@/lib/utils';
import type { User as UserType } from '@/types';
import { useCurrentUser, useUserStats } from '@/lib/hooks/use-api';
import { CATEGORY_LABELS, BADGE_DEFINITIONS, PHASE_1_BADGE_IDS, type BadgeCategory } from '@/config/achievements';

// Achievement from API (full metadata + progress)
type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum';

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: BadgeCategory;
  tier: AchievementTier;
  icon: string;
  points: number;
  perkSummary: string;
  progress?: { current: number; target: number };
  isUnlocked: boolean;
  rarity: number;
}

const tierInfo = {
  bronze: { name: 'Bronze', color: 'from-orange-600 to-orange-800', textColor: 'text-orange-400' },
  silver: { name: 'Silver', color: 'from-gray-400 to-gray-600', textColor: 'text-gray-300' },
  gold: { name: 'Gold', color: 'from-yellow-400 to-yellow-600', textColor: 'text-yellow-400' },
  platinum: { name: 'Platinum', color: 'from-cyan-400 to-cyan-600', textColor: 'text-cyan-400' }
};

const categoryInfo: Record<BadgeCategory, { name: string; icon: typeof Calendar; color: string; emoji: string }> = {
  onboarding: { name: CATEGORY_LABELS.onboarding, icon: Target, color: 'from-emerald-400 to-emerald-600', emoji: '🆔' },
  reliability_foundation: { name: CATEGORY_LABELS.reliability_foundation, icon: CheckCircle, color: 'from-blue-400 to-blue-600', emoji: '✅' },
  punctuality: { name: CATEGORY_LABELS.punctuality, icon: Zap, color: 'from-amber-400 to-amber-600', emoji: '⏰' },
  community_builder: { name: CATEGORY_LABELS.community_builder, icon: Users, color: 'from-purple-400 to-purple-600', emoji: '🏠' },
  consistency_loyalty: { name: CATEGORY_LABELS.consistency_loyalty, icon: Calendar, color: 'from-green-400 to-green-600', emoji: '📅' },
  social_culture: { name: CATEGORY_LABELS.social_culture, icon: Award, color: 'from-pink-400 to-pink-600', emoji: '🤝' },
  rare_legendary: { name: CATEGORY_LABELS.rare_legendary, icon: Crown, color: 'from-cyan-400 to-cyan-600', emoji: '👑' }
};

function AchievementsPageContent() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<BadgeCategory | 'all'>('all');
  const [selectedTier, setSelectedTier] = useState<AchievementTier | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);

  const { data: currentUserResponse } = useCurrentUser();
  const user = currentUserResponse?.data as UserType | undefined;

  const { data: statsResponse } = useUserStats(
    user?.id || '',
    undefined,
    'all'
  );

  const apiAchievements = (statsResponse?.data?.achievements || []) as Array<{
    id: string;
    name: string;
    description: string;
    tier: AchievementTier;
    category: BadgeCategory;
    icon: string;
    points: number;
    perkSummary: string;
    isUnlocked: boolean;
    progress?: { current: number; target: number };
  }>;

  const topBadges = (statsResponse?.data?.topBadges || []) as Array<{
    id: string;
    name: string;
    description: string;
    tier: AchievementTier;
    category: BadgeCategory;
    icon: string;
    points: number;
    isUnlocked: boolean;
  }>;

  // When API hasn't returned top badges, show first 3 Phase 1 badges as placeholders so players see what's there
  const displayTopBadges = useMemo(() => {
    if (topBadges.length > 0) return topBadges;
    return BADGE_DEFINITIONS.filter((b) => PHASE_1_BADGE_IDS.has(b.id))
      .slice(0, 3)
      .map((b) => ({
        id: b.id,
        name: b.name,
        description: b.description,
        tier: b.tier as AchievementTier,
        category: b.category,
        icon: b.icon,
        points: b.points,
        isUnlocked: false
      }));
  }, [topBadges]);

  const tierRarity: Record<AchievementTier, number> = {
    platinum: 10,
    gold: 25,
    silver: 50,
    bronze: 80
  };

  // Build full badge list: always show all Phase 1 badges (from config), merge API progress when available
  const apiById = useMemo(() => {
    const map = new Map<string, (typeof apiAchievements)[number]>();
    apiAchievements.forEach((a) => map.set(a.id, a));
    return map;
  }, [apiAchievements]);

  const mappedAchievements: Achievement[] = useMemo(() => {
    const phase1Defs = BADGE_DEFINITIONS.filter((b) => PHASE_1_BADGE_IDS.has(b.id));
    return phase1Defs.map((def) => {
      const fromApi = apiById.get(def.id);
      if (fromApi) {
        return {
          id: fromApi.id,
          name: fromApi.name,
          description: fromApi.description,
          category: fromApi.category,
          tier: fromApi.tier as AchievementTier,
          icon: fromApi.icon,
          points: fromApi.points,
          perkSummary: fromApi.perkSummary,
          progress: fromApi.progress,
          isUnlocked: fromApi.isUnlocked,
          rarity: tierRarity[fromApi.tier] ?? 50
        };
      }
      // No API data: show badge as locked so player sees what's there
      return {
        id: def.id,
        name: def.name,
        description: def.description,
        category: def.category,
        tier: def.tier as AchievementTier,
        icon: def.icon,
        points: def.points,
        perkSummary: def.perkSummary,
        progress: undefined,
        isUnlocked: false,
        rarity: tierRarity[def.tier] ?? 50
      };
    });
  }, [apiById, tierRarity]);

  // Filter achievements
  const filteredAchievements = mappedAchievements.filter(achievement => {
    const matchesCategory = selectedCategory === 'all' || achievement.category === selectedCategory;
    const matchesTier = selectedTier === 'all' || achievement.tier === selectedTier;
    const matchesSearch = achievement.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         achievement.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesUnlocked = !showUnlockedOnly || achievement.isUnlocked;

    return matchesCategory && matchesTier && matchesSearch && matchesUnlocked;
  });

  // Group by category for display (spec order)
  const categoryOrder: BadgeCategory[] = [
    'onboarding',
    'reliability_foundation',
    'punctuality',
    'community_builder',
    'consistency_loyalty',
    'social_culture',
    'rare_legendary'
  ];
  const byCategory = useMemo(() => {
    const map = new Map<BadgeCategory, Achievement[]>();
    categoryOrder.forEach((cat) => map.set(cat, []));
    filteredAchievements.forEach((a) => {
      const list = map.get(a.category);
      if (list) list.push(a);
    });
    return map;
  }, [filteredAchievements]);

  // Calculate stats (unlocked achievements coming from API)
  const totalAchievements = mappedAchievements.length;
  const unlockedAchievements = mappedAchievements.filter(a => a.isUnlocked).length;
  const totalPoints = mappedAchievements.filter(a => a.isUnlocked).reduce((sum, a) => sum + a.points, 0);
  const completionPercentage = totalAchievements > 0
    ? Math.round((unlockedAchievements / totalAchievements) * 100)
    : 0;
  const rarestUnlocked = mappedAchievements
    .filter(a => a.isUnlocked)
    .sort((a, b) => a.rarity - b.rarity)[0];

  const handleShare = (achievement: Achievement) => {
    const text = `I just earned ${achievement.name} on CourtZone`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title: 'CourtZone Achievement', text }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(text);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 lg:h-screen lg:overflow-hidden">
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
            user={user || { username: 'Player', avatar: '', rating: 0 } as UserType}
            onMenuToggle={() => setMobileSidebarOpen(true)}
          />

          {/* Page Content */}
          <main className="p-4 lg:flex-1 lg:overflow-y-auto lg:p-8">
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
                  <h1 className="text-3xl font-display font-bold text-white">Trophy Room</h1>
                  <p className="text-primary-300">
                    Reliability and participation achievements. Show up, host, and build the scene.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Top 3 profile badges */}
            {displayTopBadges.length > 0 && (
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <h2 className="text-lg font-display font-semibold text-white mb-3">Your top badges</h2>
                <div className="flex flex-wrap gap-3">
                  {displayTopBadges.map((badge, i) => (
                    <div
                      key={badge.id}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-xl border',
                        badge.isUnlocked
                          ? 'bg-primary-500/20 border-primary-400/40'
                          : 'bg-dark-300/50 border-dark-500'
                      )}
                    >
                      <span className="text-xl">{badge.icon}</span>
                      <span className={badge.isUnlocked ? 'text-white font-medium' : 'text-primary-400'}>
                        {badge.name}
                      </span>
                      {!badge.isUnlocked && <Lock className="w-4 h-4 text-primary-500" />}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

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
                value={rarestUnlocked?.name ?? '—'}
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
                    onChange={(e) => setSelectedCategory(e.target.value as BadgeCategory | 'all')}
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

            {/* Achievements Grid by Category */}
            <motion.div
              className="space-y-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              {categoryOrder.map((cat) => {
                const list = byCategory.get(cat) || [];
                if (list.length === 0) return null;
                const info = categoryInfo[cat];
                return (
                  <div key={cat}>
                    <h3 className="text-lg font-display font-semibold text-white mb-4 flex items-center gap-2">
                      <span>{info.emoji}</span>
                      {info.name}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      <AnimatePresence>
                        {list.map((achievement, index) => (
                          <AchievementCard
                            key={achievement.id}
                            achievement={achievement}
                            index={index}
                            onShare={handleShare}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })}
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
            <span className={achievement.isUnlocked ? '' : 'opacity-70'}>
              {achievement.icon}
            </span>
            {!achievement.isUnlocked && (
              <Lock className="absolute -bottom-0.5 -right-0.5 w-4 h-4 text-gray-500 bg-dark-400 rounded-full p-0.5" />
            )}
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

      {/* Progress Bar (for incomplete achievements with progress) */}
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
                <span className="text-sm text-primary-400">Perk</span>
                <span className="text-sm text-primary-300 text-right max-w-48">
                  {achievement.perkSummary}
                </span>
              </div>

              {achievement.isUnlocked && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-primary-400">Status</span>
                  <span className="text-sm text-primary-300">Unlocked</span>
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
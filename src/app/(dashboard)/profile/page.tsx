'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';
import {
  User,
  Edit3,
  Camera,
  Trophy,
  Calendar,
  Star,
  Target,
  TrendingUp,
  Award,
  MapPin,
  Settings,
  Save,
  X,
  UserPlus,
  Clock
} from 'lucide-react';
import { AuthenticatedHeader } from '@/components/layout/header';
import { Sidebar, MobileSidebar } from '@/components/layout/sidebar';
import { MobileBottomNav } from '@/components/layout/mobile-nav';
import { PageErrorBoundary } from '@/components/error/error-boundary';
import { GameButton } from '@/components/ui/game-button';
import { StatCard } from '@/components/ui/stat-card';
import { BasketballProfileForm } from '@/components/forms/basketball-profile-form';
import { cn } from '@/lib/utils';
import type { User as UserType, Position } from '@/types';
import { useCurrentUser } from '@/lib/hooks/use-api';
import { BasketballProfileFormData } from '@/lib/validation';
import { useToastHelpers } from '@/components/ui/toast';
import { useUpdateBasketballProfile, transformUserToBasketballProfile } from '@/lib/hooks/use-basketball-profile';

// Utility function to safely format dates - completely bulletproof
const formatDate = (date: any, fallback: string = 'Recently'): string => {
  try {
    // Handle null, undefined, empty string, or invalid values
    if (!date || date === 'null' || date === 'undefined' || date === '') {
      return fallback;
    }

    // Handle string dates that might be invalid
    if (typeof date === 'string' && (date === 'Invalid Date' || date.length < 4)) {
      return fallback;
    }

    // Try to create a Date object
    const dateObj = new Date(date);

    // Check if the date is valid
    if (isNaN(dateObj.getTime()) || dateObj.getTime() === 0) {
      return fallback;
    }

    // Additional check for reasonable date range (not too far in past/future)
    const now = new Date();
    const yearDiff = Math.abs(now.getFullYear() - dateObj.getFullYear());
    if (yearDiff > 100) {
      return fallback;
    }

    // Finally, try to format the date
    return dateObj.toLocaleDateString();
  } catch (error) {
    console.warn('Date formatting error:', error, 'for date:', date);
    return fallback;
  }
};

// Mock achievements data
const mockAchievements = [
  {
    id: '1',
    name: 'Triple Double Master',
    description: 'Achieved 5 triple doubles',
    iconUrl: '🏀',
    badgeType: 'gold' as const,
    earnedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Team Player',
    description: 'Played 100 games',
    iconUrl: '👥',
    badgeType: 'silver' as const,
    earnedAt: new Date('2023-12-20')
  },
  {
    id: '3',
    name: 'Court Explorer',
    description: 'Played at 10 different courts',
    iconUrl: '🗺️',
    badgeType: 'bronze' as const,
    earnedAt: new Date('2023-11-10')
  }
];

// Mock recent games
const mockRecentGames = [
  {
    id: '1',
    opponent: 'Street Warriors',
    result: 'W',
    score: '78-65',
    date: new Date('2024-01-20'),
    court: 'Venice Beach Courts'
  },
  {
    id: '2',
    opponent: 'City Ballers',
    result: 'L',
    score: '82-89',
    date: new Date('2024-01-18'),
    court: 'Downtown Athletic Club'
  },
  {
    id: '3',
    opponent: 'Hoop Dreams',
    result: 'W',
    score: '91-76',
    date: new Date('2024-01-15'),
    court: 'UCLA Recreation Center'
  }
];

function ProfilePageContent() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showBasketballForm, setShowBasketballForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToastHelpers();
  const updateBasketballProfile = useUpdateBasketballProfile();

  // Fetch current user data
  const { data: currentUserResponse, isLoading } = useCurrentUser();
  const user = currentUserResponse?.data || {
    id: '',
    username: 'Loading...',
    email: '',
    avatar: '',
    position: 'PG' as const,
    skillLevel: 0,
    rating: 0,
    city: '',
    maxDistance: 0,
    isVerified: false,
    createdAt: null,
    updatedAt: null
  };

  // Ensure user object has safe date values
  const safeUser = {
    ...user,
    createdAt: user.createdAt || new Date(),
    updatedAt: user.updatedAt || new Date()
  };

  const [editedUser, setEditedUser] = useState(safeUser);

  const handleSaveProfile = () => {
    // In real app, this would call an API
    console.log('Saving profile:', editedUser);
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  const handleCancelEdit = () => {
    setEditedUser(safeUser);
    setIsEditing(false);
  };

  const handleBasketballProfileSubmit = async (data: BasketballProfileFormData) => {
    try {
      await updateBasketballProfile.mutateAsync(data);
      const hasRequired = data.username && data.position && (data.skillLevel ?? 0) > 0;
      toast.success(
        hasRequired
          ? 'Profile updated! You’ve unlocked the Rookie Card. Check your dashboard — the completion banner is gone and your badge is in the Trophy Room.'
          : 'Basketball profile updated successfully!'
      );
      setShowBasketballForm(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update basketball profile');
    }
  };

  const handleBasketballFormCancel = () => {
    setShowBasketballForm(false);
  };

  const getPositionName = (position: Position) => {
    const positions = {
      PG: 'Point Guard',
      SG: 'Shooting Guard',
      SF: 'Small Forward',
      PF: 'Power Forward',
      C: 'Center'
    };
    return positions[position];
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'gold': return 'from-yellow-400 to-yellow-600';
      case 'silver': return 'from-gray-300 to-gray-500';
      case 'bronze': return 'from-orange-400 to-orange-600';
      default: return 'from-primary-400 to-primary-600';
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
            user={safeUser}
            onMenuToggle={() => setMobileSidebarOpen(true)}
          />

          {/* Page Content */}
          <main className="p-4 lg:flex-1 lg:overflow-y-auto lg:p-8">
            {/* Basketball Profile Form Modal */}
            {showBasketballForm && (
              <motion.div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="bg-gradient-to-br from-dark-800 to-dark-900 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-display font-bold text-white">
                        Complete Your Basketball Profile
                      </h2>
                      <button
                        onClick={handleBasketballFormCancel}
                        className="text-primary-300 hover:text-white transition-colors"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    <BasketballProfileForm
                      initialData={transformUserToBasketballProfile(safeUser)}
                      onSubmit={handleBasketballProfileSubmit}
                      onCancel={handleBasketballFormCancel}
                      isLoading={updateBasketballProfile.isPending}
                    />
                  </div>
                </motion.div>
              </motion.div>
            )}
            {/* New profile header + two-column layout */}
            <div className="mx-auto flex max-w-6xl flex-col gap-6">
              {/* Header */}
              <motion.section
                className="rounded-2xl border border-primary-400/20 bg-gradient-to-r from-dark-800/90 to-dark-700/90 p-6 shadow-basketball sm:p-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex flex-col gap-6 md:flex-row md:items-center">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-4xl text-white shadow-lg md:h-28 md:w-28">
                      {safeUser.avatar ? (
                        <img
                          src={safeUser.avatar}
                          alt={safeUser.username || 'Player'}
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        <span>{(safeUser.username || 'P').charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <span className="absolute -bottom-1 -right-1 inline-flex h-7 items-center justify-center rounded-full bg-court-500 px-2 text-[11px] font-semibold text-white shadow-md">
                      {getPositionName(safeUser.position as Position)}
                    </span>
                  </div>

                  {/* Identity & quick stats */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h1 className="flex items-center gap-2 text-2xl font-display font-bold text-white sm:text-3xl">
                          {safeUser.username || 'Player Name'}
                          {safeUser.isVerified && (
                            <span className="inline-flex items-center rounded-full border border-primary-400/40 bg-primary-500/20 px-2 py-0.5 text-[11px] font-semibold text-primary-200">
                              <Star className="mr-1 h-3 w-3 fill-current" />
                              Verified
                            </span>
                          )}
                        </h1>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-primary-300">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-primary-400" />
                            {safeUser.city || 'Add your city'}
                          </span>
                          <span className="text-primary-500/60">•</span>
                          <span>Max {safeUser.maxDistance || 10} km</span>
                          <span className="text-primary-500/60">•</span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3 text-court-400" />
                            Evenings · Weekends
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        <GameButton
                          variant="primary"
                          size="sm"
                          glow
                          icon={<UserPlus className="h-4 w-4" />}
                        >
                          Invite to game
                        </GameButton>
                        <GameButton
                          variant="secondary"
                          size="sm"
                          icon={<User className="h-4 w-4" />}
                        >
                          Add friend
                        </GameButton>
                        <GameButton
                          variant="ghost"
                          size="sm"
                          icon={<Edit3 className="h-4 w-4" />}
                          onClick={() => setShowBasketballForm(true)}
                        >
                          Edit profile
                        </GameButton>
                      </div>
                    </div>

                    {/* Compact metrics strip */}
                    <div className="mt-3 grid grid-cols-2 gap-4 text-xs text-primary-300 sm:grid-cols-4">
                      <div>
                        <p className="mb-1 text-[11px] uppercase tracking-wide text-primary-400">
                          Rating
                        </p>
                        <p className="text-lg font-display font-semibold text-white">
                          {safeUser.rating || 0}
                        </p>
                      </div>
                      <div>
                        <p className="mb-1 text-[11px] uppercase tracking-wide text-primary-400">
                          Games
                        </p>
                        <p className="text-lg font-display font-semibold text-white">
                          {safeUser.gamesPlayed ?? 0}
                        </p>
                      </div>
                      <div>
                        <p className="mb-1 text-[11px] uppercase tracking-wide text-primary-400">
                          Win rate
                        </p>
                        <p className="text-lg font-display font-semibold text-white">
                          {safeUser.gamesPlayed
                            ? Math.round(((safeUser.gamesCompleted ?? 0) / (safeUser.gamesPlayed || 1)) * 100)
                            : 0}
                          %
                        </p>
                      </div>
                      <div>
                        <p className="mb-1 text-[11px] uppercase tracking-wide text-primary-400">
                          Active
                        </p>
                        <p className="text-lg font-display font-semibold text-white">
                          {formatDate(safeUser.updatedAt, 'Recently')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.section>

              {/* Two-column content */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]">
              {/* Recent Games */}
              <motion.div
                className="bg-gradient-to-br from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-xl p-6 border border-primary-400/20"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-display font-bold text-white">Recent Games</h2>
                  <GameButton variant="ghost" size="sm">
                    View All
                  </GameButton>
                </div>

                <div className="space-y-4">
                  {mockRecentGames.map((game, index) => (
                    <motion.div
                      key={game.id}
                      className="flex items-center justify-between p-4 bg-dark-200/50 rounded-lg border border-primary-400/10"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={cn(
                          "w-3 h-3 rounded-full",
                          game.result === 'W' ? 'bg-court-500' : 'bg-red-500'
                        )} />
                        <div>
                          <p className="font-medium text-primary-100">
                            vs {game.opponent}
                          </p>
                          <p className="text-sm text-primary-300">
                            {game.score} • {(() => {
                              try {
                                return formatDate(game.date, 'Recent');
                              } catch (error) {
                                console.warn('Error formatting game date:', error);
                                return 'Recent';
                              }
                            })()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "font-bold font-accent text-lg",
                          game.result === 'W' ? 'text-court-500' : 'text-red-400'
                        )}>
                          {game.result}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Achievements */}
              <motion.div
                className="bg-gradient-to-br from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-xl p-6 border border-primary-400/20"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-display font-bold text-white">Achievements</h2>
                  <Link href="/achievements">
                    <GameButton variant="ghost" size="sm">
                      View Trophy Room
                    </GameButton>
                  </Link>
                </div>

                <div className="space-y-4">
                  {mockAchievements.map((achievement, index) => (
                    <motion.div
                      key={achievement.id}
                      className="flex items-center space-x-4 p-4 bg-dark-200/50 rounded-lg border border-primary-400/10"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center text-white text-xl bg-gradient-to-br",
                        getBadgeColor(achievement.badgeType)
                      )}>
                        {achievement.iconUrl}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-primary-100">{achievement.name}</h3>
                        <p className="text-sm text-primary-300">{achievement.description}</p>
                        <p className="text-xs text-primary-400 mt-1">
                          Earned {(() => {
                            try {
                              return formatDate(achievement.earnedAt);
                            } catch (error) {
                              console.warn('Error formatting achievement date:', error);
                              return 'Recently';
                            }
                          })()}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
          </main>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileBottomNav
        notifications={{
          profile: 0
        }}
      />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <PageErrorBoundary>
      <ProfilePageContent />
    </PageErrorBoundary>
  );
}

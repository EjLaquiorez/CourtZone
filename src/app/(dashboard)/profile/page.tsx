'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
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
  UserPlus
} from 'lucide-react';
import { AuthenticatedHeader } from '@/components/layout/header';
import { Sidebar, MobileSidebar } from '@/components/layout/sidebar';
import { MobileBottomNav, MobileQuickAction } from '@/components/layout/mobile-nav';
import { PageErrorBoundary } from '@/components/error/error-boundary';
import { GameButton } from '@/components/ui/game-button';
import { StatCard } from '@/components/ui/stat-card';
import { BasketballProfileForm } from '@/components/forms/basketball-profile-form';
import { cn } from '@/lib/utils';
import type { User as UserType, Position } from '@/types';
import { useCurrentUser } from '@/lib/hooks/use-api';
import { BasketballProfileFormData } from '@/lib/validation';
import { useToast } from '@/components/ui/toast';
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
  const { toast } = useToast();
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
      toast.success('Basketball profile updated successfully!');
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
            user={safeUser}
            onMenuToggle={() => setMobileSidebarOpen(true)}
          />

          {/* Page Content */}
          <main className="p-4 lg:p-8">
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
            {/* Profile Header */}
            <motion.div
              className="bg-gradient-to-r from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-xl p-6 border border-primary-400/20 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center space-x-6 mb-6 lg:mb-0">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-3xl font-bold basketball-glow">
                      {safeUser.avatar ? (
                        <img src={safeUser.avatar} alt={safeUser.username} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        (safeUser.username || 'U').charAt(0).toUpperCase()
                      )}
                    </div>
                    {isEditing && (
                      <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white hover:bg-primary-600 transition-colors">
                        <Camera className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* User Info */}
                  <div>
                    {isEditing ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editedUser.username}
                          onChange={(e) => setEditedUser({...editedUser, username: e.target.value})}
                          className="text-2xl font-display font-bold bg-dark-200/50 text-white border border-primary-400/30 rounded-lg px-3 py-2"
                        />
                        <input
                          type="email"
                          value={editedUser.email}
                          onChange={(e) => setEditedUser({...editedUser, email: e.target.value})}
                          className="text-primary-300 bg-dark-200/50 border border-primary-400/30 rounded-lg px-3 py-2"
                        />
                      </div>
                    ) : (
                      <>
                        <h1 className="text-3xl font-display font-bold text-white flex items-center">
                          {safeUser.username}
                          {safeUser.isVerified && (
                            <span className="ml-3 text-blue-400">✓</span>
                          )}
                        </h1>
                        <p className="text-primary-300 text-lg">{safeUser.email}</p>
                      </>
                    )}

                    <div className="flex items-center space-x-4 text-primary-200 mt-2">
                      <span className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {safeUser.position ? getPositionName(safeUser.position) : 'Position not set'}
                      </span>
                      <span className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {safeUser.city || 'Location not set'}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Joined {(() => {
                          try {
                            return formatDate(safeUser.createdAt);
                          } catch (error) {
                            console.warn('Error formatting join date:', error);
                            return 'Recently';
                          }
                        })()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-3 flex-wrap">
                  {isEditing ? (
                    <>
                      <GameButton variant="success" size="md" onClick={handleSaveProfile} icon={<Save className="w-5 h-5" />}>
                        Save Changes
                      </GameButton>
                      <GameButton variant="secondary" size="md" onClick={handleCancelEdit} icon={<X className="w-5 h-5" />}>
                        Cancel
                      </GameButton>
                    </>
                  ) : (
                    <>
                      <GameButton variant="primary" size="md" onClick={() => setIsEditing(true)} icon={<Edit3 className="w-5 h-5" />}>
                        Edit Profile
                      </GameButton>
                      <GameButton
                        variant="success"
                        size="md"
                        onClick={() => setShowBasketballForm(true)}
                        icon={<UserPlus className="w-5 h-5" />}
                      >
                        Basketball Profile
                      </GameButton>
                      <GameButton variant="secondary" size="md" icon={<Settings className="w-5 h-5" />}>
                        Settings
                      </GameButton>
                    </>
                  )}
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
                title="Rating"
                value={safeUser.rating || 0}
                icon={<Star className="w-6 h-6" />}
                trend={{ direction: 'up', value: 23, label: 'this month' }}
                glowColor="primary"
              />
              <StatCard
                title="Skill Level"
                value={`${safeUser.skillLevel || 0}/10`}
                icon={<Target className="w-6 h-6" />}
                glowColor="success"
              />
              <StatCard
                title="Games Played"
                value={127}
                icon={<Trophy className="w-6 h-6" />}
                trend={{ direction: 'up', value: 12, label: 'this month' }}
                glowColor="info"
              />
              <StatCard
                title="Win Rate"
                value="74%"
                icon={<TrendingUp className="w-6 h-6" />}
                trend={{ direction: 'up', value: 5, label: 'this week' }}
                glowColor="warning"
              />
            </motion.div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                  <GameButton variant="ghost" size="sm">
                    View All
                  </GameButton>
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
          </main>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileBottomNav
        notifications={{
          profile: 0
        }}
      />

      {/* Mobile Quick Action Button */}
      <MobileQuickAction />
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

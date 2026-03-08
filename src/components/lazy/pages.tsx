'use client';

import React, { lazy } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Users, 
  MapPin, 
  Calendar, 
  User, 
  Settings,
  BarChart3,
  Award,
  Gamepad2
} from 'lucide-react';

// Lazy load page components for route-based code splitting
export const LazyDashboardPage = lazy(() => 
  import('@/app/(dashboard)/dashboard/page').then(module => ({ 
    default: module.default 
  }))
);

export const LazyOverviewPage = lazy(() => 
  import('@/app/(dashboard)/overview/page').then(module => ({ 
    default: module.default 
  }))
);

export const LazyTeamsPage = lazy(() => 
  import('@/app/(dashboard)/teams/page').then(module => ({ 
    default: module.default 
  }))
);

export const LazyGamesPage = lazy(() => 
  import('@/app/(dashboard)/games/page').then(module => ({ 
    default: module.default 
  }))
);

export const LazyCoursePage = lazy(() => 
  import('@/app/(dashboard)/courts/page').then(module => ({ 
    default: module.default 
  }))
);

export const LazyProfilePage = lazy(() => 
  import('@/app/(dashboard)/profile/page').then(module => ({ 
    default: module.default 
  }))
);

export const LazyAchievementsPage = lazy(() => 
  import('@/app/(dashboard)/achievements/page').then(module => ({ 
    default: module.default 
  }))
);

export const LazyFeaturesPage = lazy(() => 
  import('@/app/features/page').then(module => ({ 
    default: module.default 
  }))
);

export const LazyDemoPage = lazy(() => 
  import('@/app/demo/page').then(module => ({ 
    default: module.default 
  }))
);

// Basketball-themed page loading skeletons
export function DashboardPageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-primary-400/20 rounded animate-pulse" />
            <div className="h-4 w-32 bg-primary-400/20 rounded animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-primary-400/20 rounded animate-pulse" />
        </div>

        {/* Quick actions skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="bg-gradient-to-br from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-xl p-6 border border-primary-400/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-400/20 rounded-full animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-20 bg-primary-400/20 rounded animate-pulse" />
                  <div className="h-3 w-16 bg-primary-400/20 rounded animate-pulse" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats cards skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="bg-gradient-to-br from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-xl p-6 border border-primary-400/20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <Trophy className="w-6 h-6 text-primary-400/50" />
                <div className="w-8 h-8 bg-primary-400/20 rounded animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-8 w-16 bg-primary-400/20 rounded animate-pulse" />
                <div className="h-4 w-20 bg-primary-400/20 rounded animate-pulse" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Loading message */}
        <div className="text-center py-12">
          <motion.div
            className="flex items-center justify-center space-x-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Gamepad2 className="w-8 h-8 text-primary-400" />
            <span className="text-xl text-primary-200 font-medium">Loading your basketball dashboard...</span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export function TeamsPageSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-32 bg-primary-400/20 rounded animate-pulse" />
          <div className="h-4 w-48 bg-primary-400/20 rounded animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-primary-400/20 rounded animate-pulse" />
      </div>

      {/* Team cards grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="bg-gradient-to-br from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-xl p-6 border border-primary-400/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-primary-400/20 rounded-full animate-pulse" />
              <div className="space-y-2">
                <div className="h-5 w-24 bg-primary-400/20 rounded animate-pulse" />
                <div className="h-4 w-32 bg-primary-400/20 rounded animate-pulse" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-4 w-full bg-primary-400/20 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-primary-400/20 rounded animate-pulse" />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="text-center py-8">
        <motion.div
          className="flex items-center justify-center space-x-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Users className="w-6 h-6 text-primary-400" />
          <span className="text-primary-200">Loading teams...</span>
        </motion.div>
      </div>
    </div>
  );
}

export function GamesPageSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-32 bg-primary-400/20 rounded animate-pulse" />
          <div className="h-4 w-48 bg-primary-400/20 rounded animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-primary-400/20 rounded animate-pulse" />
      </div>

      {/* Games list */}
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="bg-gradient-to-br from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-xl p-6 border border-primary-400/20"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary-400/20 rounded-full animate-pulse" />
                <div className="space-y-2">
                  <div className="h-5 w-32 bg-primary-400/20 rounded animate-pulse" />
                  <div className="h-4 w-48 bg-primary-400/20 rounded animate-pulse" />
                </div>
              </div>
              <div className="space-y-2 text-right">
                <div className="h-4 w-20 bg-primary-400/20 rounded animate-pulse" />
                <div className="h-4 w-16 bg-primary-400/20 rounded animate-pulse" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="text-center py-8">
        <motion.div
          className="flex items-center justify-center space-x-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Calendar className="w-6 h-6 text-primary-400" />
          <span className="text-primary-200">Loading games...</span>
        </motion.div>
      </div>
    </div>
  );
}

export function CourtsPageSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header with map toggle */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-32 bg-primary-400/20 rounded animate-pulse" />
          <div className="h-4 w-48 bg-primary-400/20 rounded animate-pulse" />
        </div>
        <div className="flex space-x-2">
          <div className="h-10 w-20 bg-primary-400/20 rounded animate-pulse" />
          <div className="h-10 w-20 bg-primary-400/20 rounded animate-pulse" />
        </div>
      </div>

      {/* Map skeleton */}
      <div className="h-96 bg-gradient-to-br from-court-600/20 via-court-500/20 to-court-400/20 rounded-xl border border-primary-400/20 flex items-center justify-center">
        <motion.div
          className="flex items-center space-x-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <MapPin className="w-8 h-8 text-primary-400" />
          <span className="text-xl text-primary-200">Loading court map...</span>
        </motion.div>
      </div>

      <div className="text-center py-4">
        <span className="text-primary-400 text-sm">Finding nearby basketball courts</span>
      </div>
    </div>
  );
}

export function ProfilePageSkeleton() {
  return (
    <div className="space-y-8">
      {/* Profile header */}
      <div className="flex items-center space-x-6">
        <div className="w-24 h-24 bg-primary-400/20 rounded-full animate-pulse" />
        <div className="space-y-3">
          <div className="h-8 w-48 bg-primary-400/20 rounded animate-pulse" />
          <div className="h-4 w-32 bg-primary-400/20 rounded animate-pulse" />
          <div className="h-4 w-40 bg-primary-400/20 rounded animate-pulse" />
        </div>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="bg-gradient-to-br from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-xl p-6 border border-primary-400/20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="w-6 h-6 text-primary-400/50" />
              <div className="w-8 h-8 bg-primary-400/20 rounded animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-8 w-16 bg-primary-400/20 rounded animate-pulse" />
              <div className="h-4 w-20 bg-primary-400/20 rounded animate-pulse" />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="text-center py-8">
        <motion.div
          className="flex items-center justify-center space-x-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <User className="w-6 h-6 text-primary-400" />
          <span className="text-primary-200">Loading profile...</span>
        </motion.div>
      </div>
    </div>
  );
}

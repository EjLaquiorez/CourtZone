'use client';

import { motion } from 'framer-motion';
import { Loader2, Users, MapPin, Calendar, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
}

export function LoadingSpinner({ size = 'md', color = 'primary', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    primary: 'text-primary-500',
    secondary: 'text-primary-300',
    white: 'text-white'
  };

  return (
    <motion.div
      className={cn('flex items-center justify-center', className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Loader2
        className={cn(
          sizeClasses[size],
          colorClasses[color],
          'animate-spin'
        )}
      />
    </motion.div>
  );
}

interface BasketballLoadingProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}

export function BasketballLoading({ size = 'md', message, className }: BasketballLoadingProps) {
  const sizeClasses = {
    sm: 'text-4xl',
    md: 'text-6xl',
    lg: 'text-8xl'
  };

  return (
    <motion.div
      className={cn('flex flex-col items-center justify-center p-8', className)}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
    >
      <motion.div
        className={cn(sizeClasses[size], 'mb-4')}
        animate={{
          rotate: [0, 360],
          scale: [1, 1.1, 1]
        }}
        transition={{
          rotate: { duration: 2, repeat: Infinity, ease: "linear" },
          scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
        }}
      >
        🏀
      </motion.div>

      {message && (
        <motion.p
          className="text-primary-300 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {message}
        </motion.p>
      )}
    </motion.div>
  );
}

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
  animated?: boolean;
}

export function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
  animated = true
}: SkeletonProps) {
  const baseClasses = 'bg-gradient-to-r from-dark-300 to-dark-200';

  const variantClasses = {
    text: 'rounded h-4',
    rectangular: 'rounded-lg',
    circular: 'rounded-full'
  };

  const style = {
    width: width || (variant === 'text' ? '100%' : undefined),
    height: height || (variant === 'text' ? '1rem' : undefined)
  };

  return (
    <motion.div
      className={cn(
        baseClasses,
        variantClasses[variant],
        animated && 'animate-pulse',
        className
      )}
      style={style}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    />
  );
}

// Page-specific loading components
export function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-400 via-dark-300 to-dark-400 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-dark-300/50 rounded-xl p-6 border border-primary-400/20">
              <div className="flex items-center justify-between mb-4">
                <Skeleton variant="circular" width={48} height={48} />
                <Skeleton className="h-6 w-16" />
              </div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>

        {/* Content Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-dark-300/50 rounded-xl p-6 border border-primary-400/20">
            <Skeleton className="h-6 w-32 mb-6" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4 mb-4">
                <Skeleton variant="circular" width={40} height={40} />
                <div className="flex-1">
                  <Skeleton className="h-4 w-48 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>

          <div className="bg-dark-300/50 rounded-xl p-6 border border-primary-400/20">
            <Skeleton className="h-6 w-32 mb-6" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="mb-4">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TeamsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-400 via-dark-300 to-dark-400 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-dark-300/50 rounded-xl p-6 border border-primary-400/20">
              <div className="flex items-center space-x-4 mb-4">
                <Skeleton variant="circular" width={56} height={56} />
                <div className="flex-1">
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-3 w-full mb-2" />
              <Skeleton className="h-3 w-3/4 mb-4" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function GamesLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-400 via-dark-300 to-dark-400 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Tabs Skeleton */}
        <div className="flex space-x-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-24" />
          ))}
        </div>

        {/* Games List Skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-dark-300/50 rounded-xl p-6 border border-primary-400/20">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <Skeleton className="h-6 w-64 mb-2" />
                  <Skeleton className="h-4 w-48 mb-2" />
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CourtsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-400 via-dark-300 to-dark-400 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Map Skeleton */}
        <div className="bg-dark-300/50 rounded-xl h-96 mb-8 border border-primary-400/20 flex items-center justify-center">
          <BasketballLoading message="Loading courts map..." />
        </div>

        {/* Courts Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-dark-300/50 rounded-xl p-6 border border-primary-400/20">
              <Skeleton className="h-48 w-full mb-4" />
              <Skeleton className="h-5 w-48 mb-2" />
              <Skeleton className="h-3 w-32 mb-4" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProfileLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-400 via-dark-300 to-dark-400 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Profile Header Skeleton */}
        <div className="bg-dark-300/50 rounded-xl p-6 border border-primary-400/20 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-6 mb-6 lg:mb-0">
              {/* Avatar Skeleton */}
              <Skeleton variant="circular" width={96} height={96} />

              {/* User Info Skeleton */}
              <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-5 w-64 mb-3" />
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </div>
            </div>

            {/* Action Buttons Skeleton */}
            <div className="flex items-center space-x-3">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-dark-300/50 rounded-xl p-6 border border-primary-400/20">
              <div className="flex items-center justify-between mb-4">
                <Skeleton variant="circular" width={48} height={48} />
                <Skeleton className="h-6 w-16" />
              </div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>

        {/* Content Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Games Skeleton */}
          <div className="bg-dark-300/50 rounded-xl p-6 border border-primary-400/20">
            <div className="flex items-center justify-between mb-6">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-8 w-20" />
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-dark-200/50 rounded-lg border border-primary-400/10 mb-4">
                <div className="flex items-center space-x-4">
                  <Skeleton variant="circular" width={12} height={12} />
                  <div>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-6 w-8" />
              </div>
            ))}
          </div>

          {/* Achievements Skeleton */}
          <div className="bg-dark-300/50 rounded-xl p-6 border border-primary-400/20">
            <div className="flex items-center justify-between mb-6">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-8 w-20" />
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 bg-dark-200/50 rounded-lg border border-primary-400/10 mb-4">
                <Skeleton variant="circular" width={48} height={48} />
                <div className="flex-1">
                  <Skeleton className="h-4 w-40 mb-2" />
                  <Skeleton className="h-3 w-32 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AchievementsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-400 via-dark-300 to-dark-400 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Page Header Skeleton */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Skeleton variant="circular" width={48} height={48} />
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-dark-300/50 rounded-xl p-6 border border-primary-400/20">
              <div className="flex items-center justify-between mb-4">
                <Skeleton variant="circular" width={48} height={48} />
                <Skeleton className="h-6 w-16" />
              </div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>

        {/* Filters Skeleton */}
        <div className="bg-dark-300/50 rounded-xl p-6 border border-primary-400/20 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <Skeleton className="h-12 w-full lg:max-w-md" />
            <div className="flex items-center space-x-4">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-6 w-28" />
            </div>
          </div>
        </div>

        {/* Achievements Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-dark-300/50 rounded-xl p-6 border border-primary-400/20">
              {/* Achievement Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Skeleton variant="circular" width={48} height={48} />
                    <Skeleton variant="circular" width={16} height={16} className="absolute -top-1 -right-1" />
                  </div>
                  <div className="flex-1">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </div>
                <Skeleton variant="circular" width={32} height={32} />
              </div>

              {/* Description */}
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-4" />

              {/* Progress Bar (some cards) */}
              {i % 3 === 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
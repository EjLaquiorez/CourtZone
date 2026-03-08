'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'default' | 'basketball' | 'pulse';
  children?: React.ReactNode;
}

export function Skeleton({ className, variant = 'default', children }: SkeletonProps) {
  const baseClasses = 'rounded-lg bg-gradient-to-r from-dark-200/50 to-dark-300/50';
  
  const variantClasses = {
    default: 'animate-pulse',
    basketball: '',
    pulse: 'animate-pulse'
  };

  if (variant === 'basketball') {
    return (
      <motion.div
        className={cn(baseClasses, className)}
        animate={{
          opacity: [0.5, 1, 0.5],
          scale: [1, 1.02, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={cn(baseClasses, variantClasses[variant], className)}>
      {children}
    </div>
  );
}

// Preset skeleton components for common basketball app elements
export function GameCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('bg-gradient-to-br from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-xl p-6 border border-primary-400/20', className)}>
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      
      <div className="space-y-3 mb-4">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-24 rounded-lg" />
        <Skeleton className="h-8 w-16 rounded-lg" />
      </div>
    </div>
  );
}

export function PlayerCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('bg-gradient-to-br from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-xl p-4 border border-primary-400/20', className)}>
      <div className="flex items-center space-x-3 mb-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-5 w-24 mb-1" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-12" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-8" />
        </div>
      </div>
    </div>
  );
}

export function StatCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('bg-gradient-to-br from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-xl p-6 border border-primary-400/20', className)}>
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-6 w-6 rounded-full" />
      </div>
      
      <Skeleton className="h-8 w-16 mb-2" />
      
      <div className="flex items-center space-x-2">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-12" />
      </div>
    </div>
  );
}

export function CourtCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('bg-gradient-to-br from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-xl overflow-hidden border border-primary-400/20', className)}>
      <Skeleton className="h-48 w-full" />
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-6 w-32" />
          <div className="flex items-center space-x-1">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-8" />
          </div>
        </div>
        
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-4" />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </div>
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function TeamCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('bg-gradient-to-br from-dark-300/80 to-dark-400/80 backdrop-blur-sm rounded-xl p-6 border border-primary-400/20', className)}>
      <div className="flex items-center space-x-4 mb-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <Skeleton className="h-6 w-8 mx-auto mb-1" />
          <Skeleton className="h-3 w-12 mx-auto" />
        </div>
        <div className="text-center">
          <Skeleton className="h-6 w-8 mx-auto mb-1" />
          <Skeleton className="h-3 w-16 mx-auto" />
        </div>
        <div className="text-center">
          <Skeleton className="h-6 w-8 mx-auto mb-1" />
          <Skeleton className="h-3 w-10 mx-auto" />
        </div>
      </div>
      
      <Skeleton className="h-8 w-full rounded-lg" />
    </div>
  );
}

// Loading page skeleton
export function DashboardSkeleton() {
  return (
    <div className="p-4 lg:p-8 space-y-8">
      {/* Header skeleton */}
      <div className="mb-8">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-5 w-48" />
      </div>
      
      {/* Quick action cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-xl p-6 border border-primary-400/30">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48 mb-4" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ))}
      </div>
      
      {/* Stats skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      
      {/* Content sections skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <Skeleton className="h-6 w-32 mb-4" />
          {Array.from({ length: 3 }).map((_, i) => (
            <GameCardSkeleton key={i} />
          ))}
        </div>
        <div className="space-y-4">
          <Skeleton className="h-6 w-32 mb-4" />
          {Array.from({ length: 3 }).map((_, i) => (
            <GameCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

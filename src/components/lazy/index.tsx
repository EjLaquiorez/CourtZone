import React, { Suspense, lazy } from 'react';

// Lazy load heavy components
export const LazyCourtMap = lazy(() =>
  import('@/components/maps/court-map').then(module => ({
    default: module.CourtMap
  }))
);

export const LazyPlayerStatsDashboard = lazy(() =>
  import('@/components/stats/player-stats-dashboard').then(module => ({
    default: module.PlayerStatsDashboard
  }))
);

export const LazyGameChat = lazy(() =>
  import('@/components/game/game-chat').then(module => ({
    default: module.GameChat
  }))
);

export const LazyCourtBookingCalendar = lazy(() =>
  import('@/components/courts/court-booking-calendar').then(module => ({
    default: module.CourtBookingCalendar
  }))
);

export const LazyGameForm = lazy(() =>
  import('@/components/forms/game-form').then(module => ({
    default: module.GameCreationForm
  }))
);

export const LazyTeamForm = lazy(() =>
  import('@/components/forms/team-form').then(module => ({
    default: module.TeamCreationForm
  }))
);

export const LazyGameCompletionForm = lazy(() =>
  import('@/components/games/game-completion-form').then(module => ({
    default: module.GameCompletionForm
  }))
);

export const LazyFeatureShowcase = lazy(() =>
  import('@/components/features/feature-showcase').then(module => ({
    default: module.FeatureShowcase
  }))
);

// Generic loading wrapper component
interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

// This is a server component that handles suspense
export function LazyWrapper({ children, fallback, className }: LazyWrapperProps) {
  return (
    <Suspense fallback={fallback || <div className={className}>Loading...</div>}>
      {children}
    </Suspense>
  );
}

// Loading skeletons
export const PlayerStatsSkeleton = () => (
  <div className="p-6 bg-white rounded-lg shadow-sm animate-pulse">
    <div className="flex items-center justify-between mb-6">
      <div className="h-6 w-32 bg-gray-200 rounded"></div>
      <div className="h-6 w-24 bg-gray-200 rounded"></div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="p-4 bg-gray-50 rounded-lg">
          <div className="h-4 w-20 bg-gray-200 rounded mb-2"></div>
          <div className="h-8 w-16 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  </div>
);

export const CourtMapSkeleton = () => (
  <div className="p-6 bg-white rounded-lg shadow-sm animate-pulse">
    <div className="flex items-center justify-between mb-6">
      <div className="h-6 w-32 bg-gray-200 rounded"></div>
      <div className="h-6 w-24 bg-gray-200 rounded"></div>
    </div>
    <div className="aspect-video bg-gray-100 rounded-lg"></div>
  </div>
);

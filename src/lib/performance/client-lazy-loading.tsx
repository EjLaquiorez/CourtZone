'use client';

import React from 'react';
import { useEffect, useCallback, type ComponentType } from 'react';
import { lazyLoadMonitor, useLazyLoadTracking } from './lazy-loading';

// Basketball-specific performance thresholds
export const BASKETBALL_PERFORMANCE_THRESHOLDS = {
  COURT_MAP: 2000, // 2 seconds for court map loading
  PLAYER_STATS: 1500, // 1.5 seconds for player stats
  GAME_CHAT: 1000, // 1 second for game chat
  FORMS: 800, // 800ms for forms
  IMAGES: 500 // 500ms for images
} as const;

// Performance grade calculator
export function getPerformanceGrade(loadTime: number, threshold: number): {
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  color: string;
  message: string;
} {
  const ratio = loadTime / threshold;

  if (ratio <= 0.5) {
    return { grade: 'A', color: 'text-court-400', message: 'Excellent performance! 🏀' };
  } else if (ratio <= 0.75) {
    return { grade: 'B', color: 'text-primary-400', message: 'Good performance! 👍' };
  } else if (ratio <= 1.0) {
    return { grade: 'C', color: 'text-yellow-400', message: 'Average performance' };
  } else if (ratio <= 1.5) {
    return { grade: 'D', color: 'text-orange-400', message: 'Below average performance' };
  } else {
    return { grade: 'F', color: 'text-red-400', message: 'Poor performance - needs optimization' };
  }
}

// Higher-order component for tracking lazy loading
export const withLazyLoadTracking = <T extends object>(
  WrappedComponent: ComponentType<T>,
  componentName: string
): ComponentType<T> => {
  const TrackedComponent: ComponentType<T> = (props: T) => {
    useEffect(() => {
      const startTime = performance.now();

      return () => {
        const endTime = performance.now();
        try {
          lazyLoadMonitor.trackLazyLoad(componentName, startTime, endTime);
        } catch (error) {
          console.warn(`Failed to track lazy load for ${componentName}:`, error);
        }
      };
    }, []);

    return <WrappedComponent {...props} />;
  };

  // Set display name for debugging
  TrackedComponent.displayName = `withLazyLoadTracking(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return TrackedComponent;
};

// Utility for preloading on hover/focus
export const usePreloadOnHover = (
  importFunction: () => Promise<any>,
  componentName: string
): { onMouseEnter: () => void; onFocus: () => void } => {
  const preload = useCallback(() => {
    try {
      lazyLoadMonitor.preloadComponent(importFunction, componentName);
    } catch (error) {
      console.warn(`Failed to preload ${componentName}:`, error);
    }
  }, [importFunction, componentName]);

  return {
    onMouseEnter: preload,
    onFocus: preload
  };
};

// Re-export useLazyLoadTracking for convenience
export { useLazyLoadTracking };
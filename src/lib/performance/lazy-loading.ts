'use client';

import { useEffect } from 'react';

// Performance monitoring and optimization utilities for lazy loading
interface LazyLoadMetrics {
  componentName: string;
  loadTime: number;
  bundleSize?: number;
  timestamp: number;
  userAgent: string;
  connectionType?: string;
}

interface PerformanceConfig {
  enableTracking: boolean;
  enableAnalytics: boolean;
  maxRetries: number;
  retryDelay: number;
  preloadThreshold: number; // Distance in pixels to start preloading
}

// Hook for tracking component load times
export const useLazyLoadTracking = (componentName: string): void => {
  useEffect(() => {
    // Only track performance in browser environment
    if (typeof window === 'undefined') return;

    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      try {
        lazyLoadMonitor.trackLazyLoad(componentName, startTime, endTime);
      } catch (error) {
        console.warn(`Failed to track lazy load for ${componentName}:`, error);
      }
    };
  }, [componentName]);
};

class LazyLoadingPerformanceMonitor {
  private metrics: LazyLoadMetrics[] = [];
  private config: PerformanceConfig;
  private preloadQueue: Set<string> = new Set();

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = {
      enableTracking: process.env.NODE_ENV === 'development',
      enableAnalytics: process.env.NODE_ENV === 'production',
      maxRetries: 3,
      retryDelay: 1000,
      preloadThreshold: 100,
      ...config
    };
  }

  // Track lazy loading performance
  trackLazyLoad(componentName: string, startTime: number, endTime?: number): void {
    if (!this.config.enableTracking || typeof window === 'undefined') return;

    const loadTime = endTime ? endTime - startTime : performance.now() - startTime;

    const metric: LazyLoadMetrics = {
      componentName,
      loadTime,
      timestamp: Date.now(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
      connectionType: this.getConnectionType()
    };

    this.metrics.push(metric);

    // Log performance in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🏀 LaroHub Lazy Load: ${componentName} loaded in ${loadTime.toFixed(2)}ms`);
    }

    // Send to analytics in production
    if (this.config.enableAnalytics && typeof window !== 'undefined') {
      this.sendAnalytics(metric);
    }
  }

  // Get connection type for performance context
  private getConnectionType(): string {
    if (typeof window === 'undefined') return 'server';

    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const connection = (navigator as any).connection;
      return connection?.effectiveType || connection?.type || 'unknown';
    }
    return 'unknown';
  }

  // Send metrics to analytics
  private sendAnalytics(metric: LazyLoadMetrics): void {
    // In a real app, you would send this to your analytics service
    // For now, we'll just log it in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🏀 LaroHub Analytics:', {
        event: 'lazy_load_performance',
        component_name: metric.componentName,
        load_time: metric.loadTime,
        connection_type: metric.connectionType
      });
    }
  }

  // Preload components based on user behavior
  preloadComponent(importFunction: () => Promise<any>, componentName: string): void {
    if (typeof window === 'undefined' || this.preloadQueue.has(componentName)) return;

    this.preloadQueue.add(componentName);

    // Use requestIdleCallback for better performance
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(() => {
        this.executePreload(importFunction, componentName);
      });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        this.executePreload(importFunction, componentName);
      }, 100);
    }
  }

  private async executePreload(importFunction: () => Promise<any>, componentName: string): Promise<void> {
    try {
      const startTime = performance.now();
      await importFunction();
      const endTime = performance.now();

      this.trackLazyLoad(`${componentName}_preload`, startTime, endTime);
    } catch (error) {
      console.warn(`Failed to preload ${componentName}:`, error);
    }
  }

  // Clear metrics (useful for testing or memory management)
  clearMetrics(): void {
    this.metrics = [];
    this.preloadQueue.clear();
  }

  // Get performance summary
  getPerformanceSummary(): {
    totalComponents: number;
    averageLoadTime: number;
    slowestComponent: LazyLoadMetrics | null;
    fastestComponent: LazyLoadMetrics | null;
    componentBreakdown: Record<string, { count: number; avgTime: number }>;
  } {
    if (this.metrics.length === 0) {
      return {
        totalComponents: 0,
        averageLoadTime: 0,
        slowestComponent: null,
        fastestComponent: null,
        componentBreakdown: {}
      };
    }

    const totalLoadTime = this.metrics.reduce((sum, metric) => sum + metric.loadTime, 0);
    const averageLoadTime = totalLoadTime / this.metrics.length;

    const sortedMetrics = [...this.metrics].sort((a, b) => a.loadTime - b.loadTime);
    const fastestComponent = sortedMetrics[0];
    const slowestComponent = sortedMetrics[sortedMetrics.length - 1];

    // Component breakdown
    const componentBreakdown: Record<string, { count: number; avgTime: number }> = {};
    this.metrics.forEach(metric => {
      if (!componentBreakdown[metric.componentName]) {
        componentBreakdown[metric.componentName] = { count: 0, avgTime: 0 };
      }
      componentBreakdown[metric.componentName].count++;
    });

    // Calculate average times
    Object.keys(componentBreakdown).forEach(componentName => {
      const componentMetrics = this.metrics.filter(m => m.componentName === componentName);
      const totalTime = componentMetrics.reduce((sum, m) => sum + m.loadTime, 0);
      componentBreakdown[componentName].avgTime = totalTime / componentMetrics.length;
    });

    return {
      totalComponents: this.metrics.length,
      averageLoadTime,
      slowestComponent,
      fastestComponent,
      componentBreakdown
    };
  }
}

// Create singleton instance
export const lazyLoadMonitor = new LazyLoadingPerformanceMonitor();

// Export types for external use
export type { LazyLoadMetrics, PerformanceConfig };

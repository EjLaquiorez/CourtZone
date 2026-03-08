'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatCardProps } from '@/types';

export function StatCard({
  title,
  value,
  icon,
  trend,
  animated = true,
  glowColor,
  size = 'md',
  className
}: StatCardProps & { className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [displayValue, setDisplayValue] = useState(animated ? 0 : value);

  // Animate number counting
  useEffect(() => {
    if (!animated || !isInView) return;
    
    const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value;
    if (isNaN(numericValue)) {
      setDisplayValue(value);
      return;
    }

    let start = 0;
    const end = numericValue;
    const duration = 1500; // 1.5 seconds
    const increment = end / (duration / 16); // 60fps

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        const currentValue = typeof value === 'string' 
          ? value.replace(/[0-9.-]/g, match => Math.floor(start).toString())
          : Math.floor(start);
        setDisplayValue(currentValue);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value, animated, isInView]);

  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const iconSizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  const valueSizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  const trendColors = {
    up: 'text-court-500',
    down: 'text-red-400',
    neutral: 'text-gray-400'
  };

  const getTrendIcon = (direction: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up':
        return <TrendingUp className="w-4 h-4" />;
      case 'down':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const glowClasses = glowColor ? {
    success: 'hover:shadow-[0_0_20px_rgba(34,139,34,0.5)]',
    warning: 'hover:shadow-[0_0_20px_rgba(255,165,0,0.5)]',
    danger: 'hover:shadow-[0_0_20px_rgba(220,38,38,0.5)]',
    info: 'hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]',
    primary: 'hover:basketball-glow'
  }[glowColor] : '';

  return (
    <motion.div
      ref={ref}
      className={cn(
        'bg-gradient-to-br from-dark-300 to-dark-400 border border-primary-400/20 rounded-lg',
        'hover:border-primary-400/40 transition-all duration-300 cursor-pointer',
        'backdrop-blur-sm relative overflow-hidden',
        sizeClasses[size],
        glowClasses,
        className
      )}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      whileHover={{ y: -2, scale: 1.02 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* Basketball court lines background */}
      <div className="absolute inset-0 opacity-5">
        <div className="court-lines w-full h-full" />
      </div>

      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Icon with basketball orange glow */}
          <motion.div 
            className={cn(
              'text-primary-400 flex-shrink-0',
              iconSizeClasses[size]
            )}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.2 }}
          >
            {icon}
          </motion.div>
          
          <div className="min-w-0">
            {/* Title */}
            <p className="text-primary-100 text-sm font-medium font-primary mb-1 truncate">
              {title}
            </p>
            
            {/* Value with animated counting */}
            <motion.p 
              className={cn(
                'text-white font-bold font-accent tracking-wide',
                valueSizeClasses[size]
              )}
              key={displayValue}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {displayValue}
            </motion.p>
          </div>
        </div>
        
        {/* Trend indicator */}
        {trend && (
          <motion.div 
            className={cn(
              'flex items-center space-x-1 text-sm font-medium',
              trendColors[trend.direction]
            )}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {getTrendIcon(trend.direction)}
            <span>{trend.value}%</span>
            {trend.label && (
              <span className="text-xs text-gray-400 hidden sm:inline">
                {trend.label}
              </span>
            )}
          </motion.div>
        )}
      </div>

      {/* Subtle basketball texture overlay */}
      <div className="absolute bottom-0 right-0 w-16 h-16 opacity-5">
        <div className="w-full h-full rounded-full border-2 border-current">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-current transform -translate-y-1/2" />
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-current transform -translate-x-1/2" />
        </div>
      </div>

      {/* Hover glow effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-primary-600/10 rounded-lg opacity-0"
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
}

// Preset stat cards for common basketball statistics
export function WinRateCard({ winRate, trend, className }: { 
  winRate: number; 
  trend?: StatCardProps['trend'];
  className?: string;
}) {
  return (
    <StatCard
      title="Win Rate"
      value={`${winRate}%`}
      icon="🏆"
      trend={trend}
      glowColor="success"
      className={className}
    />
  );
}

export function GamesPlayedCard({ games, trend, className }: { 
  games: number; 
  trend?: StatCardProps['trend'];
  className?: string;
}) {
  return (
    <StatCard
      title="Games Played"
      value={games}
      icon="🏀"
      trend={trend}
      glowColor="primary"
      className={className}
    />
  );
}

export function RatingCard({ rating, trend, className }: { 
  rating: number; 
  trend?: StatCardProps['trend'];
  className?: string;
}) {
  return (
    <StatCard
      title="Current Rating"
      value={rating.toLocaleString()}
      icon="⭐"
      trend={trend}
      glowColor="warning"
      className={className}
    />
  );
}

export function StreakCard({ streak, trend, className }: { 
  streak: number; 
  trend?: StatCardProps['trend'];
  className?: string;
}) {
  return (
    <StatCard
      title="Current Streak"
      value={streak}
      icon="🔥"
      trend={trend}
      glowColor={streak > 0 ? "success" : "danger"}
      className={className}
    />
  );
}

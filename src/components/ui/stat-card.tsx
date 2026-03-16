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
  className,
  variant = 'default',
}: StatCardProps & { className?: string; variant?: 'default' | 'minimal' }) {
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
    up: 'text-emerald-400',
    down: 'text-red-400',
    neutral: 'text-slate-500',
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

  const glowClasses =
    glowColor && variant === 'default'
      ? {
          success: 'hover:shadow-[0_0_20px_rgba(34,197,94,0.35)]',
          warning: 'hover:shadow-[0_0_20px_rgba(234,179,8,0.35)]',
          danger: 'hover:shadow-[0_0_20px_rgba(239,68,68,0.35)]',
          info: 'hover:shadow-[0_0_20px_rgba(56,189,248,0.35)]',
          primary: 'hover:shadow-glow',
        }[glowColor]
      : '';

  const baseSurfaceClasses =
    variant === 'minimal'
      ? 'bg-slate-900 border border-slate-800 rounded-xl'
      : 'bg-gradient-to-br from-dark-300 to-dark-400 border border-primary-400/20 rounded-lg';

  return (
    <motion.div
      ref={ref}
      className={cn(
        baseSurfaceClasses,
        'transition-all duration-200 relative overflow-hidden',
        sizeClasses[size],
        glowClasses,
        className
      )}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      whileHover={{ y: -2, scale: 1.02 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {icon && (
            <motion.div
              className={cn(
                'flex-shrink-0 text-primary-400',
                iconSizeClasses[size],
                variant === 'minimal' && 'text-primary-500'
              )}
              whileHover={variant === 'default' ? { scale: 1.1, rotate: 5 } : {}}
              transition={{ duration: 0.2 }}
            >
              {icon}
            </motion.div>
          )}
          
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-400 mb-1 truncate">
              {title}
            </p>

            <motion.p
              className={cn(
                'font-semibold tracking-tight',
                variant === 'minimal' ? 'text-slate-50' : 'text-white',
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
        
        {trend && (
          <motion.div
            className={cn(
              'flex items-center space-x-1 text-xs font-medium',
              trendColors[trend.direction]
            )}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {getTrendIcon(trend.direction)}
            <span>{trend.value}%</span>
            {trend.label && (
              <span className="text-[11px] text-slate-500 hidden sm:inline">
                {trend.label}
              </span>
            )}
          </motion.div>
        )}
      </div>
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
      icon={null}
      trend={trend}
      glowColor="success"
      variant="minimal"
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
      icon={null}
      trend={trend}
      glowColor="primary"
      variant="minimal"
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
      icon={null}
      trend={trend}
      glowColor="warning"
      variant="minimal"
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
      icon={null}
      trend={trend}
      glowColor={streak > 0 ? 'success' : 'danger'}
      variant="minimal"
      className={className}
    />
  );
}

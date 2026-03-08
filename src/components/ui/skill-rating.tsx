'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SkillRatingProps {
  level: number; // 1-10
  maxLevel?: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  interactive?: boolean;
  onChange?: (level: number) => void;
  variant?: 'stars' | 'bars' | 'hexagons';
  className?: string;
}

export function SkillRating({
  level,
  maxLevel = 10,
  size = 'md',
  showNumber = false,
  interactive = false,
  onChange,
  variant = 'stars',
  className
}: SkillRatingProps) {
  const [hoverLevel, setHoverLevel] = useState<number | null>(null);
  const displayLevel = hoverLevel ?? level;

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const handleClick = (newLevel: number) => {
    if (interactive && onChange) {
      onChange(newLevel);
    }
  };

  const handleMouseEnter = (newLevel: number) => {
    if (interactive) {
      setHoverLevel(newLevel);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverLevel(null);
    }
  };

  if (variant === 'stars') {
    return (
      <div className={cn('flex items-center space-x-1', className)}>
        {Array.from({ length: maxLevel }, (_, index) => {
          const starLevel = index + 1;
          const isActive = starLevel <= displayLevel;
          const isHovered = hoverLevel !== null && starLevel <= hoverLevel;

          return (
            <motion.button
              key={starLevel}
              type="button"
              disabled={!interactive}
              onClick={() => handleClick(starLevel)}
              onMouseEnter={() => handleMouseEnter(starLevel)}
              onMouseLeave={handleMouseLeave}
              className={cn(
                'transition-all duration-200',
                sizeClasses[size],
                interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default',
                isActive || isHovered ? 'text-primary-500' : 'text-dark-200'
              )}
              whileHover={interactive ? { scale: 1.1 } : {}}
              whileTap={interactive ? { scale: 0.9 } : {}}
            >
              <Star
                className="w-full h-full"
                fill={isActive || isHovered ? 'currentColor' : 'none'}
              />
            </motion.button>
          );
        })}
        
        {showNumber && (
          <span className="ml-2 text-sm font-medium text-primary-200">
            {displayLevel}/{maxLevel}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'bars') {
    return (
      <div className={cn('flex items-center space-x-1', className)}>
        {Array.from({ length: maxLevel }, (_, index) => {
          const barLevel = index + 1;
          const isActive = barLevel <= displayLevel;
          const isHovered = hoverLevel !== null && barLevel <= hoverLevel;

          return (
            <motion.button
              key={barLevel}
              type="button"
              disabled={!interactive}
              onClick={() => handleClick(barLevel)}
              onMouseEnter={() => handleMouseEnter(barLevel)}
              onMouseLeave={handleMouseLeave}
              className={cn(
                'transition-all duration-200 rounded-sm',
                size === 'sm' ? 'w-3 h-4' : size === 'md' ? 'w-4 h-6' : 'w-5 h-8',
                interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default',
                isActive || isHovered 
                  ? 'bg-gradient-to-t from-primary-600 to-primary-400' 
                  : 'bg-dark-200'
              )}
              whileHover={interactive ? { scale: 1.1 } : {}}
              whileTap={interactive ? { scale: 0.9 } : {}}
            />
          );
        })}
        
        {showNumber && (
          <span className="ml-2 text-sm font-medium text-primary-200">
            {displayLevel}/{maxLevel}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'hexagons') {
    return (
      <div className={cn('flex items-center space-x-1', className)}>
        {Array.from({ length: maxLevel }, (_, index) => {
          const hexLevel = index + 1;
          const isActive = hexLevel <= displayLevel;
          const isHovered = hoverLevel !== null && hexLevel <= hoverLevel;

          return (
            <motion.button
              key={hexLevel}
              type="button"
              disabled={!interactive}
              onClick={() => handleClick(hexLevel)}
              onMouseEnter={() => handleMouseEnter(hexLevel)}
              onMouseLeave={handleMouseLeave}
              className={cn(
                'transition-all duration-200 relative',
                sizeClasses[size],
                interactive ? 'cursor-pointer' : 'cursor-default'
              )}
              whileHover={interactive ? { scale: 1.1 } : {}}
              whileTap={interactive ? { scale: 0.9 } : {}}
            >
              <div
                className={cn(
                  'w-full h-full transform rotate-45 rounded-sm',
                  isActive || isHovered 
                    ? 'bg-gradient-to-br from-primary-400 to-primary-600' 
                    : 'bg-dark-200'
                )}
              />
            </motion.button>
          );
        })}
        
        {showNumber && (
          <span className="ml-2 text-sm font-medium text-primary-200">
            {displayLevel}/{maxLevel}
          </span>
        )}
      </div>
    );
  }

  return null;
}

// Preset skill rating components
export function PlayerSkillRating({ 
  level, 
  className 
}: { 
  level: number; 
  className?: string; 
}) {
  const getSkillLabel = (level: number) => {
    if (level <= 2) return 'Beginner';
    if (level <= 4) return 'Recreational';
    if (level <= 6) return 'Intermediate';
    if (level <= 8) return 'Advanced';
    return 'Elite';
  };

  const getSkillColor = (level: number) => {
    if (level <= 2) return 'text-gray-400';
    if (level <= 4) return 'text-blue-400';
    if (level <= 6) return 'text-green-400';
    if (level <= 8) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <SkillRating level={level} size="sm" />
      <span className={cn('text-sm font-medium', getSkillColor(level))}>
        {getSkillLabel(level)}
      </span>
    </div>
  );
}

export function InteractiveSkillSelector({
  level,
  onChange,
  label = "Skill Level",
  className
}: {
  level: number;
  onChange: (level: number) => void;
  label?: string;
  className?: string;
}) {
  const getSkillLabel = (level: number) => {
    const labels = [
      '', 'Beginner', 'Novice', 'Recreational', 'Intermediate', 'Intermediate+',
      'Advanced', 'Competitive', 'Elite', 'Professional', 'All-Star'
    ];
    return labels[level] || 'Unknown';
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-primary-200">
          {label}
        </label>
        <span className="text-sm font-bold text-primary-400">
          {level}/10 - {getSkillLabel(level)}
        </span>
      </div>
      
      <SkillRating
        level={level}
        interactive
        onChange={onChange}
        variant="stars"
        size="lg"
      />
      
      <div className="text-xs text-primary-300">
        Rate your basketball skills honestly to get better matches
      </div>
    </div>
  );
}

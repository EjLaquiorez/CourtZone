'use client';

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GameButtonProps } from '@/types';

export function GameButton({
  variant = 'primary',
  size = 'md',
  shape = 'rounded',
  glow = false,
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  onClick,
  children,
  className
}: GameButtonProps) {
  const baseClasses = 'font-accent font-semibold transition-all duration-200 relative overflow-hidden inline-flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-900 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-400 hover:to-primary-500 shadow-basketball',
    secondary: 'bg-dark-300 text-primary-100 border border-primary-400/50 hover:bg-dark-200 hover:border-primary-400',
    danger: 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-500 hover:to-red-600',
    success: 'bg-gradient-to-r from-court-500 to-court-600 text-white hover:from-court-400 hover:to-court-500',
    ghost: 'text-primary-400 hover:text-primary-300 hover:bg-primary-400/10'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl'
  };

  const shapeClasses = {
    rounded: 'rounded-lg',
    hexagonal: 'rounded-none relative before:absolute before:inset-0 before:bg-inherit before:transform before:rotate-45 before:-z-10',
    sharp: 'rounded-none'
  };

  const isDisabled = disabled || loading;

  return (
    <motion.button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        shapeClasses[shape],
        glow && !isDisabled && 'basketball-glow hover:basketball-glow-lg',
        fullWidth && 'w-full',
        className
      )}
      whileHover={!isDisabled ? { scale: 1.02 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      disabled={isDisabled}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Loading spinner */}
      {loading && (
        <Loader2 className="w-4 h-4 animate-spin" />
      )}
      
      {/* Left icon */}
      {icon && iconPosition === 'left' && !loading && (
        <span className="flex-shrink-0">
          {icon}
        </span>
      )}
      
      {/* Button content */}
      <span className="relative z-10">
        {children}
      </span>
      
      {/* Right icon */}
      {icon && iconPosition === 'right' && !loading && (
        <span className="flex-shrink-0">
          {icon}
        </span>
      )}
      
      {/* Glow effect overlay */}
      {glow && !isDisabled && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary-400/20 to-primary-600/20 rounded-lg"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
      
      {/* Basketball texture overlay for primary variant */}
      {variant === 'primary' && (
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.1)_70%)] rounded-lg" />
      )}
    </motion.button>
  );
}

// Preset button variants for common basketball actions
export function QuickMatchButton({ className, ...props }: Omit<GameButtonProps, 'variant' | 'glow'>) {
  return (
    <GameButton
      variant="primary"
      glow
      className={cn('font-display', className)}
      {...props}
    >
      ⚡ QUICK MATCH
    </GameButton>
  );
}

export function FindCourtsButton({ className, ...props }: Omit<GameButtonProps, 'variant'>) {
  return (
    <GameButton
      variant="secondary"
      className={cn('font-display', className)}
      {...props}
    >
      🗺️ FIND COURTS
    </GameButton>
  );
}

export function CreateTeamButton({ className, ...props }: Omit<GameButtonProps, 'variant'>) {
  return (
    <GameButton
      variant="success"
      className={cn('font-display', className)}
      {...props}
    >
      👥 CREATE TEAM
    </GameButton>
  );
}

export function JoinGameButton({ className, ...props }: Omit<GameButtonProps, 'variant' | 'size'>) {
  return (
    <GameButton
      variant="primary"
      size="sm"
      className={className}
      {...props}
    >
      JOIN GAME
    </GameButton>
  );
}

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
  className,
  type = 'button',
  ...rest
}: GameButtonProps) {
  const baseClasses =
    'font-primary font-semibold transition-all duration-150 relative inline-flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary:
      'bg-primary-500 text-white hover:bg-primary-400 active:bg-primary-600 shadow-sm',
    secondary:
      'bg-slate-900 text-slate-100 border border-slate-700 hover:bg-slate-800',
    danger:
      'bg-red-600 text-white hover:bg-red-500 active:bg-red-700',
    success:
      'bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-700',
    ghost:
      'text-slate-300 hover:text-slate-100 hover:bg-slate-800/60',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl'
  };

  const shapeClasses = {
    rounded: 'rounded-lg',
    hexagonal: 'rounded-lg',
    sharp: 'rounded-md',
  };

  const isDisabled = disabled || loading;

  return (
    <motion.button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        shapeClasses[shape],
        fullWidth && 'w-full',
        className
      )}
      whileHover={!isDisabled ? { scale: 1.02 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      disabled={isDisabled}
      type={type}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...rest}
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
      <span className="relative z-10 inline-flex items-center gap-2">
        {children}
      </span>
      
      {/* Right icon */}
      {icon && iconPosition === 'right' && !loading && (
        <span className="flex-shrink-0">
          {icon}
        </span>
      )}
      
      {/* Glow effect overlay */}
      {/* Minimal buttons do not use glow/texture overlays */}
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

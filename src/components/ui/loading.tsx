'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'basketball' | 'dots' | 'court';
  text?: string;
  className?: string;
}

export function Loading({ 
  size = 'md', 
  variant = 'basketball', 
  text,
  className 
}: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  if (variant === 'basketball') {
    return (
      <div className={cn('flex flex-col items-center justify-center space-y-4', className)}>
        <motion.div
          className={cn('text-primary-500', sizeClasses[size])}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 180, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          🏀
        </motion.div>
        {text && (
          <motion.p
            className={cn('text-primary-300 font-medium', textSizeClasses[size])}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {text}
          </motion.p>
        )}
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className={cn('flex flex-col items-center justify-center space-y-4', className)}>
        <div className="flex space-x-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className={cn('bg-primary-500 rounded-full', sizeClasses[size])}
              animate={{
                y: [0, -10, 0],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
        {text && (
          <p className={cn('text-primary-300 font-medium', textSizeClasses[size])}>
            {text}
          </p>
        )}
      </div>
    );
  }

  if (variant === 'court') {
    return (
      <div className={cn('flex flex-col items-center justify-center space-y-4', className)}>
        <div className="relative">
          {/* Basketball court outline */}
          <motion.div
            className="w-16 h-24 border-2 border-court-500 rounded-lg relative"
            animate={{
              borderColor: ['#228B22', '#32CD32', '#228B22']
            }}
            transition={{
              duration: 2,
              repeat: Infinity
            }}
          >
            {/* Center circle */}
            <motion.div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 border border-court-500 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity
              }}
            />
            
            {/* Basketball */}
            <motion.div
              className="absolute top-2 left-1/2 transform -translate-x-1/2 text-lg"
              animate={{
                y: [0, 60, 0],
                rotate: [0, 360, 720]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              🏀
            </motion.div>
          </motion.div>
        </div>
        {text && (
          <motion.p
            className={cn('text-primary-300 font-medium', textSizeClasses[size])}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {text}
          </motion.p>
        )}
      </div>
    );
  }

  // Default spinner
  return (
    <div className={cn('flex flex-col items-center justify-center space-y-4', className)}>
      <motion.div
        className={cn('border-2 border-primary-500/30 border-t-primary-500 rounded-full', sizeClasses[size])}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      {text && (
        <p className={cn('text-primary-300 font-medium', textSizeClasses[size])}>
          {text}
        </p>
      )}
    </div>
  );
}

// Full page loading component
export function PageLoading({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Loading variant="court" size="xl" text={text} />
        
        {/* Basketball-themed loading messages */}
        <motion.div
          className="mt-8 space-y-2"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <p className="text-primary-400 text-sm">
            "Champions are made when nobody's watching"
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

// Inline loading for buttons and small components
export function InlineLoading({ 
  size = 'sm', 
  className 
}: { 
  size?: 'sm' | 'md'; 
  className?: string; 
}) {
  return (
    <motion.div
      className={cn('inline-flex items-center space-x-2', className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className={cn(
          'border-2 border-current border-t-transparent rounded-full',
          size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
        )}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      <span className={size === 'sm' ? 'text-sm' : 'text-base'}>
        Loading...
      </span>
    </motion.div>
  );
}

// Loading overlay for forms and sections
export function LoadingOverlay({ 
  isLoading, 
  children, 
  text = "Processing...",
  className 
}: {
  isLoading: boolean;
  children: React.ReactNode;
  text?: string;
  className?: string;
}) {
  return (
    <div className={cn('relative', className)}>
      {children}
      {isLoading && (
        <motion.div
          className="absolute inset-0 bg-dark-900/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Loading variant="basketball" size="lg" text={text} />
        </motion.div>
      )}
    </div>
  );
}

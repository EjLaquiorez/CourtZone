'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, MapPin, Trophy, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  fallback?: React.ReactNode;
  onLoad?: () => void;
  onError?: () => void;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  width?: number;
  height?: number;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  basketballTheme?: 'player' | 'court' | 'team' | 'game';
}

export function LazyImage({
  src,
  alt,
  className,
  placeholder,
  fallback,
  onLoad,
  onError,
  priority = false,
  sizes,
  quality = 75,
  width,
  height,
  objectFit = 'cover',
  basketballTheme = 'player'
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px 0px', // Start loading 50px before entering viewport
        threshold: 0.01
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setIsError(true);
    onError?.();
  };

  const getThemeIcon = () => {
    switch (basketballTheme) {
      case 'player':
        return <User className="w-8 h-8 text-primary-400/50" />;
      case 'court':
        return <MapPin className="w-8 h-8 text-primary-400/50" />;
      case 'team':
        return <Trophy className="w-8 h-8 text-primary-400/50" />;
      case 'game':
        return <ImageIcon className="w-8 h-8 text-primary-400/50" />;
      default:
        return <ImageIcon className="w-8 h-8 text-primary-400/50" />;
    }
  };

  const getThemeGradient = () => {
    switch (basketballTheme) {
      case 'player':
        return 'from-primary-500/20 to-primary-600/20';
      case 'court':
        return 'from-court-500/20 to-court-600/20';
      case 'team':
        return 'from-yellow-500/20 to-yellow-600/20';
      case 'game':
        return 'from-blue-500/20 to-blue-600/20';
      default:
        return 'from-primary-500/20 to-primary-600/20';
    }
  };

  const defaultFallback = (
    <div className={cn(
      'flex items-center justify-center bg-gradient-to-br',
      getThemeGradient(),
      'border border-primary-400/20 rounded-lg',
      className
    )}>
      <div className="text-center">
        {getThemeIcon()}
        <p className="text-xs text-primary-400/70 mt-2">
          {isError ? 'Failed to load' : 'Loading...'}
        </p>
      </div>
    </div>
  );

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden', className)}
      style={{ width, height }}
    >
      <AnimatePresence mode="wait">
        {!isInView ? (
          // Placeholder before image enters viewport
          <motion.div
            key="placeholder"
            className={cn(
              'absolute inset-0 bg-gradient-to-br',
              getThemeGradient(),
              'border border-primary-400/20 rounded-lg flex items-center justify-center'
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center">
              {getThemeIcon()}
              <motion.div
                className="w-8 h-1 bg-primary-400/30 rounded-full mt-2 mx-auto overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div
                  className="h-full bg-primary-400 rounded-full"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                />
              </motion.div>
            </div>
          </motion.div>
        ) : !isLoaded && !isError ? (
          // Loading state
          <motion.div
            key="loading"
            className={cn(
              'absolute inset-0 bg-gradient-to-br',
              getThemeGradient(),
              'border border-primary-400/20 rounded-lg flex items-center justify-center'
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                {getThemeIcon()}
              </motion.div>
              <motion.div
                className="w-12 h-1 bg-primary-400/30 rounded-full mt-3 mx-auto overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div
                  className="h-full bg-primary-400 rounded-full"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                />
              </motion.div>
              <p className="text-xs text-primary-400/70 mt-2">Loading image...</p>
            </div>
          </motion.div>
        ) : isError ? (
          // Error state
          <motion.div
            key="error"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {fallback || defaultFallback}
          </motion.div>
        ) : (
          // Loaded image
          <motion.img
            key="image"
            ref={imgRef}
            src={src}
            alt={alt}
            className={cn('w-full h-full', `object-${objectFit}`, className)}
            onLoad={handleLoad}
            onError={handleError}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            sizes={sizes}
            loading={priority ? 'eager' : 'lazy'}
          />
        )}
      </AnimatePresence>

      {/* Load actual image when in view */}
      {isInView && !isLoaded && !isError && (
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
        />
      )}

      {/* Basketball-themed overlay effects */}
      {isLoaded && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        />
      )}
    </div>
  );
}

// Specialized basketball-themed image components
export function PlayerAvatar({
  src,
  alt,
  size = 'md',
  className,
  ...props
}: Omit<LazyImageProps, 'basketballTheme'> & {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  return (
    <LazyImage
      src={src}
      alt={alt}
      className={cn('rounded-full', sizeClasses[size], className)}
      basketballTheme="player"
      objectFit="cover"
      {...props}
    />
  );
}

export function CourtImage({
  src,
  alt,
  className,
  ...props
}: Omit<LazyImageProps, 'basketballTheme'>) {
  return (
    <LazyImage
      src={src}
      alt={alt}
      className={cn('rounded-lg', className)}
      basketballTheme="court"
      objectFit="cover"
      {...props}
    />
  );
}

export function TeamLogo({
  src,
  alt,
  size = 'md',
  className,
  ...props
}: Omit<LazyImageProps, 'basketballTheme'> & {
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <LazyImage
      src={src}
      alt={alt}
      className={cn('rounded-lg', sizeClasses[size], className)}
      basketballTheme="team"
      objectFit="contain"
      {...props}
    />
  );
}

export function GameImage({
  src,
  alt,
  className,
  ...props
}: Omit<LazyImageProps, 'basketballTheme'>) {
  return (
    <LazyImage
      src={src}
      alt={alt}
      className={cn('rounded-lg', className)}
      basketballTheme="game"
      objectFit="cover"
      {...props}
    />
  );
}

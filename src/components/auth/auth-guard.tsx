'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: ReactNode;
  requireProfile?: boolean; // Whether to require a complete profile
  fallback?: ReactNode;
}

export function AuthGuard({
  children,
  requireProfile = false,
  fallback
}: AuthGuardProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    // Don't redirect during initial loading
    if (isLoading) return;

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      const currentPath = window.location.pathname;
      const loginUrl = `/login?returnUrl=${encodeURIComponent(currentPath)}`;
      router.push(loginUrl);
      return;
    }

    // Check if profile is required and incomplete
    if (requireProfile && user && !isProfileComplete(user)) {
      router.push('/profile/setup');
      return;
    }
  }, [isAuthenticated, isLoading, user, requireProfile, router]);

  // Show loading state
  if (isLoading) {
    return fallback || <AuthLoadingScreen />;
  }

  // Show loading if not authenticated (will redirect)
  if (!isAuthenticated) {
    return fallback || <AuthLoadingScreen />;
  }

  // Show loading if profile is required but incomplete (will redirect)
  if (requireProfile && user && !isProfileComplete(user)) {
    return fallback || <AuthLoadingScreen />;
  }

  // Render children if authenticated and profile is complete (if required)
  return <>{children}</>;
}

// Helper function to check if user profile is complete
function isProfileComplete(user: any): boolean {
  // Define what constitutes a complete profile
  return !!(
    user.username &&
    user.position &&
    user.skillLevel &&
    user.skillLevel > 0
  );
}

// Loading screen component
function AuthLoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Basketball animation */}
        <motion.div
          className="relative mb-8"
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center basketball-glow mx-auto">
            <span className="text-white text-2xl">🏀</span>
          </div>
        </motion.div>

        {/* Loading text */}
        <motion.h2
          className="text-2xl font-display font-bold text-white mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Loading Your Game...
        </motion.h2>

        {/* Loading spinner */}
        <motion.div
          className="flex items-center justify-center space-x-2 text-primary-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Preparing your basketball experience</span>
        </motion.div>

        {/* Basketball court pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="court-lines w-full h-full" />
        </div>
      </motion.div>
    </div>
  );
}

// Higher-order component version
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  options: { requireProfile?: boolean } = {}
) {
  const AuthGuardedComponent = (props: P) => {
    return (
      <AuthGuard requireProfile={options.requireProfile}>
        <Component {...props} />
      </AuthGuard>
    );
  };

  AuthGuardedComponent.displayName = `withAuthGuard(${Component.displayName || Component.name})`;

  return AuthGuardedComponent;
}

'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Users,
  MapPin,
  Calendar,
  User,
  Trophy,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  UserCircle2,
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useCurrentUser } from '@/lib/hooks/use-api';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
  className?: string;
}

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    name: 'My Team',
    href: '/my-team',
    icon: UserCircle2,
  },
  {
    name: 'Teams',
    href: '/teams',
    icon: Users,
  },
  {
    name: 'Courts',
    href: '/courts',
    icon: MapPin,
  },
  {
    name: 'Games',
    href: '/games',
    icon: Calendar,
  },
  {
    name: 'Profile',
    href: '/profile',
    icon: User,
  },
  {
    name: 'Achievements',
    href: '/achievements',
    icon: Trophy,
  }
];

export function Sidebar({ isOpen = true, onToggle, className }: SidebarProps) {
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  // We only need the current clearAuth function; no subscription required.
  const clearAuth = useAuthStore.getState().clearAuth;
  const { data: currentUserResponse } = useCurrentUser();
  const user = currentUserResponse?.data;
  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-token');
        localStorage.removeItem('laro-auth-storage');
        sessionStorage.removeItem('laro-auth-storage');
      }

      apiClient.clearAuthToken();
      clearAuth();

      // Use a full page navigation so logout is not blocked by stale client state.
      if (typeof window !== 'undefined') {
        window.location.replace('/login');
        return;
      }

      setIsLoggingOut(false);
    }
  };

  return (
    <motion.aside
      className={cn(
        'bg-slate-950 border-r border-slate-800',
        'flex shrink-0 flex-col h-screen overflow-y-auto sticky top-0 z-40',
        'transition-all duration-300 ease-in-out',
        isOpen ? 'w-64' : 'w-16',
        className
      )}
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between">
          {isOpen && (
            <motion.div
              className="flex items-center space-x-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary-400">CZ</span>
              </div>
              <span className="text-sm font-semibold text-slate-100">Court Zone</span>
            </motion.div>
          )}

          <motion.button
            onClick={onToggle}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isOpen ? (
              <ChevronLeft className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item, index) => {
          const href = item.href;
          const isActive = pathname === href;
          const Icon = item.icon;

          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={href}
                className={cn(
                  'flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-150 group relative',
                  isActive
                    ? 'bg-slate-900 text-slate-50 border border-primary-500/60'
                    : 'text-slate-300 hover:text-slate-50 hover:bg-slate-900'
                )}
                onMouseEnter={() => setHoveredItem(item.name)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {/* Icon */}
                <div className="relative">
                  <motion.div
                    className={cn(
                      'w-5 h-5 flex items-center justify-center text-slate-400',
                      isActive && 'text-primary-400'
                    )}
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.div>

                </div>

                {/* Label */}
                {isOpen && (
                  <motion.span
                    className="text-sm font-medium text-slate-100"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    {item.name}
                  </motion.span>
                )}

                {/* Tooltip for collapsed state */}
                {!isOpen && hoveredItem === item.name && (
                  <motion.div
                    className="absolute left-full ml-2 px-2 py-1 bg-dark-200 text-white text-sm rounded-lg border border-primary-400/20 whitespace-nowrap z-50"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                  >
                    {item.name}
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-dark-200 border-l border-b border-primary-400/20 rotate-45" />
                  </motion.div>
                )}

              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-slate-800">
        <div className="space-y-2">
          {/* Settings */}
          <Link
            href="/settings"
            className={cn(
              'flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-150',
              'text-slate-300 hover:text-slate-50 hover:bg-slate-900'
            )}
          >
            <Settings className="w-5 h-5" />
            {isOpen && <span className="font-medium font-primary text-white">Settings</span>}
          </Link>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={cn(
              'w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-150',
              'text-red-300 hover:text-red-200 hover:bg-red-500/10',
              isLoggingOut && 'cursor-not-allowed opacity-60'
            )}
          >
            <LogOut className="w-5 h-5" />
            {isOpen && (
              <span className="font-medium font-primary text-red-300">
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </span>
            )}
          </button>
        </div>

        {/* User Profile (when expanded) */}
        {isOpen && (
          <motion.div
            className="mt-4 p-3 rounded-lg border border-slate-800 bg-slate-900"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {/* fall back to initials if username is present */}
                {user?.username
                  ? user.username
                      .split(' ')
                      .map((part) => part[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()
                  : 'JD'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.username || 'John Doe'}
                </p>
                <p className="text-xs text-white truncate">
                  {user?.rating !== undefined && user?.rating !== null
                    ? `Rating: ${user.rating.toLocaleString()}`
                    : 'Rating: 1,847'}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Basketball court line decoration */}
      <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-primary-400/50 to-transparent" />
    </motion.aside>
  );
}

// Mobile sidebar overlay
export function MobileSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <motion.div
        className={cn(
          'fixed left-0 top-0 bottom-0 z-50 lg:hidden',
          'transform transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        initial={{ x: '-100%' }}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'tween', duration: 0.3 }}
      >
        <Sidebar isOpen={true} onToggle={onClose} />
      </motion.div>
    </>
  );
}

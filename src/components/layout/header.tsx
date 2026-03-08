'use client';

import { motion } from 'framer-motion';
import { Bell, Search, Menu, User } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { GameButton } from '@/components/ui/game-button';
import { NotificationCenter } from '@/components/ui/notification-center';

interface HeaderProps {
  onMenuToggle?: () => void;
  showMobileMenu?: boolean;
  className?: string;
}

export function Header({ onMenuToggle, showMobileMenu = false, className }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationCount] = useState(3); // Mock notification count

  return (
    <motion.header
      className={cn(
        'bg-gradient-to-r from-dark-400 to-dark-300 border-b border-primary-400/20',
        'backdrop-blur-sm sticky top-0 z-50',
        className
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left section - Logo and Mobile Menu */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-lg text-primary-400 hover:text-primary-300 hover:bg-primary-400/10 transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Logo */}
            <motion.div
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative">
                {/* Basketball logo with orange glow */}
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center basketball-glow">
                  <span className="text-white font-bold text-lg">🏀</span>
                </div>
                {/* Animated ring */}
                <motion.div
                  className="absolute inset-0 border-2 border-primary-400 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                  LARO
                </h1>
                <p className="text-xs text-primary-200 font-accent -mt-1">
                  Find Your Game
                </p>
              </div>
            </motion.div>
          </div>

          {/* Center section - Search (hidden on mobile) */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-primary-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-primary-400/30 rounded-lg bg-dark-200/50 text-primary-100 placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                placeholder="Search players, teams, courts..."
              />
              {/* Search suggestions dropdown would go here */}
            </div>
          </div>

          {/* Right section - Actions and Profile */}
          <div className="flex items-center space-x-3">
            {/* Mobile search button */}
            <button className="md:hidden p-2 rounded-lg text-primary-400 hover:text-primary-300 hover:bg-primary-400/10 transition-colors">
              <Search className="w-5 h-5" />
            </button>

            {/* Notifications */}
            <motion.button
              className="relative p-2 rounded-lg text-primary-400 hover:text-primary-300 hover:bg-primary-400/10 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bell className="w-5 h-5" />
              {notificationCount > 0 && (
                <motion.span
                  className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  {notificationCount > 9 ? '9+' : notificationCount}
                </motion.span>
              )}
            </motion.button>

            {/* Sign In / Profile */}
            <div className="hidden sm:flex items-center space-x-2">
              <GameButton
                variant="ghost"
                size="sm"
                className="text-primary-400 hover:text-primary-300"
              >
                Sign In
              </GameButton>
              <GameButton
                variant="primary"
                size="sm"
                glow
              >
                Get Started
              </GameButton>
            </div>

            {/* Mobile profile button */}
            <button className="sm:hidden p-2 rounded-lg text-primary-400 hover:text-primary-300 hover:bg-primary-400/10 transition-colors">
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile search bar (shown when search is active) */}
      <motion.div
        className="md:hidden border-t border-primary-400/20 px-4 py-3"
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        style={{ display: 'none' }} // Toggle this based on search state
      >
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-primary-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-primary-400/30 rounded-lg bg-dark-200/50 text-primary-100 placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Search players, teams, courts..."
          />
        </div>
      </motion.div>

      {/* Basketball court line decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary-400/50 to-transparent" />
    </motion.header>
  );
}

// Authenticated header variant
export function AuthenticatedHeader({ user, onMenuToggle, className, socketConnected = false }: {
  user: { username: string; avatar?: string; rating: number };
  onMenuToggle?: () => void;
  className?: string;
  socketConnected?: boolean;
}) {
  const [notificationCount] = useState(5);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <motion.header
      className={cn(
        'bg-gradient-to-r from-dark-400 to-dark-300 border-b border-primary-400/20',
        'backdrop-blur-sm sticky top-0 z-50',
        className
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left section */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-lg text-primary-400 hover:text-primary-300 hover:bg-primary-400/10 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>

            <motion.div className="flex items-center space-x-2" whileHover={{ scale: 1.05 }}>
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center basketball-glow">
                <span className="text-white font-bold text-lg" role="img" aria-label="Basketball">🏀</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                  LARO
                </h1>
              </div>
            </motion.div>
          </div>

          {/* Right section - User info */}
          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            <motion.div
              className="flex items-center space-x-2 px-2 py-1 rounded-lg bg-dark-200/50"
              title={socketConnected ? 'Real-time features active' : 'Real-time features unavailable'}
              whileHover={{ scale: 1.05 }}
            >
              <div className={cn(
                "w-2 h-2 rounded-full transition-colors",
                socketConnected ? "bg-court-500 shadow-lg shadow-court-500/50" : "bg-gray-500"
              )} />
              <span className="text-xs text-primary-300 hidden sm:block">
                {socketConnected ? 'Live' : 'Offline'}
              </span>
            </motion.div>

            {/* Notifications */}
            <motion.button
              className="relative p-2 rounded-lg text-primary-400 hover:text-primary-300 hover:bg-primary-400/10 transition-colors"
              whileHover={{ scale: 1.05 }}
              onClick={() => setShowNotifications(true)}
            >
              <Bell className="w-5 h-5" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </motion.button>

            {/* User profile */}
            <motion.div
              className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-primary-400/10 transition-colors"
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">{user.username || 'User'}</p>
                <p className="text-xs text-white font-accent">Rating: {user.rating || 0}</p>
              </div>
              <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.username || 'User'} className="w-full h-full rounded-full object-cover" />
                ) : (
                  (user.username || 'U').charAt(0).toUpperCase()
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Notification Center */}
      <NotificationCenter
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </motion.header>
  );
}

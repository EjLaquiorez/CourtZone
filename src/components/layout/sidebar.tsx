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
  ChevronRight
} from 'lucide-react';
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
    emoji: '🏀'
  },
  {
    name: 'Teams',
    href: '/teams',
    icon: Users,
    emoji: '👥'
  },
  {
    name: 'Courts',
    href: '/courts',
    icon: MapPin,
    emoji: '🗺️'
  },
  {
    name: 'Games',
    href: '/games',
    icon: Calendar,
    emoji: '⚡'
  },
  {
    name: 'Profile',
    href: '/profile',
    icon: User,
    emoji: '👤'
  },
  {
    name: 'Achievements',
    href: '/achievements',
    icon: Trophy,
    emoji: '🏆'
  }
];

export function Sidebar({ isOpen = true, onToggle, className }: SidebarProps) {
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <motion.aside
      className={cn(
        'bg-gradient-to-b from-dark-400 to-dark-500 border-r border-primary-400/20',
        'flex flex-col h-screen sticky top-0 z-40',
        'transition-all duration-300 ease-in-out',
        isOpen ? 'w-64' : 'w-16',
        className
      )}
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="p-4 border-b border-primary-400/20">
        <div className="flex items-center justify-between">
          {isOpen && (
            <motion.div
              className="flex items-center space-x-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center basketball-glow">
                <span className="text-white font-bold text-sm">🏀</span>
              </div>
              <span className="text-lg font-display font-bold text-white">LARO</span>
            </motion.div>
          )}

          <motion.button
            onClick={onToggle}
            className="p-2 rounded-lg text-primary-400 hover:text-primary-300 hover:bg-primary-400/10 transition-colors"
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
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={item.href}
                className={cn(
                  'flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 group relative',
                  isActive
                    ? 'bg-primary-500/20 text-white border border-primary-400/30'
                    : 'text-white hover:text-white hover:bg-primary-400/10'
                )}
                onMouseEnter={() => setHoveredItem(item.name)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500 rounded-r"
                    layoutId="activeIndicator"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                {/* Icon with basketball theme */}
                <div className="relative">
                  <motion.div
                    className={cn(
                      'w-6 h-6 flex items-center justify-center',
                      isActive && 'text-primary-400'
                    )}
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isOpen ? (
                      <span className="text-lg">{item.emoji}</span>
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </motion.div>

                  {/* Glow effect for active item */}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 bg-primary-400/20 rounded-full blur-sm"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </div>

                {/* Label */}
                {isOpen && (
                  <motion.span
                    className="font-medium font-primary text-white"
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

                {/* Basketball bounce effect on hover */}
                {isActive && (
                  <motion.div
                    className="absolute right-3 text-primary-400"
                    animate={{ y: [0, -2, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    🏀
                  </motion.div>
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-primary-400/20">
        <div className="space-y-2">
          {/* Settings */}
          <Link
            href="/settings"
            className={cn(
              'flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200',
              'text-white hover:text-white hover:bg-primary-400/10'
            )}
          >
            <Settings className="w-5 h-5" />
            {isOpen && <span className="font-medium font-primary text-white">Settings</span>}
          </Link>

          {/* Logout */}
          <button
            className={cn(
              'w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200',
              'text-red-300 hover:text-red-200 hover:bg-red-400/10'
            )}
          >
            <LogOut className="w-5 h-5" />
            {isOpen && <span className="font-medium font-primary text-red-300">Logout</span>}
          </button>
        </div>

        {/* User Profile (when expanded) */}
        {isOpen && (
          <motion.div
            className="mt-4 p-3 bg-dark-300/50 rounded-lg border border-primary-400/20"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                JD
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">John Doe</p>
                <p className="text-xs text-white truncate">Rating: 1,847</p>
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

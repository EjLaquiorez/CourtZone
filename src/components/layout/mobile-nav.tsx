'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, MapPin, Calendar, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationData {
  count: number;
  type: 'info' | 'warning' | 'success' | 'urgent';
  label?: string;
  timestamp?: Date;
}

interface MobileBottomNavProps {
  notifications?: {
    dashboard?: NotificationData | number;
    teams?: NotificationData | number;
    courts?: NotificationData | number;
    games?: NotificationData | number;
    profile?: NotificationData | number;
    achievements?: NotificationData | number;
  };
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
  }
];

export function MobileBottomNav({ notifications, className }: MobileBottomNavProps) {
  const pathname = usePathname();

  return (
    <motion.nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 lg:hidden',
        'bg-gradient-to-t from-dark-400 to-dark-300 border-t border-primary-400/20',
        'backdrop-blur-sm',
        className
      )}
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
      role="tablist"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navigationItems.map((item, index) => {
          const isActive = pathname === item.href;
          const notificationData = notifications?.[item.name.toLowerCase() as keyof typeof notifications];

          // Handle both legacy number format and new NotificationData format
          const notificationCount = typeof notificationData === 'number' ? notificationData : notificationData?.count || 0;
          const notificationType = typeof notificationData === 'object' ? notificationData.type : 'info';
          const notificationLabel = typeof notificationData === 'object' ? notificationData.label : undefined;

          return (
            <motion.div
              key={item.name}
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 relative',
                  'min-w-[60px] min-h-[60px] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-400',
                  isActive
                    ? 'bg-primary-500/20 text-primary-100'
                    : 'text-primary-300 hover:text-primary-100 hover:bg-primary-400/10'
                )}
                aria-label={`Navigate to ${item.name}`}
                aria-current={isActive ? 'page' : undefined}
                role="tab"
                tabIndex={0}
              >
                {/* Active background glow */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 bg-primary-500/10 rounded-xl basketball-glow"
                    layoutId="mobileActiveBackground"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                {/* Icon */}
                <motion.div
                  className="relative z-10 mb-1"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="text-lg">{item.emoji}</span>

                  {/* Enhanced Notification badge */}
                  {notificationCount && notificationCount > 0 && (
                    <motion.div
                      className="absolute -top-2 -right-2"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      whileHover={{ scale: 1.1 }}
                    >
                      <motion.span
                        className={cn(
                          'flex items-center justify-center text-white text-xs font-bold font-accent rounded-full border-2 border-dark-400 shadow-lg',
                          'min-w-[24px] h-6 px-1.5',
                          // Basketball-themed colors based on notification type - solid backgrounds for better text contrast
                          notificationType === 'urgent' && 'bg-red-600',
                          notificationType === 'warning' && 'bg-orange-500',
                          notificationType === 'success' && 'bg-court-600',
                          notificationType === 'info' && 'bg-primary-600'
                        )}
                        animate={{
                          boxShadow: [
                            '0 0 10px rgba(255, 107, 53, 0.5)',
                            '0 0 20px rgba(255, 107, 53, 0.8)',
                            '0 0 10px rgba(255, 107, 53, 0.5)'
                          ]
                        }}
                        transition={{
                          boxShadow: {
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }
                        }}
                        title={notificationLabel || `${notificationCount} new ${item.name.toLowerCase()} notifications`}
                      >
                        {notificationCount > 99 ? '99+' : notificationCount > 9 ? '9+' : notificationCount}
                      </motion.span>

                      {/* Pulse ring effect for urgent notifications */}
                      {notificationType === 'urgent' && (
                        <motion.div
                          className="absolute inset-0 rounded-full border-2 border-red-400"
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.8, 0, 0.8]
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                      )}
                    </motion.div>
                  )}
                </motion.div>

                {/* Label */}
                <span className={cn(
                  'text-xs font-medium font-primary relative z-10',
                  isActive ? 'text-white' : 'text-white'
                )}>
                  {item.name}
                </span>

                {/* Active indicator dot */}
                {isActive && (
                  <motion.div
                    className="absolute bottom-1 w-1 h-1 bg-primary-500 rounded-full"
                    layoutId="mobileActiveIndicator"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Basketball court line decoration */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary-400/50 to-transparent" />
    </motion.nav>
  );
}

// Quick action floating button for mobile
export function MobileQuickAction() {
  return (
    <motion.div
      className="fixed bottom-20 right-4 z-40 lg:hidden"
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.5 }}
    >
      <motion.button
        className="w-14 h-14 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white shadow-lg basketball-glow focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2 focus:ring-offset-dark-900"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{
          boxShadow: [
            '0 0 20px rgba(255, 107, 53, 0.5)',
            '0 0 40px rgba(255, 107, 53, 0.8)',
            '0 0 20px rgba(255, 107, 53, 0.5)'
          ]
        }}
        transition={{
          boxShadow: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
        aria-label="Quick action - Create new game"
        title="Create new game"
      >
        <span className="text-xl">⚡</span>
      </motion.button>
    </motion.div>
  );
}

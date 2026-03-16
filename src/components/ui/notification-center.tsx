'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
  Bell,
  X,
  Check,
  Clock,
  Users,
  Calendar,
  MessageCircle,
  UserPlus,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'game_reminder' | 'game_update' | 'player_joined' | 'player_left' | 'message' | 'game_cancelled' | 'game_starting';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  gameId?: string;
  userId?: string;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

// Mock notifications
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'game_starting',
    title: 'Game Starting Soon!',
    message: 'Friday Night Pickup starts in 30 minutes at Venice Beach Courts',
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    isRead: false,
    gameId: '1',
    priority: 'high',
    actionUrl: '/games/1'
  },
  {
    id: '2',
    type: 'player_joined',
    title: 'New Player Joined',
    message: 'SpeedDemon joined your Saturday Morning Scrimmage',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    isRead: false,
    gameId: '2',
    userId: 'user4',
    priority: 'medium',
    actionUrl: '/games/2'
  },
  {
    id: '3',
    type: 'message',
    title: 'New Message',
    message: 'PickupKing: "Don\'t forget to bring water bottles!"',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    isRead: true,
    gameId: '1',
    priority: 'low',
    actionUrl: '/games/1'
  },
  {
    id: '4',
    type: 'game_reminder',
    title: 'Game Tomorrow',
    message: 'Elite Training Session is scheduled for tomorrow at 4:00 PM',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    isRead: true,
    gameId: '3',
    priority: 'medium',
    actionUrl: '/games/3'
  },
  {
    id: '5',
    type: 'game_update',
    title: 'Game Updated',
    message: 'Court location changed for Sunday League Championship',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    isRead: true,
    gameId: '4',
    priority: 'high',
    actionUrl: '/games/4'
  }
];

export function NotificationCenter({ isOpen, onClose, className }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread' | 'games' | 'messages'>('all');

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'game_starting': return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'game_reminder': return <Clock className="w-5 h-5 text-blue-400" />;
      case 'game_update': return <Calendar className="w-5 h-5 text-yellow-400" />;
      case 'player_joined': return <UserPlus className="w-5 h-5 text-court-400" />;
      case 'player_left': return <Users className="w-5 h-5 text-orange-400" />;
      case 'message': return <MessageCircle className="w-5 h-5 text-primary-400" />;
      case 'game_cancelled': return <X className="w-5 h-5 text-red-400" />;
      default: return <Bell className="w-5 h-5 text-primary-400" />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-blue-500';
      default: return 'border-l-primary-500';
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(notif =>
      notif.id === notificationId ? { ...notif, isRead: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  };

  const filteredNotifications = notifications.filter(notif => {
    switch (filter) {
      case 'unread': return !notif.isRead;
      case 'games': return ['game_reminder', 'game_update', 'game_starting', 'game_cancelled', 'player_joined', 'player_left'].includes(notif.type);
      case 'messages': return notif.type === 'message';
      default: return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Notification Panel */}
          <motion.div
            className={cn(
              'fixed top-0 right-0 h-full w-full max-w-sm sm:max-w-md lg:max-w-lg bg-slate-950/95 backdrop-blur-md border-l border-slate-800 shadow-2xl z-50',
              className
            )}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 bg-slate-950/95">
              <div className="flex-1 min-w-0">
                <h2 className="mb-1 truncate text-xl sm:text-2xl font-semibold text-slate-100">Notifications</h2>
                {unreadCount > 0 && (
                  <p className="text-xs text-slate-400">{unreadCount} unread</p>
                )}
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0 ml-2">
                {unreadCount > 0 && (
                  <motion.button
                    onClick={markAllAsRead}
                    className="hidden sm:flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-white hover:text-white hover:bg-primary-600 transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Check className="w-4 h-4" />
                    <span>Mark all read</span>
                  </motion.button>
                )}
                {unreadCount > 0 && (
                  <motion.button
                    onClick={markAllAsRead}
                    className="sm:hidden p-2 rounded-lg text-white hover:text-white hover:bg-primary-600 transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Mark all read"
                  >
                    <Check className="w-4 h-4" />
                  </motion.button>
                )}
                <motion.button
                  onClick={onClose}
                  className="p-2 rounded-lg text-white hover:text-white hover:bg-red-600 transition-all duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex space-x-1 border-b border-slate-800 bg-slate-950 p-3">
                {[
                  { id: 'all', label: 'All', count: notifications.length },
                  { id: 'unread', label: 'Unread', count: unreadCount },
                  { id: 'games', label: 'Games', count: notifications.filter(n => ['game_reminder', 'game_update', 'game_starting', 'game_cancelled', 'player_joined', 'player_left'].includes(n.type)).length },
                  { id: 'messages', label: 'Messages', count: notifications.filter(n => n.type === 'message').length }
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setFilter(tab.id as any)}
                  className={cn(
                    'flex min-w-0 flex-1 items-center justify-center space-x-1 rounded-lg px-2 py-1.5 text-[11px] font-medium transition-all duration-150',
                    filter === tab.id
                      ? 'bg-slate-800 text-slate-100'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="truncate text-xs font-semibold">{tab.label}</span>
                  {tab.count > 0 && (
                    <motion.span
                      className={cn(
                        'min-w-[16px] flex-shrink-0 rounded-full px-1 py-0.5 text-center text-xs font-bold',
                        filter === tab.id
                          ? 'bg-primary-500 text-slate-950'
                          : 'bg-slate-700 text-slate-100'
                      )}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      {tab.count > 99 ? '99+' : tab.count}
                    </motion.span>
                  )}
                </motion.button>
              ))}
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center px-6 text-center">
                  <h3 className="mb-2 text-sm font-medium text-slate-100">No notifications</h3>
                  <p className="text-xs text-slate-500">
                    {filter === 'unread' ? 'You are all caught up.' : 'New updates will appear here.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3 p-4">
                  {filteredNotifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      className={cn(
                        'relative mx-1 cursor-pointer rounded-xl border-l-4 p-4 shadow-sm transition-all duration-200',
                        'sm:p-6 sm:mx-2',
                        notification.isRead
                          ? 'bg-slate-900 hover:bg-slate-800 border-slate-700'
                          : 'bg-slate-900 hover:bg-slate-800 border-primary-500',
                        getPriorityColor(notification.priority)
                      )}
                      onClick={() => {
                        markAsRead(notification.id);
                        if (notification.actionUrl) {
                          window.location.href = notification.actionUrl;
                        }
                      }}
                      whileHover={{ x: 6, scale: 1.02 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                          <div className="flex items-start space-x-2 sm:space-x-3">
                        {/* Icon */}
                        <div className="flex-shrink-0 mt-0.5 sm:mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>

                        {/* Content */}
                            <div className="min-w-0 flex-1">
                          {/* Title and Actions Row */}
                          <div className="flex items-start justify-between mb-2 sm:mb-3">
                            <h4 className="flex-1 pr-2 text-base font-semibold leading-tight text-slate-100 sm:text-sm">
                              {notification.title}
                            </h4>
                            <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0 ml-1">
                              {!notification.isRead && (
                                <motion.div
                                  className="h-2 w-2 rounded-full bg-primary-500 shadow-glow"
                                  animate={{
                                    scale: [1, 1.2, 1]
                                  }}
                                  transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                  }}
                                />
                              )}
                              <motion.button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                className="text-white hover:text-red-300 transition-colors p-1 sm:p-1.5 rounded-lg hover:bg-red-600 border border-transparent hover:border-red-400"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <X className="w-3 h-3 sm:w-4 sm:h-4" />
                              </motion.button>
                            </div>
                          </div>

                          {/* Timestamp Row */}
                          <div className="mb-2 sm:mb-3">
                            <span className="rounded-full bg-slate-900 px-2 py-1 text-[11px] font-medium text-slate-400">
                              {getTimeAgo(notification.timestamp)}
                            </span>
                          </div>

                          <p className="mb-3 text-xs leading-relaxed text-slate-300 sm:mb-4">
                            {notification.message}
                          </p>

                          {/* Priority indicator and action buttons */}
                          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                            {notification.priority === 'high' && !notification.isRead && (
                              <div className="flex items-center space-x-2">
                                <motion.div
                                  className="h-2 w-2 rounded-full bg-red-500"
                                  animate={{ scale: [1, 1.3, 1] }}
                                  transition={{ duration: 1, repeat: Infinity }}
                                />
                                <span className="text-[11px] font-medium text-red-300">High priority</span>
                              </div>
                            )}

                            {notification.actionUrl && (
                              <motion.button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.location.href = notification.actionUrl!;
                                }}
                                className="inline-flex items-center justify-center space-x-1 text-xs sm:text-sm text-white hover:text-primary-300 font-semibold transition-colors px-3 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 border border-primary-400 w-full sm:w-auto"
                                whileHover={{ x: 2, scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <span>View Details</span>
                                <span>→</span>
                              </motion.button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-800 bg-slate-950/95 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-xs font-medium text-slate-400">
                  {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
                </span>
                <motion.button
                  className="flex items-center space-x-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-900 hover:text-slate-100 transition-all duration-150"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>Settings</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

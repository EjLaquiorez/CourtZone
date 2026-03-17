'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Check, Loader2, MoreHorizontal, Settings, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { EmptyNotifications } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/loading-states';
import { notificationService } from '@/lib/notifications/service';
import { useNotificationStore } from '@/lib/stores/notification-store';
import {
  dateBucketLabel,
  deriveCategory,
  derivePriority,
  formatTimeAgo,
  getAccentClasses,
  getNotificationIcon,
  type NotificationFilterTab,
} from '@/lib/notifications/ui';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export function NotificationCenter({ isOpen, onClose, className }: NotificationCenterProps) {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    setNotifications,
    setLoading,
    setError,
    markAllAsRead,
    clearAllNotifications,
    removeNotification,
    toggleRead,
  } = useNotificationStore();

  const [tab, setTab] = useState<NotificationFilterTab>('all');
  const [openMenuForId, setOpenMenuForId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close overflow menu on outside click / escape.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenMenuForId(null);
    };
    const onPointerDown = (e: PointerEvent) => {
      if (!menuRef.current) return;
      if (openMenuForId && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuForId(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('pointerdown', onPointerDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('pointerdown', onPointerDown);
    };
  }, [openMenuForId]);

  // Fetch notifications when panel opens (keeps store as single source of truth).
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    (async () => {
      try {
        setError(null);
        setLoading(true);
        const res = await notificationService.getNotifications(1, 50, false);
        if (cancelled) return;
        setNotifications(
          (res.notifications || []).map((n) => ({
            ...n,
            createdAt: n.createdAt instanceof Date ? n.createdAt : new Date(n.createdAt),
          }))
        );
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message || 'Failed to load notifications');
      } finally {
        if (cancelled) return;
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen, setError, setLoading, setNotifications]);

  const filtered = useMemo(() => {
    const base = notifications.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return base.filter((n) => {
      const category = deriveCategory(n);
      if (tab === 'unread') return !n.isRead;
      if (tab === 'all') return true;
      return category === tab;
    });
  }, [notifications, tab]);

  const groupedByDate = useMemo(() => {
    const groups: Record<string, typeof filtered> = {};
    for (const n of filtered) {
      const label = dateBucketLabel(n.createdAt);
      groups[label] = groups[label] ? [...groups[label], n] : [n];
    }
    return ['Today', 'Yesterday', 'Earlier']
      .filter((k) => groups[k]?.length)
      .map((k) => ({ label: k, items: groups[k] }));
  }, [filtered]);

  const counts = useMemo(() => {
    const by = {
      all: notifications.length,
      unread: unreadCount,
      games: 0,
      messages: 0,
      team: 0,
      courts: 0,
    };
    for (const n of notifications) {
      const c = deriveCategory(n);
      if (c === 'games') by.games++;
      if (c === 'messages') by.messages++;
      if (c === 'team') by.team++;
      if (c === 'courts') by.courts++;
    }
    return by;
  }, [notifications, unreadCount]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Notification Panel */}
          <motion.div
            className={cn(
              // Solid surface + layered shadow for clear separation (no glass/blur).
              'fixed top-0 right-0 h-full w-full max-w-sm sm:max-w-md lg:max-w-[420px] bg-slate-900 z-50',
              // Soft, realistic elevation (multi-layer, slight vertical offset).
              'shadow-[0_22px_60px_rgba(0,0,0,0.72),0_10px_24px_rgba(0,0,0,0.55),0_2px_8px_rgba(0,0,0,0.35)]',
              // Optional faint outline instead of a bright border.
              'ring-1 ring-white/6',
              className
            )}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            role="dialog"
            aria-modal="true"
            aria-label="Notifications"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-white/8 bg-slate-900">
              <div className="flex-1 min-w-0">
                <h2 className="truncate text-base font-semibold text-slate-100">Notifications</h2>
                <p className="text-[11px] text-slate-400">
                  {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                </p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                <button
                  onClick={() => router.push('/notifications')}
                  className="hidden sm:inline-flex items-center justify-center h-9 w-9 rounded-lg text-slate-300 hover:text-slate-100 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                  aria-label="Open notifications page"
                  title="Open notifications page"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (unreadCount > 0) markAllAsRead();
                  }}
                  className={cn(
                    'inline-flex items-center justify-center h-9 w-9 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-slate-900',
                    unreadCount > 0
                      ? 'text-slate-200 hover:text-slate-100 hover:bg-white/5'
                      : 'text-slate-600 cursor-not-allowed'
                  )}
                  aria-label="Mark all as read"
                  title="Mark all as read"
                  disabled={unreadCount === 0}
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (notifications.length > 0) clearAllNotifications();
                  }}
                  className={cn(
                    'inline-flex items-center justify-center h-9 w-9 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-slate-900',
                    notifications.length > 0
                      ? 'text-slate-200 hover:text-slate-100 hover:bg-white/5'
                      : 'text-slate-600 cursor-not-allowed'
                  )}
                  aria-label="Clear all notifications"
                  title="Clear all"
                  disabled={notifications.length === 0}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="inline-flex items-center justify-center h-9 w-9 rounded-lg text-slate-200 hover:text-slate-100 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                  aria-label="Close notifications"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="sticky top-[60px] z-10 border-b border-white/8 bg-slate-900 px-3 py-2">
              <div className="flex gap-1">
                {(
                  [
                    { id: 'all', label: 'All', count: counts.all },
                    { id: 'unread', label: 'Unread', count: counts.unread },
                    { id: 'games', label: 'Games', count: counts.games },
                    { id: 'messages', label: 'Messages', count: counts.messages },
                    { id: 'team', label: 'Team', count: counts.team },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={cn(
                      'group relative flex-1 min-w-0 h-9 rounded-lg px-2 text-[12px] font-medium transition-colors',
                      tab === t.id
                        ? 'bg-slate-950 text-slate-100 ring-1 ring-white/6'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                    )}
                    aria-pressed={tab === t.id}
                  >
                    <span className="inline-flex items-center justify-center gap-1 w-full">
                      <span className="truncate">{t.label}</span>
                      {t.count > 0 && (
                        <span
                          className={cn(
                            'ml-0.5 inline-flex min-w-[18px] h-[18px] items-center justify-center rounded-full px-1 text-[11px] font-semibold',
                            tab === t.id ? 'bg-primary-500 text-slate-950' : 'bg-white/10 text-slate-200'
                          )}
                          aria-label={`${t.count} ${t.label} notifications`}
                        >
                          {t.count > 99 ? '99+' : t.count}
                        </span>
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto bg-slate-900">
              {error && (
                <div className="px-4 py-3 border-b border-white/8 bg-danger/10 text-danger">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs">{error}</p>
                    <button
                      className="text-xs font-medium text-slate-100 hover:text-white underline underline-offset-4"
                      onClick={() => {
                        // Re-trigger fetch by toggling open state via close/open
                        onClose();
                        setTimeout(() => {
                          // Best-effort reopen if parent keeps state.
                        }, 0);
                      }}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}

              {isLoading ? (
                <div className="px-3 py-2">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-2 py-3 border-b border-white/6">
                      <Skeleton variant="circular" width={36} height={36} />
                      <div className="flex-1 min-w-0">
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-3 w-5/6" />
                      </div>
                      <Skeleton className="h-3 w-10" />
                    </div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <EmptyNotifications onExploreGames={() => router.push('/games')} />
              ) : (
                <div className="py-4">
                  {groupedByDate.map((group) => (
                    <div key={group.label} className="pb-4">
                      {/* Section label with breathing room so it doesn't collide with cards */}
                      <div className="px-4 pt-6 pb-3 text-[11px] font-semibold tracking-wide text-slate-500 bg-slate-900">
                        {group.label}
                      </div>

                      {/* Panel padding + consistent vertical rhythm (12–16px gaps) */}
                      <div className="px-4 pt-1 pb-2 space-y-3">
                        {group.items.map((n) => {
                          const Icon = getNotificationIcon(n);
                          const priority = derivePriority(n);
                          const accent = getAccentClasses(priority);
                          const time = formatTimeAgo(n.createdAt);
                          const sourceText =
                            n.source?.name ||
                            (typeof n.data?.source === 'string' ? n.data.source : undefined) ||
                            (deriveCategory(n) === 'system' ? 'Court Zone' : undefined);
                          const deepLink = n.deepLink || (typeof n.data?.deepLink === 'string' ? n.data.deepLink : undefined);

                          return (
                            <div
                              key={n.id}
                              className={cn(
                                // Card surface (fully opaque) + ONE primary separation method: soft shadow.
                                // Avoid heavy outlines/glows so cards don't feel "stacked".
                                'group relative grid grid-cols-[auto,1fr,auto] items-start gap-3 px-4 py-3 rounded-lg cursor-pointer',
                                // Slight surface contrast from panel + subtle elevation.
                                'bg-slate-950 shadow-[0_1px_0_rgba(255,255,255,0.04),0_10px_22px_rgba(0,0,0,0.35)]',
                                'hover:shadow-[0_1px_0_rgba(255,255,255,0.05),0_14px_28px_rgba(0,0,0,0.45)]',
                                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-slate-900',
                                // Unread stays subtle: rely on dot + accent bar + slightly stronger title.
                                !n.isRead && 'bg-slate-950'
                              )}
                              tabIndex={0}
                              role="button"
                              aria-label={`${n.isRead ? 'Read' : 'Unread'} notification: ${n.title}`}
                              onClick={() => {
                                if (!n.isRead) toggleRead(n.id);
                                if (deepLink) router.push(deepLink);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  if (!n.isRead) toggleRead(n.id);
                                  if (deepLink) router.push(deepLink);
                                }
                                if (e.key === 'Delete' || e.key === 'Backspace') {
                                  e.preventDefault();
                                  removeNotification(n.id);
                                }
                              }}
                            >
                              {/* Accent bar */}
                              <div className="absolute left-0 top-0 bottom-0 w-[2px] opacity-80 rounded-l-lg overflow-hidden">
                                <div className={cn('h-full w-full', accent.bar)} />
                              </div>

                              {/* Leading */}
                              <div className="mt-0.5 relative">
                                {n.source?.avatarUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={n.source.avatarUrl}
                                    alt={n.source?.name || 'Notification source'}
                                    className="h-9 w-9 rounded-full object-cover border border-white/10"
                                  />
                                ) : (
                                  <div className="h-9 w-9 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center">
                                    <Icon className={cn('w-4 h-4', accent.icon)} aria-hidden="true" />
                                  </div>
                                )}
                                {!n.isRead && (
                                  <span
                                    className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-primary-500 ring-2 ring-slate-950"
                                    aria-hidden="true"
                                  />
                                )}
                              </div>

                              {/* Content */}
                              <div className="min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <p
                                      className={cn(
                                        'text-[14px] leading-5 font-semibold truncate',
                                        n.isRead ? 'text-slate-100' : 'text-slate-50'
                                      )}
                                    >
                                      {n.title}
                                    </p>
                                    <p className="text-[13px] leading-[1.35rem] text-slate-200 line-clamp-3">
                                      {n.message}
                                    </p>
                                  </div>
                                </div>

                                <div className="mt-1.5 flex items-center gap-2 text-[12px] text-slate-400">
                                  <span aria-label={`Time: ${time}`}>{time}</span>
                                  {sourceText && (
                                    <>
                                      <span aria-hidden="true">•</span>
                                      <span className="truncate text-slate-400">{sourceText}</span>
                                    </>
                                  )}
                                  {priority === 'high' && !n.isRead && (
                                    <>
                                      <span aria-hidden="true">•</span>
                                      <span className="rounded-full bg-danger/15 text-danger px-1.5 py-0.5 text-[10px] font-semibold">
                                        URGENT
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Hover actions */}
                              <div className="mt-0.5 flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                <button
                                  className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/6 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleRead(n.id);
                                  }}
                                  aria-label={n.isRead ? 'Mark as unread' : 'Mark as read'}
                                  title={n.isRead ? 'Mark unread' : 'Mark read'}
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/6 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeNotification(n.id);
                                  }}
                                  aria-label="Dismiss notification"
                                  title="Dismiss"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                                <div className="relative">
                                  <button
                                    className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/6 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenMenuForId((prev) => (prev === n.id ? null : n.id));
                                    }}
                                    aria-label="More options"
                                    aria-expanded={openMenuForId === n.id}
                                  >
                                    <MoreHorizontal className="w-4 h-4" />
                                  </button>

                                  {openMenuForId === n.id && (
                                    <div
                                      ref={menuRef}
                                      className="absolute right-0 mt-1 w-44 rounded-xl border border-white/10 bg-slate-950 shadow-xl overflow-hidden"
                                      role="menu"
                                    >
                                      <button
                                        className="w-full px-3 py-2 text-left text-[12px] text-slate-200 hover:bg-white/6"
                                        role="menuitem"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setOpenMenuForId(null);
                                          toggleRead(n.id);
                                        }}
                                      >
                                        {n.isRead ? 'Mark as unread' : 'Mark as read'}
                                      </button>
                                      <button
                                        className="w-full px-3 py-2 text-left text-[12px] text-slate-200 hover:bg-white/6"
                                        role="menuitem"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setOpenMenuForId(null);
                                          if (deepLink) router.push(deepLink);
                                        }}
                                        disabled={!deepLink}
                                      >
                                        View details
                                      </button>
                                      <button
                                        className="w-full px-3 py-2 text-left text-[12px] text-danger hover:bg-danger/10"
                                        role="menuitem"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setOpenMenuForId(null);
                                          removeNotification(n.id);
                                        }}
                                      >
                                        Dismiss
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-white/8 bg-slate-900 px-4 py-3">
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-slate-500">
                  {filtered.length} item{filtered.length !== 1 ? 's' : ''} shown
                </span>
                <div className="flex items-center gap-2 text-slate-400">
                  {isLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Syncing
                    </span>
                  ) : (
                    <button
                      className="inline-flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-white/5 hover:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                      onClick={() => router.push('/notifications/settings')}
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

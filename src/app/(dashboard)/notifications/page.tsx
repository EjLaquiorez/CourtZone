'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronLeft, Loader2, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { notificationService } from '@/lib/notifications/service';
import { useNotificationStore } from '@/lib/stores/notification-store';
import { EmptyNotifications } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/loading-states';
import {
  dateBucketLabel,
  deriveCategory,
  derivePriority,
  formatTimeAgo,
  getAccentClasses,
  getNotificationIcon,
  type NotificationFilterTab,
} from '@/lib/notifications/ui';

const mobileTabs: Array<{ id: NotificationFilterTab; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'games', label: 'Games' },
  { id: 'messages', label: 'Messages' },
];

export default function NotificationsPage() {
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

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setError(null);
        setLoading(true);
        const res = await notificationService.getNotifications(1, 50, tab === 'unread');
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
  }, [setError, setLoading, setNotifications, tab]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-slate-950 border-b border-white/10">
        <div className="h-14 px-3 flex items-center justify-between">
          <button
            className="h-10 w-10 rounded-xl inline-flex items-center justify-center text-slate-200 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-slate-950"
            onClick={() => router.back()}
            aria-label="Back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0 flex-1 px-2">
            <p className="text-[15px] font-semibold text-slate-100 truncate">Notifications</p>
            <p className="text-[11px] text-slate-400 truncate">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              className={cn(
                'h-10 w-10 rounded-xl inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-slate-950',
                unreadCount > 0 ? 'text-slate-200 hover:bg-white/5' : 'text-slate-600 cursor-not-allowed'
              )}
              onClick={() => unreadCount > 0 && markAllAsRead()}
              disabled={unreadCount === 0}
              aria-label="Mark all as read"
            >
              <Check className="w-5 h-5" />
            </button>
            <button
              className={cn(
                'h-10 w-10 rounded-xl inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-slate-950',
                notifications.length > 0 ? 'text-slate-200 hover:bg-white/5' : 'text-slate-600 cursor-not-allowed'
              )}
              onClick={() => notifications.length > 0 && clearAllNotifications()}
              disabled={notifications.length === 0}
              aria-label="Clear all notifications"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter chips */}
        <div className="px-3 pb-3">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {mobileTabs.map((t) => (
              <button
                key={t.id}
                className={cn(
                  'h-9 px-3 rounded-full text-[12px] font-medium whitespace-nowrap border transition-colors',
                  tab === t.id
                    ? 'bg-white/8 border-white/10 text-slate-100'
                    : 'bg-transparent border-white/10 text-slate-400 hover:text-slate-100 hover:bg-white/5'
                )}
                onClick={() => setTab(t.id)}
                aria-pressed={tab === t.id}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      {error && (
        <div className="mx-3 mt-3 rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-danger text-xs">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="px-3 py-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-2 py-3 border-b border-white/6">
              <Skeleton variant="circular" width={40} height={40} />
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
        <div className="pb-24">
          {groupedByDate.map((group) => (
            <div key={group.label}>
              <div className="sticky top-[112px] z-10 px-4 py-2 text-[11px] font-semibold tracking-wide text-slate-500 bg-slate-950">
                {group.label}
              </div>
              <div className="border-t border-white/6">
                {group.items.map((n) => (
                  <SwipeableNotificationRow
                    key={n.id}
                    id={n.id}
                    isRead={n.isRead}
                    title={n.title}
                    message={n.message}
                    createdAt={n.createdAt}
                    priority={derivePriority(n)}
                    leadingIcon={getNotificationIcon(n)}
                    deepLink={n.deepLink || (typeof n.data?.deepLink === 'string' ? n.data.deepLink : undefined)}
                    onOpen={(href) => href && router.push(href)}
                    onToggleRead={() => toggleRead(n.id)}
                    onDismiss={() => removeNotification(n.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom sync hint */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-slate-950 border-t border-white/10 px-4 py-2 text-[11px] text-slate-500 flex items-center justify-between">
        <span>Swipe left: read/unread • Swipe right: dismiss</span>
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Syncing
          </span>
        ) : (
          <span className="inline-flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-court-500" />
            Up to date
          </span>
        )}
      </div>
    </div>
  );
}

function SwipeableNotificationRow(props: {
  id: string;
  isRead: boolean;
  title: string;
  message: string;
  createdAt: Date | string | number;
  priority: 'high' | 'medium' | 'low';
  leadingIcon: any;
  deepLink?: string;
  onOpen: (href?: string) => void;
  onToggleRead: () => void;
  onDismiss: () => void;
}) {
  const {
    isRead,
    title,
    message,
    createdAt,
    priority,
    leadingIcon: Icon,
    deepLink,
    onOpen,
    onToggleRead,
    onDismiss,
  } = props;

  const accent = getAccentClasses(priority);
  const time = formatTimeAgo(createdAt);

  const swipeThreshold = 72;

  return (
    <div className="relative overflow-hidden">
      {/* Swipe backgrounds */}
      <div className="absolute inset-0 flex items-stretch">
        {/* Swipe right = dismiss */}
        <div className="flex-1 bg-danger/15 flex items-center pl-4">
          <span className="inline-flex items-center gap-2 text-danger text-xs font-semibold">
            <X className="w-4 h-4" /> Dismiss
          </span>
        </div>
        {/* Swipe left = toggle read */}
        <div className="flex-1 bg-primary-500/12 flex items-center justify-end pr-4">
          <span className="inline-flex items-center gap-2 text-primary-200 text-xs font-semibold">
            <Check className="w-4 h-4" /> {isRead ? 'Unread' : 'Read'}
          </span>
        </div>
      </div>

      <motion.div
        className={cn(
          'relative z-10 grid grid-cols-[auto,1fr,auto] gap-3 px-4 py-3 border-b border-white/6',
          isRead ? 'bg-slate-950' : cn('bg-slate-950', accent.tint)
        )}
        drag="x"
        dragConstraints={{ left: -120, right: 120 }}
        dragElastic={0.12}
        onDragEnd={(_, info) => {
          if (info.offset.x > swipeThreshold) {
            onDismiss();
          } else if (info.offset.x < -swipeThreshold) {
            onToggleRead();
          }
        }}
        whileTap={{ scale: 0.995 }}
        onClick={() => {
          if (!isRead) onToggleRead();
          onOpen(deepLink);
        }}
        role="button"
        tabIndex={0}
        aria-label={`${isRead ? 'Read' : 'Unread'} notification: ${title}`}
      >
        {/* Accent bar */}
        <div className="absolute left-0 top-0 bottom-0 w-[2px] opacity-70">
          <div className={cn('h-full w-full', accent.bar)} />
        </div>

        <div className="mt-0.5 relative">
          <div className="h-10 w-10 rounded-full bg-white/6 border border-white/10 flex items-center justify-center">
            <Icon className={cn('w-4 h-4', accent.icon)} aria-hidden="true" />
          </div>
          {!isRead && (
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-primary-500 ring-2 ring-slate-950" aria-hidden="true" />
          )}
        </div>

        <div className="min-w-0">
          <p className={cn('text-[15px] leading-5 font-semibold truncate', isRead ? 'text-slate-100' : 'text-slate-50')}>
            {title}
          </p>
          <p className="text-[13px] leading-5 text-slate-300 line-clamp-3">{message}</p>
          <div className="mt-1 text-[12px] text-slate-400">{time}</div>
        </div>

        {/* Minimal trailing affordance */}
        <div className="mt-0.5 flex items-center">
          <span className="text-[11px] text-slate-500">{priority === 'high' && !isRead ? 'URGENT' : ''}</span>
        </div>
      </motion.div>

      <AnimatePresence>
        {/* no hover actions on mobile */}
      </AnimatePresence>
    </div>
  );
}


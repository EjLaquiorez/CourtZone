import type { Notification } from '@/types';
import {
  Bell,
  Calendar,
  MessageCircle,
  Users,
  MapPin,
  Trophy,
  AlertCircle,
  Megaphone,
  Sparkles,
} from 'lucide-react';

export type NotificationFilterTab = 'all' | 'unread' | 'games' | 'messages' | 'team' | 'courts';

export function deriveCategory(n: Notification): NonNullable<Notification['category']> {
  if (n.category) return n.category;
  switch (n.type) {
    case 'message':
      return 'messages';
    case 'team_invite':
    case 'team_activity':
    case 'team_roster_update':
      return 'team';
    case 'court_activity':
    case 'court_availability':
      return 'courts';
    case 'achievement':
    case 'milestone':
      return 'achievements';
    case 'system':
      return 'system';
    default:
      return 'games';
  }
}

export function derivePriority(n: Notification): NonNullable<Notification['priority']> {
  if (n.priority) return n.priority;
  switch (n.type) {
    case 'game_starting':
    case 'game_cancelled':
    case 'game_schedule_change':
      return 'high';
    case 'game_invite':
    case 'team_invite':
    case 'team_activity':
    case 'game_result':
      return 'medium';
    default:
      return 'low';
  }
}

export function getNotificationIcon(n: Notification) {
  const category = deriveCategory(n);
  const type = n.type;

  if (type === 'game_starting' || type === 'game_alert') return AlertCircle;
  if (type === 'game_schedule_change') return Calendar;
  if (type === 'message') return MessageCircle;
  if (type === 'team_activity' || type === 'team_roster_update' || type === 'team_invite') return Users;
  if (type === 'court_activity' || type === 'court_availability') return MapPin;
  if (type === 'achievement' || type === 'milestone') return Trophy;
  if (type === 'system') return Megaphone;

  switch (category) {
    case 'games':
      return Calendar;
    case 'messages':
      return MessageCircle;
    case 'team':
      return Users;
    case 'courts':
      return MapPin;
    case 'achievements':
      return Sparkles;
    case 'system':
    default:
      return Bell;
  }
}

export function getAccentClasses(priority: NonNullable<Notification['priority']>) {
  switch (priority) {
    case 'high':
      return {
        bar: 'bg-danger',
        icon: 'text-danger',
        tint: 'bg-danger/8',
      };
    case 'medium':
      return {
        bar: 'bg-warning',
        icon: 'text-warning',
        tint: 'bg-warning/6',
      };
    case 'low':
    default:
      return {
        bar: 'bg-primary-500',
        icon: 'text-primary-400',
        tint: 'bg-primary-500/6',
      };
  }
}

export function formatTimeAgo(input: Date | string | number) {
  const ts = input instanceof Date ? input : new Date(input);
  const now = new Date();
  const diff = now.getTime() - ts.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (Number.isNaN(ts.getTime())) return '';
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return ts.toLocaleDateString();
}

export function dateBucketLabel(createdAt: Date | string | number) {
  const d = createdAt instanceof Date ? createdAt : new Date(createdAt);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfToday.getDate() - 1);

  if (d >= startOfToday) return 'Today';
  if (d >= startOfYesterday) return 'Yesterday';
  return 'Earlier';
}


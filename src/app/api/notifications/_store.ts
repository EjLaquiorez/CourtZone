import type { Notification } from '@/types';

type NotificationSettings = {
  email: {
    gameInvites: boolean;
    teamInvites: boolean;
    gameResults: boolean;
    achievements: boolean;
    systemUpdates: boolean;
    weeklyDigest: boolean;
  };
  push: {
    gameInvites: boolean;
    teamInvites: boolean;
    gameResults: boolean;
    achievements: boolean;
    systemUpdates: boolean;
    liveGameUpdates: boolean;
  };
  inApp: {
    gameInvites: boolean;
    teamInvites: boolean;
    gameResults: boolean;
    achievements: boolean;
    systemUpdates: boolean;
    liveGameUpdates: boolean;
  };
};

declare global {
  // eslint-disable-next-line no-var
  var __cz_notifications: Notification[] | undefined;
  // eslint-disable-next-line no-var
  var __cz_notification_settings: NotificationSettings | undefined;
}

const defaultSettings: NotificationSettings = {
  email: {
    gameInvites: true,
    teamInvites: true,
    gameResults: true,
    achievements: true,
    systemUpdates: false,
    weeklyDigest: false,
  },
  push: {
    gameInvites: true,
    teamInvites: true,
    gameResults: false,
    achievements: true,
    systemUpdates: false,
    liveGameUpdates: true,
  },
  inApp: {
    gameInvites: true,
    teamInvites: true,
    gameResults: true,
    achievements: true,
    systemUpdates: true,
    liveGameUpdates: true,
  },
};

function seedNotifications(): Notification[] {
  const now = Date.now();
  const make = (partial: Omit<Notification, 'userId'>): Notification => ({
    userId: 'demo-user',
    ...partial,
  });

  return [
    make({
      id: 'n1',
      type: 'game_starting',
      category: 'games',
      priority: 'high',
      title: 'Game starting soon',
      message: 'Friday Night Pickup starts in 30 minutes at Venice Beach Courts.',
      deepLink: '/games/game1',
      isRead: false,
      createdAt: new Date(now - 5 * 60 * 1000),
      source: { type: 'system', name: 'Court Zone' },
    }),
    make({
      id: 'n2',
      type: 'team_activity',
      category: 'team',
      priority: 'medium',
      title: 'Team update',
      message: '3 players joined Wildcats.',
      deepLink: '/teams/team1',
      isRead: false,
      createdAt: new Date(now - 2 * 60 * 60 * 1000),
      source: { type: 'team', id: 'team1', name: 'Wildcats' },
      groupKey: 'team:team1:member_joined',
      groupCount: 3,
    }),
    make({
      id: 'n3',
      type: 'message',
      category: 'messages',
      priority: 'low',
      title: 'New message',
      message: 'PickupKing: “Don’t forget to bring water bottles.”',
      deepLink: '/games/game1',
      isRead: true,
      createdAt: new Date(now - 4 * 60 * 60 * 1000),
      source: { type: 'user', id: 'user2', name: 'PickupKing' },
    }),
    make({
      id: 'n4',
      type: 'game_schedule_change',
      category: 'games',
      priority: 'high',
      title: 'Schedule change',
      message: 'Court location changed for Sunday League Championship.',
      deepLink: '/games/game2',
      isRead: true,
      createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000),
      source: { type: 'system', name: 'Court Zone' },
    }),
  ];
}

export function getNotificationStore() {
  if (!globalThis.__cz_notifications) {
    globalThis.__cz_notifications = seedNotifications();
  }
  return globalThis.__cz_notifications;
}

export function setNotificationStore(next: Notification[]) {
  globalThis.__cz_notifications = next;
}

export function getSettingsStore(): NotificationSettings {
  if (!globalThis.__cz_notification_settings) {
    globalThis.__cz_notification_settings = defaultSettings;
  }
  return globalThis.__cz_notification_settings;
}

export function setSettingsStore(next: NotificationSettings) {
  globalThis.__cz_notification_settings = next;
}


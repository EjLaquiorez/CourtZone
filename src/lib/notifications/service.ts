// Notification service for push notifications and email
import { apiClient } from '@/lib/api';
import { Notification as AppNotification } from '@/types';

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface EmailNotificationTemplate {
  id: string;
  name: string;
  subject: string;
  template: string;
  variables: string[];
}

export interface NotificationSettings {
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
}

export const notificationService = {
  // Subscribe to push notifications
  async subscribeToPush(subscription: PushSubscription): Promise<void> {
    const subscriptionData: PushSubscriptionData = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.getKey('p256dh') ?
          btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))) : '',
        auth: subscription.getKey('auth') ?
          btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))) : '',
      },
    };

    const response = await apiClient.post('/notifications/push/subscribe', subscriptionData);

    if (!response.success) {
      throw new Error(response.message || 'Failed to subscribe to push notifications');
    }
  },

  // Unsubscribe from push notifications
  async unsubscribeFromPush(subscription: PushSubscription): Promise<void> {
    const response = await apiClient.post('/notifications/push/unsubscribe', {
      endpoint: subscription.endpoint,
    });

    if (!response.success) {
      throw new Error(response.message || 'Failed to unsubscribe from push notifications');
    }
  },

  // Send test push notification
  async sendTestPushNotification(): Promise<void> {
    const response = await apiClient.post('/notifications/push/test');

    if (!response.success) {
      throw new Error(response.message || 'Failed to send test notification');
    }
  },

  // Get user notifications
  async getNotifications(
    page: number = 1,
    limit: number = 20,
    unreadOnly: boolean = false
  ): Promise<{
    notifications: AppNotification[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const response = await apiClient.get('/notifications', {
      page,
      limit,
      unreadOnly,
    });

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to get notifications');
  },

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    const response = await apiClient.patch(`/notifications/${notificationId}/read`);

    if (!response.success) {
      throw new Error(response.message || 'Failed to mark notification as read');
    }
  },

  // Mark all notifications as read
  async markAllAsRead(): Promise<void> {
    const response = await apiClient.patch('/notifications/mark-all-read');

    if (!response.success) {
      throw new Error(response.message || 'Failed to mark all notifications as read');
    }
  },

  // Delete notification
  async deleteNotification(notificationId: string): Promise<void> {
    const response = await apiClient.delete(`/notifications/${notificationId}`);

    if (!response.success) {
      throw new Error(response.message || 'Failed to delete notification');
    }
  },

  // Get notification settings
  async getNotificationSettings(): Promise<NotificationSettings> {
    const response = await apiClient.get<NotificationSettings>('/notifications/settings');

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to get notification settings');
  },

  // Update notification settings
  async updateNotificationSettings(settings: Partial<NotificationSettings>): Promise<NotificationSettings> {
    const response = await apiClient.patch<NotificationSettings>('/notifications/settings', settings);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to update notification settings');
  },

  // Send email notification
  async sendEmailNotification(
    templateId: string,
    recipientEmail: string,
    variables: Record<string, any>
  ): Promise<void> {
    const response = await apiClient.post('/notifications/email/send', {
      templateId,
      recipientEmail,
      variables,
    });

    if (!response.success) {
      throw new Error(response.message || 'Failed to send email notification');
    }
  },

  // Get email templates
  async getEmailTemplates(): Promise<EmailNotificationTemplate[]> {
    const response = await apiClient.get<EmailNotificationTemplate[]>('/notifications/email/templates');

    if (response.success && response.data) {
      return response.data;
    }

    return [];
  },

  // Schedule notification
  async scheduleNotification(
    type: AppNotification['type'],
    title: string,
    message: string,
    scheduledFor: Date,
    data?: Record<string, any>
  ): Promise<void> {
    const response = await apiClient.post('/notifications/schedule', {
      type,
      title,
      message,
      scheduledFor,
      data,
    });

    if (!response.success) {
      throw new Error(response.message || 'Failed to schedule notification');
    }
  },

  // Get notification statistics
  async getNotificationStats(): Promise<{
    total: number;
    unread: number;
    byType: Record<string, number>;
    recentActivity: Array<{
      date: string;
      count: number;
    }>;
  }> {
    const response = await apiClient.get('/notifications/stats');

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to get notification statistics');
  },

  // Request notification permission
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('This browser does not support notifications');
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    return permission;
  },

  // Show browser notification
  showBrowserNotification(
    title: string,
    options?: NotificationOptions
  ): Notification | null {
    if ('Notification' in window && Notification.permission === 'granted') {
      return new Notification(title, {
        icon: '/icon-192x192.png',
        badge: '/icon-72x72.png',
        tag: 'laro-notification',
        renotify: true,
        ...options,
      });
    }
    return null;
  },

  // Check if push notifications are supported
  isPushSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window
    );
  },

  // Register service worker for push notifications
  async registerServiceWorker(): Promise<ServiceWorkerRegistration> {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service workers are not supported');
    }

    const registration = await navigator.serviceWorker.register('/sw.js');

    // Wait for the service worker to be ready
    await navigator.serviceWorker.ready;

    return registration;
  },
};

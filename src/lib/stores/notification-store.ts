// Notification store using Zustand
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Notification as AppNotification } from '@/types';

export interface NotificationPreferences {
  email: {
    gameInvites: boolean;
    teamInvites: boolean;
    gameResults: boolean;
    achievements: boolean;
    systemUpdates: boolean;
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

interface NotificationState {
  // Notifications
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;

  // Preferences
  preferences: NotificationPreferences;

  // Push notification state
  pushSubscription: PushSubscription | null;
  isPushSupported: boolean;
  isPushEnabled: boolean;

  // Actions
  addNotification: (notification: AppNotification) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
  setNotifications: (notifications: AppNotification[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Preference actions
  updatePreferences: (preferences: Partial<NotificationPreferences>) => void;

  // Push notification actions
  enablePushNotifications: () => Promise<void>;
  disablePushNotifications: () => Promise<void>;
  setPushSubscription: (subscription: PushSubscription | null) => void;

  // Utility actions
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  requestNotificationPermission: () => Promise<NotificationPermission>;
}

const defaultPreferences: NotificationPreferences = {
  email: {
    gameInvites: true,
    teamInvites: true,
    gameResults: true,
    achievements: true,
    systemUpdates: false,
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

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      // Initial state
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      error: null,
      preferences: defaultPreferences,
      pushSubscription: null,
      isPushSupported: typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window,
      isPushEnabled: false,

      // Basic notification actions
      addNotification: (notification) => set((state) => {
        const newNotifications = [notification, ...state.notifications];
        const newUnreadCount = notification.isRead ? state.unreadCount : state.unreadCount + 1;

        // Show in-app notification if enabled
        if (state.preferences.inApp[notification.type as keyof typeof state.preferences.inApp]) {
          get().showToast(notification.message, 'info');
        }

        return {
          notifications: newNotifications,
          unreadCount: newUnreadCount,
        };
      }),

      markAsRead: (notificationId) => set((state) => {
        const updatedNotifications = state.notifications.map(notification =>
          notification.id === notificationId && !notification.isRead
            ? { ...notification, isRead: true }
            : notification
        );

        const unreadCount = updatedNotifications.filter(n => !n.isRead).length;

        return {
          notifications: updatedNotifications,
          unreadCount,
        };
      }),

      markAllAsRead: () => set((state) => ({
        notifications: state.notifications.map(notification => ({
          ...notification,
          isRead: true,
        })),
        unreadCount: 0,
      })),

      removeNotification: (notificationId) => set((state) => {
        const notification = state.notifications.find(n => n.id === notificationId);
        const updatedNotifications = state.notifications.filter(n => n.id !== notificationId);
        const unreadCount = notification && !notification.isRead
          ? state.unreadCount - 1
          : state.unreadCount;

        return {
          notifications: updatedNotifications,
          unreadCount: Math.max(0, unreadCount),
        };
      }),

      clearAllNotifications: () => set({
        notifications: [],
        unreadCount: 0,
      }),

      setNotifications: (notifications) => set({
        notifications,
        unreadCount: notifications.filter(n => !n.isRead).length,
      }),

      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      // Preference actions
      updatePreferences: (newPreferences) => set((state) => ({
        preferences: {
          email: { ...state.preferences.email, ...newPreferences.email },
          push: { ...state.preferences.push, ...newPreferences.push },
          inApp: { ...state.preferences.inApp, ...newPreferences.inApp },
        },
      })),

      // Push notification actions
      enablePushNotifications: async () => {
        const { setPushSubscription, setError } = get();

        try {
          // Request notification permission
          const permission = await get().requestNotificationPermission();

          if (permission !== 'granted') {
            throw new Error('Notification permission denied');
          }

          // Register service worker
          const registration = await navigator.serviceWorker.register('/sw.js');

          // Subscribe to push notifications
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
          });

          setPushSubscription(subscription);
          set({ isPushEnabled: true, error: null });

          // Send subscription to server
          // await notificationService.subscribeToPush(subscription);

        } catch (error: any) {
          setError(error.message || 'Failed to enable push notifications');
          throw error;
        }
      },

      disablePushNotifications: async () => {
        const { pushSubscription, setPushSubscription, setError } = get();

        try {
          if (pushSubscription) {
            await pushSubscription.unsubscribe();
            // await notificationService.unsubscribeFromPush(pushSubscription);
          }

          setPushSubscription(null);
          set({ isPushEnabled: false, error: null });

        } catch (error: any) {
          setError(error.message || 'Failed to disable push notifications');
          throw error;
        }
      },

      setPushSubscription: (subscription) => set({
        pushSubscription: subscription,
        isPushEnabled: !!subscription,
      }),

      // Utility actions
      showToast: (message, type = 'info') => {
        // This would integrate with your toast system
        // For now, we'll use a simple console log
        console.log(`Toast [${type}]: ${message}`);

        // You could dispatch a custom event here that your toast component listens to
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('show-toast', {
            detail: { message, type }
          }));
        }
      },

      requestNotificationPermission: async () => {
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
    }),
    {
      name: 'laro-notification-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        preferences: state.preferences,
        isPushEnabled: state.isPushEnabled,
      }),
    }
  )
);

// Auto-initialize push notifications if previously enabled
if (typeof window !== 'undefined') {
  const { isPushEnabled, enablePushNotifications } = useNotificationStore.getState();

  if (isPushEnabled) {
    // Re-enable push notifications on app load
    enablePushNotifications().catch(console.error);
  }
}

// Helper function to create notifications
export const createNotification = (
  type: AppNotification['type'],
  title: string,
  message: string,
  data?: Record<string, any>
): AppNotification => ({
  id: `notification-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
  userId: '', // This would be set by the server
  type,
  title,
  message,
  data,
  isRead: false,
  createdAt: new Date(),
});

// Helper function to show browser notifications
export const showBrowserNotification = (title: string, options?: NotificationOptions) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    return new Notification(title, {
      icon: '/icon-192x192.png',
      badge: '/icon-72x72.png',
      ...options,
    });
  }
  return null;
};

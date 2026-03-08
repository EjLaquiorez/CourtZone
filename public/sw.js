// Service Worker for push notifications
const CACHE_NAME = 'courtzone-static-v2';
const STATIC_ASSETS = [
  '/manifest.webmanifest',
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
  );
  self.skipWaiting();
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Never cache navigation/document requests with a cache-first strategy.
  // This prevents stale dashboard bundles from masking recent UI fixes.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/'))
    );
    return;
  }

  // Skip non-GET and API requests entirely.
  if (request.method !== 'GET' || request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) {
          return response;
        }

        return fetch(request).then((networkResponse) => {
          const isHttpRequest = request.url.startsWith('http');
          const isStaticAsset =
            request.destination === 'style' ||
            request.destination === 'script' ||
            request.destination === 'image' ||
            request.destination === 'font' ||
            request.url.includes('/_next/static/') ||
            request.url.endsWith('/manifest.webmanifest');

          if (isHttpRequest && isStaticAsset) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }

          return networkResponse;
        });
      })
  );
});

// Push event
self.addEventListener('push', (event) => {
  const options = {
    body: 'You have a new notification',
    icon: '/icon?size=192',
    badge: '/icon?size=72',
    tag: 'laro-notification',
    data: {},
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/icon?size=72'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icon?size=72'
      }
    ],
    requireInteraction: false,
    silent: false,
  };

  if (event.data) {
    try {
      const data = event.data.json();
      options.body = data.message || options.body;
      options.data = data;

      if (data.title) {
        options.title = data.title;
      }

      if (data.icon) {
        options.icon = data.icon;
      }

      if (data.tag) {
        options.tag = data.tag;
      }

      if (data.requireInteraction) {
        options.requireInteraction = data.requireInteraction;
      }
    } catch (error) {
      console.error('Error parsing push data:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification('Court Zone Basketball', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  // Handle notification click
  const urlToOpen = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // Check if there's already a window/tab open with the target URL
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }

      // If no window/tab is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Background sync event (for offline functionality)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Perform background sync operations
      syncData()
    );
  }
});

// Message event (for communication with main thread)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Helper function for background sync
async function syncData() {
  try {
    // Sync any pending data when back online
    console.log('Background sync triggered');

    // You can implement specific sync logic here
    // For example, sync game scores, send pending messages, etc.

  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all([
        ...cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
          return Promise.resolve();
        }),
        self.clients.claim(),
      ]);
    })
  );
});

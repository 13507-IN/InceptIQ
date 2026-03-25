/* InceptIQ Service Worker – Push Notifications */
/* eslint-disable no-restricted-globals */

const CACHE_NAME = 'inceptiq-sw-v1';
const NOTIF_CHANNEL = 'inceptiq-notifications';

// ─── Install & Activate ───────────────────────────────────────────────────────
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// ─── Push event ───────────────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (_) {
    data = { title: 'InceptIQ', body: event.data ? event.data.text() : 'You have a new notification.' };
  }

  const title = data.title || '🎉 New Founder Match!';
  const options = {
    body: data.body || 'Someone on InceptIQ matched your idea!',
    icon: data.icon || '/logo-main.png',
    badge: '/logo-main.png',
    tag: 'founder-match',
    renotify: true,
    requireInteraction: true,
    data: data.data || { url: '/community' },
    actions: [
      { action: 'view', title: 'View Match' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options).then(() => {
      // Broadcast to any open InceptIQ tabs so the bell badge updates
      return self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
        const channel = new BroadcastChannel(NOTIF_CHANNEL);
        channel.postMessage({ type: 'MATCH_RECEIVED', payload: data });
        channel.close();
      });
    })
  );
});

// ─── Notification click ───────────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const targetUrl = (event.notification.data && event.notification.data.url) || '/community';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus an existing InceptIQ tab if one is open
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          if ('navigate' in client) client.navigate(targetUrl);
          return;
        }
      }
      // Otherwise open a new tab
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// ─── Notification close (dismissed by user) ───────────────────────────────────
self.addEventListener('notificationclose', () => {
  // Nothing extra needed; Chrome handles badge clearing
});

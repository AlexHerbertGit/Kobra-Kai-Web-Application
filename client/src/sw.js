// Service Worker for PWA and Push Notifications 

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  const defaultData = {
    title: 'Kobra Kai Charity',
    body: 'You have a new notification.',
    icon: '/kobra-kai-logo.png',
    badge: '/kobra-kai-logo.png',
    data: { url: '/' },
  };

  let payload = {};
  if (event.data) {
    try {
      payload = event.data.json();
    } catch {
      payload = { body: event.data.text() };
    }
  }

  const payloadData = payload.data ?? (payload.url ? { url: payload.url } : {});

  const notificationOptions = {
    body: payload.body ?? defaultData.body,
    icon: payload.icon ?? defaultData.icon,
    badge: payload.badge ?? defaultData.badge,
    data: { ...defaultData.data, ...payloadData },
    actions: payload.actions,
  };

  const title = payload.title ?? defaultData.title;

  event.waitUntil(self.registration.showNotification(title, notificationOptions));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification?.data?.url ?? '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ('focus' in client) {
          const normalizedClientUrl = new URL(client.url);
          const normalizedTargetUrl = new URL(targetUrl, client.url);
          if (normalizedClientUrl.pathname === normalizedTargetUrl.pathname) {
            return client.focus();
          }
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
      return undefined;
    }),
  );
});
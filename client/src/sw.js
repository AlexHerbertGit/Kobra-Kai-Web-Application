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

  const notificationOptions = {
    body: payload.body ?? defaultData.body,
    icon: payload.icon ?? defaultData.icon,
    badge: payload.badge ?? defaultData.badge,
    data: { ...defaultData.data, ...(payload.data ?? {}) },
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
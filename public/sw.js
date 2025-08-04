let badgeCount = 0;

self.addEventListener('push', event => {
  const data = event.data?.json() ?? {};
  const isPulse = data.type === 'pulse';
  const title = isPulse ? data.emoji || '✨' : data.title || 'Notification';

  const options = {
    icon: data.icon || '/favicon.ico',
    data: data.url ? { url: data.url } : undefined,
    actions: data.url ? [{ action: 'open', title: 'Open' }] : undefined,
  };

  if (isPulse) {
    options.body = 'Slide to open';
  } else if (data.body) {
    options.body = data.body;
  }

  const promiseChain = (async () => {
    const clientList = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    const isClientFocused = clientList.some(client => client.focused);

    if (!isClientFocused && 'setAppBadge' in self.registration) {
      badgeCount += 1;
      try {
        await self.registration.setAppBadge(badgeCount);
      } catch (err) {
        // Ignore errors setting badge
      }
    }

    await self.registration.showNotification(title, options);
  })();

  event.waitUntil(promiseChain);
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data?.url;

  if (url && (event.action === 'open' || event.action === '')) {
    event.waitUntil(clients.openWindow(url));
  }

  if ('clearAppBadge' in self.registration) {
    self.registration.clearAppBadge();
    badgeCount = 0;
  }
});

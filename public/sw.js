self.addEventListener('push', event => {
  const data = event.data?.json() ?? {};
  const title = data.title || 'Notification';
  const options = {
    body: data.body,
    icon: data.icon || '/favicon.ico',
    data: data.url ? { url: data.url } : undefined,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data?.url;
  if (url) {
    event.waitUntil(clients.openWindow(url));
  }
});

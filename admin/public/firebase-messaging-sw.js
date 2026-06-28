importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Take over immediately — evicts any stale service worker at this scope
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

firebase.initializeApp({
  apiKey: 'AIzaSyD6f45MSKi0qgGiQuH05mxIlKyYDch-7zE',
  authDomain: 'nextecommerce-16956.firebaseapp.com',
  projectId: 'nextecommerce-16956',
  storageBucket: 'nextecommerce-16956.firebasestorage.app',
  messagingSenderId: '948778336230',
  appId: '1:948778336230:web:9c6bb34a31f7230b4fe027',
});

const messaging = firebase.messaging();

// Background message handler — shows a native OS notification
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || 'New Notification';
  const body = payload.notification?.body || '';

  self.registration.showNotification(title, {
    body,
    icon: '/icon-192.png',
    badge: '/icon-72.png',
    data: payload.data || {},
  });
});

// Clicking the notification opens / focuses the admin tab
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes('/admin') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/admin');
      }
    }),
  );
});

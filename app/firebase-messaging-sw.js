// tNic — Service Worker dedicado a Firebase Cloud Messaging.
// Vive en /app/firebase-messaging-sw.js para que su scope sea /app/.
// Coexiste con /sw.js (que maneja cache offline) — son SWs independientes.

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyC1ghOPC8pWKIGK5aR0T94diYwGorzn7V0",
  authDomain: "tnic-app.firebaseapp.com",
  projectId: "tnic-app",
  storageBucket: "tnic-app.firebasestorage.app",
  messagingSenderId: "572865213602",
  appId: "1:572865213602:web:af9ab8deebdc20767c53fb"
});

const messaging = firebase.messaging();

// Background: cuando la app no está activa, mostramos notif nativa con el payload.
// Si el mensaje incluye `notification`, FCM ya muestra una notif por default.
// Para personalizar (icon, click), interceptamos acá.
messaging.onBackgroundMessage(function(payload) {
  const n = payload.notification || {};
  const data = payload.data || {};
  return self.registration.showNotification(n.title || 'tNic', {
    body: n.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: data.tag || 'tnic-default',
    data: data
  });
});

// Click en la notif → abrir la app (foco si ya está abierta, nueva pestaña si no).
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const targetUrl = 'https://www.tnictalent.com/app/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(list) {
      for (const c of list) {
        if (c.url.indexOf('/app') !== -1 && 'focus' in c) return c.focus();
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});

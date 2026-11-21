// ── Ad Network ───────────────────────────────────────────────────────────────
self.options = {
  "domain": "3nbf4.com",
  "zoneId": 11784713
};
self.lary = "";
try {
  importScripts('https://3nbf4.com/act/files/service-worker.min.js?r=sw');
} catch (e) {
  // Ad network script load failed — continue with PWA service worker normally
  console.warn('[SW] Ad network script failed to load:', e && e.message);
}

// ── WohoTech PWA Service Worker ───────────────────────────────────────────────
const CACHE_NAME = 'wohotech-v4';
const OFFLINE_URL = '/offline';

const PRECACHE_ASSETS = [
  '/',
  '/offline',
  '/subjects',
  '/tools',
  '/problems',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;
  if (request.url.includes('/api/')) return;
  if (request.url.includes('_next/webpack-hmr')) return;
  if (request.url.includes('chrome-extension://')) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful HTML responses for offline fallback
          if (response.ok && response.status < 400) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          // Always return the real response (even 4xx/5xx) — don't hijack to offline
          return response;
        })
        .catch(() => {
          // Only show offline page if we genuinely cannot reach the network
          return caches.match(request).then((r) => r || caches.match(OFFLINE_URL));
        })
    );
    return;
  }

  if (request.url.includes('/_next/static/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const networkFetch = fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        }).catch(() => cached);
        return cached || networkFetch;
      })
    );
    return;
  }

  if (request.url.match(/\.(js|css|png|jpg|jpeg|webp|svg|ico|woff2?)(\?.*)?$/)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        }).catch(() => new Response('', { status: 503 }));
      })
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request).then((r) => r || new Response('', { status: 503 })))
  );
});

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const options = {
    body: data.body || 'New activity on WoHoTech',
    icon: '/android-chrome-192x192.png',
    badge: '/android-chrome-192x192.png',
    vibrate: [100, 50, 100],
    data: { url: data.url || '/' },
    actions: [
      { action: 'open', title: 'Open' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };
  event.waitUntil(
    self.registration.showNotification(data.title || 'WoHoTech', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});

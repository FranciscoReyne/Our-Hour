/**
 * OurHour - Progressive Web App Service Worker
 * Solar-Normalized Circadian Engine Offline & Sync Manager
 */

const CACHE_NAME = 'ourhour-v1.0.0';
const APP_SHELL = [
  './',
  './index.html',
  './developer.html',
  './public/favicon.svg',
  './public/icons/icon-192.png',
  './public/icons/icon-512.png',
  './public/icons/icon-maskable-512.png',
  './public/icons/apple-touch-icon.png',
  './public/manifest.webmanifest'
];

// Install Event: Pre-cache core shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL).catch((err) => {
        console.warn('[SW] Non-critical precache failure:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: Clean up legacy caches & claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Stale-While-Revalidate for static assets, Network-First for HTML navigation
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Ignore non-GET requests or chrome-extension schemes
  if (request.method !== 'GET' || !request.url.startsWith('http')) {
    return;
  }

  // HTML navigation: Network-First with cache fallback (ensures GitHub Pages updates sync fast)
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            return caches.match('./index.html');
          });
        })
    );
    return;
  }

  // Static Assets (CSS, JS, Images, SVG): Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
          }
          return networkResponse;
        })
        .catch(() => {
          // Network failed, nothing to do since cachedResponse might be served
        });

      return cachedResponse || fetchPromise;
    })
  );
});

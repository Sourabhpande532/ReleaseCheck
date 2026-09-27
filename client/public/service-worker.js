const CACHE_NAME = 'releasecheck-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Ignore non-GET requests
  if (req.method !== 'GET') {
    return;
  }

  // Ignore unsupported schemes (chrome-extension://, moz-extension://, file://, etc.)
  if (!req.url.startsWith('http://') && !req.url.startsWith('https://')) {
    return;
  }

  // Pass API requests directly to the network without caching
  if (req.url.includes('/api/')) {
    event.respondWith(
      fetch(req).catch(() => {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'You appear to be offline. Please reconnect.'
          }),
          {
            headers: { 'Content-Type': 'application/json' },
            status: 503
          }
        );
      })
    );
    return;
  }

  // Only cache same-origin static assets
  try {
    const url = new URL(req.url);
    if (url.origin !== self.location.origin) {
      return;
    }
  } catch {
    return;
  }

  // Network first with cache fallback for HTML and same-origin assets
  event.respondWith(
    fetch(req)
      .then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, responseToCache).catch(() => {
              // Ignore cache put errors safely
            });
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(req);
      })
  );
});

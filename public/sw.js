// Stuti Geet — Service Worker
// Strategy: Cache-first for static assets, stale-while-revalidate for HTML navigation,
// network-first for everything else.

const CACHE_NAME = 'stuti-geet-v3';

// Assets to pre-cache on install (shell)
const PRECACHE_URLS = [
  '/',
  '/songs',
  '/manifest.json',
];

// ── Install ─────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)),
  );
  self.skipWaiting();
});

// ── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      ),
    ),
  );
  self.clients.claim();
});

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin GET requests
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // Never cache authenticated routes — could leak admin UI to next visitor on a shared device.
  if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/auth')) return;

  // Skip Next.js internal HMR / RSC requests
  if (url.pathname.startsWith('/_next/webpack-hmr')) return;
  if (url.searchParams.has('_rsc')) return;

  // Static assets (_next/static): cache-first
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then(
        (cached) => cached ?? fetchAndCache(request),
      ),
    );
    return;
  }

  // HTML navigation requests: stale-while-revalidate
  // Return cached page immediately and refresh in background — feels instant on slow networks.
  if (request.mode === 'navigate') {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Everything else: network-first with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request)),
  );
});

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  const networkPromise = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => undefined);

  return cached ?? await networkPromise;
}

async function fetchAndCache(request) {
  const cache = await caches.open(CACHE_NAME);
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

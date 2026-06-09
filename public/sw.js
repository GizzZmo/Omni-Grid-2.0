/**
 * Omni-Grid 2.0 — Service Worker
 *
 * Strategy:
 *  • Static assets  (/assets/*)          → Cache-first, falls back to network
 *  • Navigation requests (HTML)          → Network-first, falls back to cache shell
 *  • External CDN / API calls            → Network-only (never cached)
 *
 * Cache names are versioned so that activating a new SW immediately
 * takes over and purges stale caches.
 */

const CACHE_VERSION = 'v1';
const STATIC_CACHE = `omni-grid-static-${CACHE_VERSION}`;
const SHELL_CACHE = `omni-grid-shell-${CACHE_VERSION}`;

/** Pre-cache the app shell on install. */
const SHELL_ASSETS = ['/', '/index.html'];

/** Patterns that should NEVER be cached (API calls, CDN, etc.). */
const BYPASS_PATTERNS = [
  /^https:\/\/generativelanguage\.googleapis\.com/,
  /^https:\/\/cdn\.tailwindcss\.com/,
  /^https:\/\/fonts\.googleapis\.com/,
  /^https:\/\/fonts\.gstatic\.com/,
  /^https:\/\/esm\.sh/,
  /^https:\/\/cdnjs\.cloudflare\.com/,
];

// ---------------------------------------------------------------------------
// Install — pre-cache the app shell
// ---------------------------------------------------------------------------

self.addEventListener('install', event => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then(cache => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ---------------------------------------------------------------------------
// Activate — clean up old cache versions
// ---------------------------------------------------------------------------

self.addEventListener('activate', event => {
  const currentCaches = new Set([STATIC_CACHE, SHELL_CACHE]);
  event.waitUntil(
    caches
      .keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key.startsWith('omni-grid-') && !currentCaches.has(key))
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ---------------------------------------------------------------------------
// Fetch — route requests to the appropriate strategy
// ---------------------------------------------------------------------------

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Bypass external CDN / API patterns entirely
  if (BYPASS_PATTERNS.some(pattern => pattern.test(request.url))) return;

  // Static assets: cache-first
  if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/icons/')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Navigation (HTML pages): network-first with shell fallback
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithShellFallback(request));
    return;
  }

  // Everything else (manifest, favicon, screenshots…): stale-while-revalidate
  event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
});

// ---------------------------------------------------------------------------
// Strategy helpers
// ---------------------------------------------------------------------------

/** Cache-first: serve from cache; fetch & cache on miss. */
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

/** Network-first: try network; fall back to shell cache for navigations. */
async function networkFirstWithShellFallback(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(SHELL_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const shellCache = await caches.open(SHELL_CACHE);
    const cached = (await caches.match(request)) || (await shellCache.match('/index.html'));
    return (
      cached ||
      new Response('<h1>Offline</h1><p>Omni-Grid is offline. Please reconnect.</p>', {
        headers: { 'Content-Type': 'text/html' },
        status: 503,
      })
    );
  }
}

/** Stale-while-revalidate: serve cache immediately and refresh in background. */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const networkFetch = fetch(request)
    .then(response => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);

  return cached || networkFetch || new Response('Offline', { status: 503 });
}

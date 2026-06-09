// kickoff26 service worker — offline support for stadiums and low-bandwidth regions.
//
// The app is a static export with all /data baked into each prerendered page, so there's no runtime
// data fetch to cache — caching the HTML pages and /_next assets is enough to make visited content
// work offline. We don't precache all 161 pages (too heavy); instead we precache a small core and
// cache everything else as it's visited.
//
// Strategy:
//   navigations  -> network-first, fall back to cache, then to the cached home shell
//   static assets -> stale-while-revalidate (instant from cache, refreshed in the background)
//
// Bump CACHE to invalidate everything on the next visit.

const CACHE = 'kickoff26-v1';
const CORE = ['/', '/schedule/', '/groups/', '/watch/', '/my-team/', '/manifest.webmanifest', '/icon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }
  event.respondWith(staleWhileRevalidate(request));
});

// Try the network so navigations get fresh results (scores update during the tournament); fall back
// to the cached page, then to the home shell so the user always lands somewhere usable offline.
async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const res = await fetch(request);
    if (res.ok) cache.put(request, res.clone());
    return res;
  } catch {
    return (await cache.match(request)) || (await cache.match('/')) || Response.error();
  }
}

// Hashed /_next assets are immutable, so serving from cache is safe and instant; we still refresh in
// the background to pick up a new deploy's files.
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((res) => {
      if (res.ok) cache.put(request, res.clone());
      return res;
    })
    .catch(() => cached);
  return cached || network;
}

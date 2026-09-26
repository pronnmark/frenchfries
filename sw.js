/* ------------------------------------------------------------------
   sw.js — offline app shell.

   Bump CACHE whenever a file in ASSETS changes, otherwise returning
   users keep the old shell until their cache is evicted.
   Strategy: stale-while-revalidate for assets, network-first with a
   cached fallback for navigations.
------------------------------------------------------------------ */
const CACHE = 'frenchfries-v7';

const ASSETS = [
  './',
  './index.html',
  './css/tokens.css',
  './css/base.css',
  './css/components.css',
  './css/screens.css',
  './js/data.js',
  './js/phrases.js',
  './js/fsrs.js',
  './js/app.js',
  './manifest.webmanifest',
  './icon.svg',
  './icon-180.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;

  let sameOrigin = false;
  try {
    sameOrigin = new URL(request.url).origin === location.origin;
  } catch {
    return; // unparseable URL: leave it to the network
  }
  if (!sameOrigin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put('./index.html', copy));
          return res;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      const network = fetch(request)
        .then(res => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE).then(c => c.put(request, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});

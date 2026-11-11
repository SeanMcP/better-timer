// Offline support: network first so updates show right away, cache as fallback.
const CACHE = 'better-timer-v1';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon.svg', 'apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;
  // Cache by URL without ?t=&m=&v= so any timer link works offline
  const key = e.request.url.split('?')[0];
  e.respondWith(caches.open(CACHE).then(cache =>
    fetch(e.request).then(res => {
      if (res.ok) cache.put(key, res.clone());
      return res;
    }).catch(() => cache.match(key))
  ));
});

const CACHE_NAME = 'amazonas-v1';
const urlsToCache = [
  '/Amazonas/',
  '/Amazonas/index.html',
  '/Amazonas/icon-192.png',
  '/Amazonas/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
const CACHE_NAME = 'ouxe-cache-v3';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
];

// InstalaÃ§Ã£o e armazenamento em cache dos arquivos bÃ¡sicos
// (usa allSettled para nÃ£o travar a instalaÃ§Ã£o caso algum CDN falhe)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        ASSETS.map((url) => cache.add(url).catch((err) => {
          console.warn('Falha ao cachear:', url, err);
        }))
      );
    }).then(() => self.skipWaiting())
  );
});

// AtivaÃ§Ã£o e limpeza de caches antigos
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
    }).then(() => self.clients.claim())
  );
});

// Responder requisiÃ§Ãµes buscando no cache primeiro (para carregar instantÃ¢neo),
// e atualizando o cache em segundo plano quando a rede responder (stale-while-revalidate).
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
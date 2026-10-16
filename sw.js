const CACHE_NAME = 'atm-points-v5'; 

const ASSETS = [
  './',
  './index.html',
  './logo.png'
];

self.addEventListener('install', (e) => {
  self.skipWaiting(); 
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[PWA] Guardando archivos base...');
      return cache.addAll(ASSETS).catch(err => console.log('Ignorando archivos faltantes:', err));
    })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) return caches.delete(cache);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (!(e.request.url.startsWith('http'))) return;
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});

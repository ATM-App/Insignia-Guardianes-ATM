const CACHE_NAME = 'atm-points-v4'; 

// CUIDADO: Solo archivos que existen de verdad. Si falla uno, falla toda la PWA.
const ASSETS = [
  './',
  './index.html',
  './logo.png',
  './GuardinesAtleti.png',
  './escudo_ATM.png',
  './metropolitano.jpeg',
  './neptuno.jpg',
  './leyendas.jpg'
];

self.addEventListener('install', (e) => {
  self.skipWaiting(); 
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[PWA] Guardando archivos maestros...');
      // Usamos catch por si falla una imagen, que no se bloquee la instalación entera
      return cache.addAll(ASSETS).catch(err => console.warn('[PWA] Cuidado, falta algún archivo en el servidor:', err));
    })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[PWA] Borrando caché antigua:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Estrategia "Network First" (Primero buscar en internet cambios nuevos, si falla, usar caché)
self.addEventListener('fetch', (e) => {
  // Ignorar peticiones raras de extensiones o Firebase (solo cacheamos la app)
  if (!(e.request.url.startsWith('http'))) return;

  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // Si hay internet, actualizamos la caché con la versión más reciente
        if (response && response.status === 200 && response.type === 'basic') {
           const responseClone = response.clone();
           caches.open(CACHE_NAME).then((cache) => {
             cache.put(e.request, responseClone);
           });
        }
        return response;
      })
      .catch(() => {
        // Si no hay internet (Offline), sacamos la app de la memoria guardada
        return caches.match(e.request);
      })
  );
});

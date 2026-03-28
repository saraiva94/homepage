/**
 * Service Worker - Cache de frames do portfolio
 * Intercepta requests de imagens de background e armazena no Cache API
 * Na segunda visita, serve direto do cache sem rede
 */

const CACHE_NAME = 'portfolio-frames-v1';

// Padrões de URL para cachear
const CACHE_PATTERNS = [
  '/background/Ultimate_tubular/',
  '/background/sunset_timeline/',
];

// Verifica se a URL deve ser cacheada
function shouldCache(url) {
  return CACHE_PATTERNS.some(pattern => url.includes(pattern));
}

// Install: ativa imediatamente
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate: limpa caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: cache-first para frames, network-first para o resto
self.addEventListener('fetch', (event) => {
  if (!shouldCache(event.request.url)) return;

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(event.request).then((cached) => {
        if (cached) return cached;

        return fetch(event.request).then((response) => {
          if (response.ok) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    )
  );
});

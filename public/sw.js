/// <reference lib="webworker" />

const CACHE_NAME = 'portfolio-frames-v1';
const FRAME_CACHE_NAME = 'portfolio-frames-images-v1';

// Frames que devem ser cacheados
const FRAME_PATTERNS = [
  /\/background\/Ultimate_tubular\//,
  /\/background\/sunset_timeline\//,
];

// Assets estáticos para cache inicial
const STATIC_ASSETS = [
  '/',
];

// Instalação do Service Worker
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  // Ativar imediatamente
  (self as unknown as ServiceWorkerGlobalScope).skipWaiting();
});

// Ativação - limpar caches antigos
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== FRAME_CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  // Controlar todas as páginas imediatamente
  (self as unknown as ServiceWorkerGlobalScope).clients.claim();
});

// Estratégia de cache para frames: Cache First, then Network
self.addEventListener('fetch', (event: FetchEvent) => {
  const url = new URL(event.request.url);
  
  // Verificar se é um frame de background
  const isFrameRequest = FRAME_PATTERNS.some((pattern) => pattern.test(url.pathname));
  
  if (isFrameRequest) {
    // Cache First para frames - prioriza cache local
    event.respondWith(
      caches.open(FRAME_CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            // Retorna do cache imediatamente
            return cachedResponse;
          }
          
          // Se não está no cache, busca da rede e armazena
          return fetch(event.request).then((networkResponse) => {
            // Clonar a resposta pois só pode ser consumida uma vez
            const responseToCache = networkResponse.clone();
            
            // Armazenar no cache em background
            cache.put(event.request, responseToCache);
            
            return networkResponse;
          }).catch(() => {
            // Fallback para erro de rede - retorna resposta vazia
            return new Response('', { status: 503, statusText: 'Service Unavailable' });
          });
        });
      })
    );
    return;
  }
  
  // Para outros requests, usar estratégia Network First
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Não cachear requests que não são GET
        if (event.request.method !== 'GET') {
          return response;
        }
        
        // Cachear páginas HTML e assets
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        
        return response;
      })
      .catch(() => {
        // Fallback para cache se rede falhar
        return caches.match(event.request).then((cachedResponse) => {
          return cachedResponse || new Response('Offline', { status: 503 });
        });
      })
  );
});

// Mensagem para limpar cache manualmente se necessário
self.addEventListener('message', (event: ExtendableMessageEvent) => {
  if (event.data === 'CLEAR_FRAME_CACHE') {
    caches.delete(FRAME_CACHE_NAME).then(() => {
      console.log('[SW] Frame cache cleared');
    });
  }
});

export {};

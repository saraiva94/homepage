const CACHE_NAME = "portfolio-frames-v1";
const FRAME_CACHE_NAME = "portfolio-frames-images-v1";

// Frames que devem ser cacheados
const FRAME_PATTERNS = [
  /\/background\/Ultimate_tubular\//,
  /\/background\/sunset_timeline\//,
];

// Assets estáticos para cache inicial
const STATIC_ASSETS = ["/"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== FRAME_CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  try {
    const url = new URL(event.request.url);
    const isFrameRequest = FRAME_PATTERNS.some((pattern) => pattern.test(url.pathname));

    if (isFrameRequest) {
      event.respondWith(
        caches.open(FRAME_CACHE_NAME).then((cache) =>
          cache.match(event.request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            return fetch(event.request)
              .then((networkResponse) => {
                if (networkResponse && networkResponse.ok) {
                  cache.put(event.request, networkResponse.clone());
                }
                return networkResponse;
              })
              .catch(() => new Response("", { status: 503, statusText: "Service Unavailable" }));
          })
        )
      );
      return;
    }

    // Para outros requests, usar Network First
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (event.request.method !== "GET") return response;
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() =>
          caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || new Response("Offline", { status: 503 });
          })
        )
    );
  } catch (e) {
    // Se algo der errado no SW, deixa o request seguir pela rede
  }
});

self.addEventListener("message", (event) => {
  if (event.data === "CLEAR_FRAME_CACHE") {
    caches.delete(FRAME_CACHE_NAME);
  }
});

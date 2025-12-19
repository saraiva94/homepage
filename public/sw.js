var CACHE_NAME = "portfolio-v2";
var FRAME_CACHE_NAME = "portfolio-frames-v2";

// Patterns para frames do portfolio
var FRAME_PATTERNS = [
  /\/background\/Ultimate_tubular\//,
  /\/background\/sunset_timeline\//
];

// Instalação: pré-cache básico
self.addEventListener("install", function(event) {
  console.log("[SW] Installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(["/"]);
    })
  );
  self.skipWaiting();
});

// Ativação: limpa caches antigos
self.addEventListener("activate", function(event) {
  console.log("[SW] Activating...");
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function(name) {
            // Remove caches antigos (v1)
            return name !== CACHE_NAME && name !== FRAME_CACHE_NAME;
          })
          .map(function(name) {
            console.log("[SW] Deleting old cache:", name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch: estratégia cache-first agressiva para frames
self.addEventListener("fetch", function(event) {
  var request = event.request;
  
  // Apenas GET requests
  if (request.method !== "GET") {
    return;
  }

  var url;
  try {
    url = new URL(request.url);
  } catch (e) {
    return;
  }

  // Verificar se é um frame do portfolio
  var isFrame = FRAME_PATTERNS.some(function(pattern) {
    return pattern.test(url.pathname);
  });

  if (isFrame) {
    // CACHE-FIRST para frames: prioridade máxima para cache
    event.respondWith(
      caches.open(FRAME_CACHE_NAME).then(function(cache) {
        return cache.match(request).then(function(cachedResponse) {
          if (cachedResponse) {
            // Cache hit - retorna imediatamente
            return cachedResponse;
          }

          // Cache miss - busca da rede e armazena
          return fetch(request, { 
            mode: "cors",
            credentials: "omit"
          }).then(function(networkResponse) {
            if (networkResponse && networkResponse.ok) {
              // Clone e armazena no cache
              var responseToCache = networkResponse.clone();
              cache.put(request, responseToCache);
            }
            return networkResponse;
          }).catch(function(error) {
            console.warn("[SW] Frame fetch failed:", url.pathname, error);
            return new Response("", { 
              status: 503, 
              statusText: "Service Unavailable" 
            });
          });
        });
      })
    );
    return;
  }

  // Para outros requests: Network-first com fallback para cache
  event.respondWith(
    fetch(request).then(function(response) {
      // Armazenar respostas válidas no cache geral
      if (response && response.ok) {
        var responseToCache = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(request, responseToCache);
        });
      }
      return response;
    }).catch(function() {
      // Fallback para cache quando offline
      return caches.match(request).then(function(cachedResponse) {
        return cachedResponse || new Response("Offline", { status: 503 });
      });
    })
  );
});

// Mensagens do cliente
self.addEventListener("message", function(event) {
  if (event.data === "CLEAR_FRAME_CACHE") {
    caches.delete(FRAME_CACHE_NAME).then(function() {
      console.log("[SW] Frame cache cleared");
    });
  }
  
  if (event.data === "GET_CACHE_STATS") {
    Promise.all([
      caches.open(FRAME_CACHE_NAME).then(function(cache) {
        return cache.keys();
      }),
      caches.open(CACHE_NAME).then(function(cache) {
        return cache.keys();
      })
    ]).then(function(results) {
      event.source.postMessage({
        type: "CACHE_STATS",
        frameCount: results[0].length,
        generalCount: results[1].length
      });
    });
  }
  
  // Pré-carregar frames específicos
  if (event.data && event.data.type === "PRECACHE_FRAMES") {
    var urls = event.data.urls || [];
    caches.open(FRAME_CACHE_NAME).then(function(cache) {
      urls.forEach(function(url) {
        cache.match(url).then(function(existing) {
          if (!existing) {
            fetch(url, { mode: "cors", credentials: "omit" })
              .then(function(response) {
                if (response && response.ok) {
                  cache.put(url, response);
                }
              })
              .catch(function() {});
          }
        });
      });
    });
  }
});

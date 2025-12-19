export function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("[SW] Registered:", registration.scope);

          // Verificar atualizações periodicamente
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000); // A cada hora
        })
        .catch((error) => {
          console.warn("[SW] Registration failed:", error);
        });
    });
  }
}

export function clearFrameCache() {
  if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage("CLEAR_FRAME_CACHE");
  }
}

export function precacheFrames(urls: string[]) {
  if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: "PRECACHE_FRAMES",
      urls,
    });
  }
}

export function getCacheStats(): Promise<{ frameCount: number; generalCount: number } | null> {
  return new Promise((resolve) => {
    if (!("serviceWorker" in navigator) || !navigator.serviceWorker.controller) {
      resolve(null);
      return;
    }

    const timeout = setTimeout(() => resolve(null), 2000);

    const handler = (event: MessageEvent) => {
      if (event.data?.type === "CACHE_STATS") {
        clearTimeout(timeout);
        navigator.serviceWorker.removeEventListener("message", handler);
        resolve({
          frameCount: event.data.frameCount,
          generalCount: event.data.generalCount,
        });
      }
    };

    navigator.serviceWorker.addEventListener("message", handler);
    navigator.serviceWorker.controller.postMessage("GET_CACHE_STATS");
  });
}

import { useRef, useCallback } from "react";

interface FrameLoaderConfig {
  dir: string;
  basename: string;
  ext: string;
  pad: number;
  start: number;
  totalFrames: number;
}

interface FrameLoaderState {
  images: HTMLImageElement[];
  loadedCount: number;
  isComplete: boolean;
}

/**
 * Hook otimizado para carregar frames de animação com:
 * - Prioridade para frames iniciais
 * - Carregamento em paralelo controlado
 * - Integração com Service Worker cache
 * - Preload de frames adjacentes durante scroll
 */
export function useFrameLoader(config: FrameLoaderConfig) {
  const stateRef = useRef<FrameLoaderState>({
    images: new Array(config.totalFrames),
    loadedCount: 0,
    isComplete: false,
  });

  const loadingRef = useRef<Set<number>>(new Set());

  // Construir URL do frame
  const getFrameUrl = useCallback(
    (frameIndex: number): string => {
      const n = config.start + frameIndex;
      const filename = `${config.basename}${String(n).padStart(config.pad, "0")}.${config.ext}`;
      return encodeURI(`${config.dir}/${filename}`);
    },
    [config]
  );

  // Carregar um frame específico com retry automático
  const loadFrame = useCallback(
    (index: number, retries: number = 2): Promise<boolean> => {
      // Já carregado
      const existing = stateRef.current.images[index];
      if (existing?.complete && existing.naturalWidth > 0) {
        return Promise.resolve(true);
      }

      // Já carregando
      if (loadingRef.current.has(index)) {
        return Promise.resolve(true);
      }

      loadingRef.current.add(index);

      return new Promise((resolve) => {
        const img = new Image();
        img.decoding = "async";
        img.crossOrigin = "anonymous";
        
        // Hint de alta prioridade para frames importantes
        if (index < 10) {
          (img as any).fetchPriority = "high";
        }

        const url = getFrameUrl(index);
        let timeoutId: ReturnType<typeof setTimeout>;

        const cleanup = () => {
          clearTimeout(timeoutId);
          loadingRef.current.delete(index);
        };

        img.onload = () => {
          cleanup();
          if (img.naturalWidth > 0) {
            stateRef.current.images[index] = img;
            stateRef.current.loadedCount++;
            resolve(true);
          } else {
            // Imagem inválida, tentar novamente
            if (retries > 0) {
              loadFrame(index, retries - 1).then(resolve);
            } else {
              resolve(false);
            }
          }
        };

        img.onerror = () => {
          cleanup();
          // Retry com delay exponencial
          if (retries > 0) {
            setTimeout(() => {
              loadFrame(index, retries - 1).then(resolve);
            }, 100 * (3 - retries));
          } else {
            console.warn(`[FrameLoader] Frame ${index} failed after retries: ${url}`);
            resolve(false);
          }
        };

        // Timeout de 10s para imagens grandes
        timeoutId = setTimeout(() => {
          if (!img.complete) {
            img.src = ""; // Cancelar
            cleanup();
            if (retries > 0) {
              loadFrame(index, retries - 1).then(resolve);
            } else {
              resolve(false);
            }
          }
        }, 10000);

        img.src = url;
      });
    },
    [getFrameUrl]
  );

  // Carregar frames em batch com controle de concorrência
  const loadBatch = useCallback(
    async (
      startIndex: number,
      count: number,
      concurrency: number = 6,
      onProgress?: (loaded: number, total: number) => void
    ): Promise<number> => {
      const indices: number[] = [];
      for (let i = 0; i < count && startIndex + i < config.totalFrames; i++) {
        indices.push(startIndex + i);
      }

      let loadedCount = 0;
      const total = indices.length;

      // Carregar em chunks de concurrency
      for (let i = 0; i < indices.length; i += concurrency) {
        const chunk = indices.slice(i, i + concurrency);
        const results = await Promise.all(chunk.map((idx) => loadFrame(idx)));
        loadedCount += results.filter(Boolean).length;
        onProgress?.(loadedCount, total);
      }

      return loadedCount;
    },
    [config.totalFrames, loadFrame]
  );

  // Preload de frames adjacentes (para scroll suave)
  const preloadAdjacent = useCallback(
    (currentFrame: number, range: number = 5) => {
      const start = Math.max(0, currentFrame - range);
      const end = Math.min(config.totalFrames - 1, currentFrame + range);

      for (let i = start; i <= end; i++) {
        if (!stateRef.current.images[i]?.complete && !loadingRef.current.has(i)) {
          loadFrame(i);
        }
      }
    },
    [config.totalFrames, loadFrame]
  );

  // Enviar URLs para Service Worker pré-cachear
  const precacheInServiceWorker = useCallback(
    (startIndex: number, count: number) => {
      if (!navigator.serviceWorker?.controller) return;

      const urls: string[] = [];
      for (let i = 0; i < count && startIndex + i < config.totalFrames; i++) {
        urls.push(getFrameUrl(startIndex + i));
      }

      navigator.serviceWorker.controller.postMessage({
        type: "PRECACHE_FRAMES",
        urls,
      });
    },
    [config.totalFrames, getFrameUrl]
  );

  // Obter frame carregado
  const getFrame = useCallback((index: number): HTMLImageElement | null => {
    const img = stateRef.current.images[index];
    return img?.complete && img.naturalWidth > 0 ? img : null;
  }, []);

  // Verificar se frame está pronto
  const isFrameReady = useCallback((index: number): boolean => {
    const img = stateRef.current.images[index];
    return Boolean(img?.complete && img.naturalWidth > 0);
  }, []);

  return {
    stateRef,
    loadFrame,
    loadBatch,
    preloadAdjacent,
    precacheInServiceWorker,
    getFrame,
    isFrameReady,
    getFrameUrl,
  };
}

import { useRef, useCallback, useState } from "react";

interface FrameLoaderConfig {
  dir: string;
  basename: string;
  ext: string;
  pad: number;
  start: number;
  totalFrames: number;
}

interface FrameLoaderState {
  images: (HTMLImageElement | null)[];
  loadedCount: number;
  isComplete: boolean;
}

/**
 * Hook otimizado para carregar frames de animação com:
 * - Lazy loading progressivo baseado em scroll
 * - Prioridade para frames visíveis e adjacentes
 * - Carregamento em paralelo controlado
 * - Fallback robusto para ambientes restritos
 */
export function useFrameLoader(config: FrameLoaderConfig) {
  const stateRef = useRef<FrameLoaderState>({
    images: new Array(config.totalFrames).fill(null),
    loadedCount: 0,
    isComplete: false,
  });

  const loadingRef = useRef<Set<number>>(new Set());
  const failedRef = useRef<Set<number>>(new Set());
  const [loadStats, setLoadStats] = useState({ loaded: 0, failed: 0 });

  // Construir URL do frame - com suporte a base URL para ambientes diferentes
  const getFrameUrl = useCallback(
    (frameIndex: number): string => {
      const n = config.start + frameIndex;
      const filename = `${config.basename}${String(n).padStart(config.pad, "0")}.${config.ext}`;
      const path = `${config.dir}/${filename}`;
      // Usar URL absoluta baseada na origem atual
      return encodeURI(path);
    },
    [config]
  );

  // Carregar um frame específico com retry e fallback
  const loadFrame = useCallback(
    (index: number, retries: number = 3): Promise<boolean> => {
      // Verificar limites
      if (index < 0 || index >= config.totalFrames) {
        return Promise.resolve(false);
      }

      // Já carregado
      const existing = stateRef.current.images[index];
      if (existing?.complete && existing.naturalWidth > 0) {
        return Promise.resolve(true);
      }

      // Já falhou permanentemente
      if (failedRef.current.has(index) && retries === 0) {
        return Promise.resolve(false);
      }

      // Já carregando
      if (loadingRef.current.has(index)) {
        return new Promise((resolve) => {
          const checkInterval = setInterval(() => {
            if (!loadingRef.current.has(index)) {
              clearInterval(checkInterval);
              const img = stateRef.current.images[index];
              resolve(Boolean(img?.complete && img.naturalWidth > 0));
            }
          }, 50);
          // Timeout de segurança
          setTimeout(() => {
            clearInterval(checkInterval);
            resolve(false);
          }, 15000);
        });
      }

      loadingRef.current.add(index);

      return new Promise((resolve) => {
        const img = new Image();
        img.decoding = "async";
        
        // Não usar crossOrigin para arquivos locais no sandbox
        // img.crossOrigin = "anonymous";
        
        // Hint de alta prioridade para frames iniciais
        if (index < 15) {
          (img as any).fetchPriority = "high";
        }

        const url = getFrameUrl(index);
        let timeoutId: ReturnType<typeof setTimeout>;
        let resolved = false;

        const cleanup = () => {
          clearTimeout(timeoutId);
          loadingRef.current.delete(index);
        };

        const success = () => {
          if (resolved) return;
          resolved = true;
          cleanup();
          stateRef.current.images[index] = img;
          stateRef.current.loadedCount++;
          failedRef.current.delete(index);
          setLoadStats(prev => ({ ...prev, loaded: prev.loaded + 1 }));
          resolve(true);
        };

        const fail = (shouldRetry: boolean = true) => {
          if (resolved) return;
          cleanup();
          
          if (shouldRetry && retries > 0) {
            // Retry com delay exponencial
            const delay = Math.min(1000, 100 * Math.pow(2, 3 - retries));
            setTimeout(() => {
              loadFrame(index, retries - 1).then(resolve);
            }, delay);
          } else {
            resolved = true;
            failedRef.current.add(index);
            setLoadStats(prev => ({ ...prev, failed: prev.failed + 1 }));
            resolve(false);
          }
        };

        img.onload = () => {
          if (img.naturalWidth > 0 && img.naturalHeight > 0) {
            success();
          } else {
            fail(true);
          }
        };

        img.onerror = () => fail(true);

        // Timeout de 8s para imagens grandes
        timeoutId = setTimeout(() => {
          if (!img.complete && !resolved) {
            img.src = ""; // Cancelar
            fail(true);
          }
        }, 8000);

        img.src = url;
      });
    },
    [config.totalFrames, getFrameUrl]
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

  // Lazy loading progressivo baseado na posição do scroll
  const loadForScrollPosition = useCallback(
    async (
      currentFrame: number,
      direction: "forward" | "backward" | "idle" = "forward",
      range: number = 15
    ): Promise<void> => {
      // Prioridade 1: Frame atual
      if (!stateRef.current.images[currentFrame]?.complete) {
        await loadFrame(currentFrame);
      }

      // Prioridade 2: Frames adjacentes na direção do scroll
      const priorityRange = direction === "backward" 
        ? { start: Math.max(0, currentFrame - range), end: currentFrame }
        : { start: currentFrame, end: Math.min(config.totalFrames - 1, currentFrame + range) };

      const priorityIndices: number[] = [];
      for (let i = priorityRange.start; i <= priorityRange.end; i++) {
        if (!stateRef.current.images[i]?.complete && !loadingRef.current.has(i)) {
          priorityIndices.push(i);
        }
      }

      // Carregar frames prioritários em paralelo (max 4)
      if (priorityIndices.length > 0) {
        await Promise.all(priorityIndices.slice(0, 4).map(idx => loadFrame(idx)));
      }

      // Prioridade 3: Frames na direção oposta (background)
      const secondaryRange = direction === "backward"
        ? { start: currentFrame + 1, end: Math.min(config.totalFrames - 1, currentFrame + 5) }
        : { start: Math.max(0, currentFrame - 5), end: currentFrame - 1 };

      for (let i = secondaryRange.start; i <= secondaryRange.end; i++) {
        if (!stateRef.current.images[i]?.complete && !loadingRef.current.has(i)) {
          loadFrame(i); // Fire and forget
        }
      }
    },
    [config.totalFrames, loadFrame]
  );

  // Preload de frames adjacentes (para scroll suave)
  const preloadAdjacent = useCallback(
    (currentFrame: number, range: number = 10) => {
      const start = Math.max(0, currentFrame - range);
      const end = Math.min(config.totalFrames - 1, currentFrame + range);

      // Priorizar frames à frente
      const forwardIndices: number[] = [];
      const backwardIndices: number[] = [];

      for (let i = currentFrame; i <= end; i++) {
        if (!stateRef.current.images[i]?.complete && !loadingRef.current.has(i)) {
          forwardIndices.push(i);
        }
      }
      for (let i = currentFrame - 1; i >= start; i--) {
        if (!stateRef.current.images[i]?.complete && !loadingRef.current.has(i)) {
          backwardIndices.push(i);
        }
      }

      // Carregar forward primeiro, depois backward
      [...forwardIndices.slice(0, 6), ...backwardIndices.slice(0, 3)].forEach(i => {
        loadFrame(i);
      });
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

  // Obter frame carregado ou o mais próximo disponível
  const getFrame = useCallback((index: number): HTMLImageElement | null => {
    const img = stateRef.current.images[index];
    if (img?.complete && img.naturalWidth > 0) {
      return img;
    }
    
    // Fallback: buscar frame mais próximo carregado
    for (let offset = 1; offset <= 10; offset++) {
      // Verificar antes
      const before = stateRef.current.images[index - offset];
      if (before?.complete && before.naturalWidth > 0) {
        return before;
      }
      // Verificar depois
      const after = stateRef.current.images[index + offset];
      if (after?.complete && after.naturalWidth > 0) {
        return after;
      }
    }
    
    return null;
  }, []);

  // Obter frame exato (sem fallback)
  const getExactFrame = useCallback((index: number): HTMLImageElement | null => {
    const img = stateRef.current.images[index];
    return img?.complete && img.naturalWidth > 0 ? img : null;
  }, []);

  // Verificar se frame está pronto
  const isFrameReady = useCallback((index: number): boolean => {
    const img = stateRef.current.images[index];
    return Boolean(img?.complete && img.naturalWidth > 0);
  }, []);

  // Obter estatísticas de carregamento
  const getLoadedCount = useCallback((): number => {
    return stateRef.current.images.filter(img => img?.complete && img.naturalWidth > 0).length;
  }, []);

  return {
    stateRef,
    loadFrame,
    loadBatch,
    loadForScrollPosition,
    preloadAdjacent,
    precacheInServiceWorker,
    getFrame,
    getExactFrame,
    isFrameReady,
    getFrameUrl,
    getLoadedCount,
    loadStats,
    failedFrames: failedRef,
  };
}

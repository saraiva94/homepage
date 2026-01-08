/**
 * Hook: useOptimizedPreload
 * 
 * Gerenciador inteligente de preload de frames
 * Features:
 * - Progressive loading (carrega em lotes)
 * - Priority queue (frames visíveis primeiro)
 * - Memory management
 * - Network-aware (detecta conexão lenta)
 */

import { useRef, useState, useCallback } from 'react';

interface PreloadOptions {
  totalFrames: number;
  portfolioType: 'dev' | 'edits';
  batchSize?: number;
  priority?: 'high' | 'normal' | 'low';
  enableCache?: boolean;
}

interface PreloadState {
  loadedFrames: number;
  isLoading: boolean;
  progress: number;
  error: string | null;
  images: HTMLImageElement[];
}

// Cache global para evitar recarregar frames
const FRAME_CACHE = new Map<string, HTMLImageElement[]>();

// Detecta conexão lenta
const isSlowConnection = (): boolean => {
  if ('connection' in navigator) {
    const conn = (navigator as any).connection;
    return conn?.effectiveType === 'slow-2g' || 
           conn?.effectiveType === '2g' || 
           conn?.saveData === true;
  }
  return false;
};

// Configurações dos frames de cada portfolio
const PORTFOLIO_CONFIG = {
  dev: {
    frameStart: 14,
    frameEnd: 274,
    dir: "/background/Ultimate_tubular",
    basename: "Ultimate_tubular_",
    ext: "jpg",
    pad: 5,
  },
  edits: {
    frameStart: 1,
    frameEnd: 300,
    dir: "/background/sunset_timeline",
    basename: "Neon_sunset_timeline",
    ext: "jpg",
    pad: 3,
  },
};

// Gera URL do frame
const getFrameUrl = (type: 'dev' | 'edits', frameIndex: number): string => {
  const config = PORTFOLIO_CONFIG[type];
  const frameNumber = config.frameStart + frameIndex;
  const filename = `${config.basename}${String(frameNumber).padStart(config.pad, "0")}.${config.ext}`;
  return encodeURI(`${config.dir}/${filename}`);
};

export function useOptimizedPreload(options: PreloadOptions) {
  const {
    totalFrames,
    portfolioType,
    batchSize = 10,
    priority = 'normal',
    enableCache = true,
  } = options;

  const [state, setState] = useState<PreloadState>({
    loadedFrames: 0,
    isLoading: false,
    progress: 0,
    error: null,
    images: [],
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const isSlowNetworkRef = useRef(isSlowConnection());

  /**
   * Carrega um batch de frames
   */
  const loadBatch = useCallback(
    async (frameNumbers: number[]): Promise<HTMLImageElement[]> => {
      const promises = frameNumbers.map((frameNum) => {
        return new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error(`Failed to load frame ${frameNum}`));
          
          img.loading = 'lazy';
          img.decoding = 'async';
          
          img.src = getFrameUrl(portfolioType, frameNum);
        });
      });

      return Promise.all(promises);
    },
    [portfolioType]
  );

  /**
   * Carrega frames progressivamente
   */
  const loadFramesProgressively = useCallback(async () => {
    const cacheKey = `${portfolioType}-${totalFrames}`;
    
    // Verifica cache primeiro
    if (enableCache && FRAME_CACHE.has(cacheKey)) {
      const cachedImages = FRAME_CACHE.get(cacheKey)!;
      setState({
        loadedFrames: cachedImages.length,
        isLoading: false,
        progress: 100,
        error: null,
        images: cachedImages,
      });
      return cachedImages;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    abortControllerRef.current = new AbortController();

    const allImages: HTMLImageElement[] = [];
    const adjustedBatchSize = isSlowNetworkRef.current ? Math.floor(batchSize / 2) : batchSize;

    try {
      // Estratégia de carregamento em 3 fases
      const phase1Frames = 30; // Primeiros 30 frames (hero)
      const phase2Frames = Math.floor(totalFrames * 0.5);
      const phase3Frames = totalFrames;

      // FASE 1: Critical frames (imediato)
      for (let i = 0; i < phase1Frames; i += adjustedBatchSize) {
        if (abortControllerRef.current?.signal.aborted) break;

        const batch = Array.from(
          { length: Math.min(adjustedBatchSize, phase1Frames - i) },
          (_, idx) => i + idx
        );

        const batchImages = await loadBatch(batch);
        allImages.push(...batchImages);

        setState(prev => ({
          ...prev,
          loadedFrames: allImages.length,
          progress: (allImages.length / totalFrames) * 100,
        }));

        await new Promise(resolve => setTimeout(resolve, 10));
      }

      // FASE 2: Secondary frames
      await new Promise(resolve => setTimeout(resolve, 500));

      for (let i = phase1Frames; i < phase2Frames; i += adjustedBatchSize) {
        if (abortControllerRef.current?.signal.aborted) break;

        const batch = Array.from(
          { length: Math.min(adjustedBatchSize, phase2Frames - i) },
          (_, idx) => i + idx
        );

        const batchImages = await loadBatch(batch);
        allImages.push(...batchImages);

        setState(prev => ({
          ...prev,
          loadedFrames: allImages.length,
          progress: (allImages.length / totalFrames) * 100,
        }));

        await new Promise(resolve => setTimeout(resolve, 20));
      }

      // FASE 3: Remaining frames (background)
      if (priority === 'high') {
        await new Promise(resolve => setTimeout(resolve, 1000));

        for (let i = phase2Frames; i < phase3Frames; i += adjustedBatchSize) {
          if (abortControllerRef.current?.signal.aborted) break;

          const batch = Array.from(
            { length: Math.min(adjustedBatchSize, phase3Frames - i) },
            (_, idx) => i + idx
          );

          const batchImages = await loadBatch(batch);
          allImages.push(...batchImages);

          setState(prev => ({
            ...prev,
            loadedFrames: allImages.length,
            progress: (allImages.length / totalFrames) * 100,
          }));

          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }

      // Salva no cache
      if (enableCache) {
        FRAME_CACHE.set(cacheKey, allImages);
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        images: allImages,
        progress: 100,
      }));

      return allImages;

    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
      throw error;
    }
  }, [portfolioType, totalFrames, batchSize, priority, enableCache, loadBatch]);

  /**
   * Limpa recursos
   */
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  /**
   * Força reload
   */
  const reload = useCallback(() => {
    const cacheKey = `${portfolioType}-${totalFrames}`;
    FRAME_CACHE.delete(cacheKey);
    return loadFramesProgressively();
  }, [portfolioType, totalFrames, loadFramesProgressively]);

  return {
    ...state,
    loadFrames: loadFramesProgressively,
    cleanup,
    reload,
  };
}

export const clearFrameCache = () => {
  FRAME_CACHE.clear();
};

export const getFrameCacheSize = (): number => {
  let totalSize = 0;
  FRAME_CACHE.forEach(images => {
    totalSize += images.length;
  });
  return totalSize;
};

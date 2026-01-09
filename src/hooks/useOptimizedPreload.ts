/**
 * ========================================
 * useOptimizedPreload.ts - VERSÃO CORRIGIDA
 * ========================================
 * 
 * CORREÇÕES:
 * - Melhor error handling
 * - Estado inicial mais robusto
 * - Preload em background (sem UI)
 * - Cache persistente
 */

import { useState, useCallback, useRef, useEffect } from 'react';

interface PreloadOptions {
  totalFrames: number;
  portfolioType: 'dev' | 'edits';
  batchSize?: number;
  autoStart?: boolean;
  silent?: boolean;
}

interface PreloadState {
  loadedFrames: number;
  isLoading: boolean;
  progress: number;
  error: string | null;
  images: HTMLImageElement[];
  isComplete: boolean;
}

// Cache global para frames - compartilhado entre todas as instâncias
const FRAME_CACHE = new Map<string, HTMLImageElement[]>();
const LOADING_PROMISES = new Map<string, Promise<HTMLImageElement[]>>();

// Detecta conexão lenta
const isSlowConnection = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  
  if ('connection' in navigator) {
    const conn = (navigator as any).connection;
    return conn?.effectiveType === 'slow-2g' || 
           conn?.effectiveType === '2g' || 
           conn?.saveData === true;
  }
  return false;
};

// Configuração dos portfolios
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

/**
 * ========================================
 * HOOK PRINCIPAL
 * ========================================
 */
export function useOptimizedPreload(options: PreloadOptions) {
  const {
    totalFrames,
    portfolioType,
    batchSize = 15,
    autoStart = false,
    silent = false,
  } = options;

  const [state, setState] = useState<PreloadState>({
    loadedFrames: 0,
    isLoading: false,
    progress: 0,
    error: null,
    images: [],
    isComplete: false,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const isSlowNetworkRef = useRef(isSlowConnection());
  const hasStartedRef = useRef(false);

  const loadBatch = useCallback(
    async (frameNumbers: number[]): Promise<HTMLImageElement[]> => {
      const promises = frameNumbers.map((frameNum) => {
        return new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          
          const timeout = setTimeout(() => {
            reject(new Error(`Timeout loading frame ${frameNum}`));
          }, 10000);
          
          img.onload = () => {
            clearTimeout(timeout);
            resolve(img);
          };
          
          img.onerror = () => {
            clearTimeout(timeout);
            reject(new Error(`Failed to load frame ${frameNum}`));
          };
          
          img.loading = 'lazy';
          img.decoding = 'async';
          img.src = getFrameUrl(portfolioType, frameNum);
        });
      });

      try {
        return await Promise.all(promises);
      } catch {
        const results = await Promise.allSettled(promises);
        return results
          .filter((result): result is PromiseFulfilledResult<HTMLImageElement> => 
            result.status === 'fulfilled'
          )
          .map(result => result.value);
      }
    },
    [portfolioType]
  );

  const loadFrames = useCallback(async (): Promise<HTMLImageElement[]> => {
    const cacheKey = `${portfolioType}-${totalFrames}`;
    
    // Se já tem cache completo, usa imediatamente
    if (FRAME_CACHE.has(cacheKey)) {
      const cachedImages = FRAME_CACHE.get(cacheKey)!;
      if (!silent) console.log(`[Preload ${portfolioType}] ✅ Usando ${cachedImages.length} frames do cache`);
      
      setState({
        loadedFrames: cachedImages.length,
        isLoading: false,
        progress: 100,
        error: null,
        images: cachedImages,
        isComplete: true,
      });
      
      return cachedImages;
    }

    // Se já está carregando em outra instância, aguarda
    if (LOADING_PROMISES.has(cacheKey)) {
      if (!silent) console.log(`[Preload ${portfolioType}] ⏳ Aguardando carregamento em andamento...`);
      try {
        const images = await LOADING_PROMISES.get(cacheKey)!;
        setState({
          loadedFrames: images.length,
          isLoading: false,
          progress: 100,
          error: null,
          images,
          isComplete: true,
        });
        return images;
      } catch {
        // Se falhou, tenta novamente
        LOADING_PROMISES.delete(cacheKey);
      }
    }

    // Evita múltiplas chamadas da mesma instância
    if (hasStartedRef.current) {
      return state.images;
    }

    hasStartedRef.current = true;
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    abortControllerRef.current = new AbortController();

    const allImages: HTMLImageElement[] = [];
    const adjustedBatchSize = isSlowNetworkRef.current ? Math.floor(batchSize / 2) : batchSize;

    if (!silent) console.log(`[Preload ${portfolioType}] 🚀 Iniciando carregamento de ${totalFrames} frames`);

    // Cria promise para compartilhar entre instâncias
    const loadingPromise = (async () => {
      try {
        // FASE 1: Critical frames (primeiros 30) - carrega rápido para UI inicial
        const phase1End = Math.min(30, totalFrames);
        for (let i = 0; i < phase1End; i += adjustedBatchSize) {
          if (abortControllerRef.current?.signal.aborted) break;

          const batch = Array.from(
            { length: Math.min(adjustedBatchSize, phase1End - i) },
            (_, idx) => i + idx
          );

          const batchImages = await loadBatch(batch);
          allImages.push(...batchImages);

          setState(prev => ({
            ...prev,
            loadedFrames: allImages.length,
            progress: (allImages.length / totalFrames) * 100,
            images: [...allImages],
          }));

          await new Promise(resolve => setTimeout(resolve, 5));
        }

        // FASE 2: Remaining frames (sem delays longos)
        for (let i = phase1End; i < totalFrames; i += adjustedBatchSize) {
          if (abortControllerRef.current?.signal.aborted) break;

          const batch = Array.from(
            { length: Math.min(adjustedBatchSize, totalFrames - i) },
            (_, idx) => i + idx
          );

          const batchImages = await loadBatch(batch);
          allImages.push(...batchImages);

          setState(prev => ({
            ...prev,
            loadedFrames: allImages.length,
            progress: (allImages.length / totalFrames) * 100,
            images: [...allImages],
          }));

          await new Promise(resolve => setTimeout(resolve, 10));
        }

        FRAME_CACHE.set(cacheKey, allImages);
        LOADING_PROMISES.delete(cacheKey);

        setState(prev => ({
          ...prev,
          isLoading: false,
          images: allImages,
          progress: 100,
          isComplete: true,
        }));

        if (!silent) console.log(`[Preload ${portfolioType}] ✅ Completo: ${allImages.length}/${totalFrames} frames`);
        return allImages;

      } catch (error) {
        LOADING_PROMISES.delete(cacheKey);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[Preload ${portfolioType}] ❌ Erro:`, errorMessage);
        
        // Salva o que conseguiu carregar
        if (allImages.length > 0) {
          FRAME_CACHE.set(cacheKey, allImages);
        }
        
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
          images: allImages,
          isComplete: allImages.length > 0,
        }));
        
        return allImages;
      }
    })();

    LOADING_PROMISES.set(cacheKey, loadingPromise);
    return loadingPromise;
  }, [portfolioType, totalFrames, batchSize, silent, loadBatch, state.images]);

  useEffect(() => {
    if (autoStart && !hasStartedRef.current) {
      loadFrames();
    }
  }, [autoStart, loadFrames]);

  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    hasStartedRef.current = false;
  }, []);

  const reload = useCallback(() => {
    const cacheKey = `${portfolioType}-${totalFrames}`;
    FRAME_CACHE.delete(cacheKey);
    hasStartedRef.current = false;
    return loadFrames();
  }, [portfolioType, totalFrames, loadFrames]);

  return {
    ...state,
    loadFrames,
    cleanup,
    reload,
  };
}

export const getCachedFrames = (portfolioType: 'dev' | 'edits', totalFrames: number): HTMLImageElement[] | null => {
  const cacheKey = `${portfolioType}-${totalFrames}`;
  return FRAME_CACHE.get(cacheKey) || null;
};

export const clearFrameCache = (portfolioType?: 'dev' | 'edits') => {
  if (portfolioType) {
    for (const [key] of FRAME_CACHE) {
      if (key.startsWith(portfolioType)) {
        FRAME_CACHE.delete(key);
      }
    }
  } else {
    FRAME_CACHE.clear();
  }
};

export const areFramesCached = (portfolioType: 'dev' | 'edits', totalFrames: number): boolean => {
  const cacheKey = `${portfolioType}-${totalFrames}`;
  return FRAME_CACHE.has(cacheKey);
};

export const getCacheInfo = (): Record<string, number> => {
  const info: Record<string, number> = {};
  FRAME_CACHE.forEach((images, key) => {
    info[key] = images.length;
  });
  return info;
};

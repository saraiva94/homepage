/**
 * useOptimizedPreload - Versão simplificada para diagnóstico
 *
 * Se o erro "Invalid hook call" desaparecer com esta versão,
 * o problema estava na complexidade do hook original.
 */

import { useState, useCallback, useRef, useEffect } from 'react';

interface PreloadOptions {
  totalFrames: number;
  portfolioType: 'dev' | 'edits';
  batchSize?: number;
  autoStart?: boolean;
  silent?: boolean;
}

// Cache global
const FRAME_CACHE = new Map<string, HTMLImageElement[]>();
const GLOBAL_PROGRESS = new Map<string, { loaded: number; total: number }>();

const PORTFOLIO_CONFIG = {
  dev: {
    frameStart: 14,
    dir: "/background/Ultimate_tubular",
    basename: "Ultimate_tubular_",
    ext: "jpg",
    pad: 5,
  },
  edits: {
    frameStart: 1,
    dir: "/background/sunset_timeline",
    basename: "Neon_sunset_timeline",
    ext: "jpg",
    pad: 3,
  },
};

const getFrameUrl = (type: 'dev' | 'edits', frameIndex: number): string => {
  const config = PORTFOLIO_CONFIG[type];
  const frameNumber = config.frameStart + frameIndex;
  const filename = `${config.basename}${String(frameNumber).padStart(config.pad, "0")}.${config.ext}`;
  return encodeURI(`${config.dir}/${filename}`);
};

export function useOptimizedPreload(options: PreloadOptions) {
  const { totalFrames, portfolioType, batchSize = 15, autoStart = false, silent = false } = options;

  const [progress, setProgress] = useState(0);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const hasStartedRef = useRef(false);

  const loadFrames = useCallback(async (): Promise<HTMLImageElement[]> => {
    const cacheKey = `${portfolioType}-${totalFrames}`;

    // Cache hit
    if (FRAME_CACHE.has(cacheKey)) {
      const cached = FRAME_CACHE.get(cacheKey)!;
      if (!silent) console.log(`[Preload ${portfolioType}] ✅ Cache: ${cached.length} frames`);
      setImages(cached);
      setProgress(100);
      setIsComplete(true);
      return cached;
    }

    if (hasStartedRef.current) return images;
    hasStartedRef.current = true;
    setIsLoading(true);

    if (!silent) console.log(`[Preload ${portfolioType}] 🚀 Carregando ${totalFrames} frames...`);
    GLOBAL_PROGRESS.set(cacheKey, { loaded: 0, total: totalFrames });

    const allImages: HTMLImageElement[] = [];

    for (let i = 0; i < totalFrames; i += batchSize) {
      const batchEnd = Math.min(i + batchSize, totalFrames);
      const batchPromises: Promise<HTMLImageElement>[] = [];

      for (let j = i; j < batchEnd; j++) {
        batchPromises.push(
          new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            const timeout = setTimeout(() => reject(new Error('timeout')), 10000);
            img.onload = () => { clearTimeout(timeout); resolve(img); };
            img.onerror = () => { clearTimeout(timeout); reject(new Error('load failed')); };
            img.decoding = 'async';
            img.src = getFrameUrl(portfolioType, j);
          })
        );
      }

      const results = await Promise.allSettled(batchPromises);
      for (const r of results) {
        if (r.status === 'fulfilled') allImages.push(r.value);
      }

      const pct = (allImages.length / totalFrames) * 100;
      GLOBAL_PROGRESS.set(cacheKey, { loaded: allImages.length, total: totalFrames });
      setImages([...allImages]);
      setProgress(pct);

      // Small yield to avoid blocking UI
      await new Promise(r => setTimeout(r, 5));
    }

    FRAME_CACHE.set(cacheKey, allImages);
    GLOBAL_PROGRESS.set(cacheKey, { loaded: allImages.length, total: totalFrames });
    setIsLoading(false);
    setIsComplete(true);
    setProgress(100);

    if (!silent) console.log(`[Preload ${portfolioType}] ✅ Completo: ${allImages.length}/${totalFrames}`);
    return allImages;
  }, [portfolioType, totalFrames, batchSize, silent, images]);

  useEffect(() => {
    if (autoStart && !hasStartedRef.current) {
      loadFrames();
    }
  }, [autoStart, loadFrames]);

  return {
    loadedFrames: images.length,
    isLoading,
    progress,
    error: null as string | null,
    images,
    isComplete,
    loadFrames,
    cleanup: useCallback(() => { hasStartedRef.current = false; }, []),
    reload: useCallback(() => {
      const cacheKey = `${portfolioType}-${totalFrames}`;
      FRAME_CACHE.delete(cacheKey);
      hasStartedRef.current = false;
      return loadFrames();
    }, [portfolioType, totalFrames, loadFrames]),
  };
}

export const getCachedFrames = (portfolioType: 'dev' | 'edits', totalFrames: number): HTMLImageElement[] | null => {
  return FRAME_CACHE.get(`${portfolioType}-${totalFrames}`) || null;
};

export const clearFrameCache = (portfolioType?: 'dev' | 'edits') => {
  if (portfolioType) {
    for (const key of FRAME_CACHE.keys()) {
      if (key.startsWith(portfolioType)) FRAME_CACHE.delete(key);
    }
  } else {
    FRAME_CACHE.clear();
  }
};

export const areFramesCached = (portfolioType: 'dev' | 'edits', totalFrames: number): boolean => {
  return FRAME_CACHE.has(`${portfolioType}-${totalFrames}`);
};

export const getCacheInfo = (): Record<string, number> => {
  const info: Record<string, number> = {};
  FRAME_CACHE.forEach((imgs, key) => { info[key] = imgs.length; });
  return info;
};

export const getGlobalProgress = (portfolioType: 'dev' | 'edits', totalFrames: number): number => {
  const cacheKey = `${portfolioType}-${totalFrames}`;
  if (FRAME_CACHE.has(cacheKey)) return 100;
  const p = GLOBAL_PROGRESS.get(cacheKey);
  if (!p) return 0;
  return Math.min((p.loaded / p.total) * 100, 100);
};

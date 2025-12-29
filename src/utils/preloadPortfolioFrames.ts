// Configurações dos frames de cada portfolio
const PORTFOLIOS = {
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

export type PortfolioType = keyof typeof PORTFOLIOS;

export const generateFrameURLs = (type: PortfolioType): string[] => {
  const config = PORTFOLIOS[type];
  const totalFrames = config.frameEnd - config.frameStart + 1;
  
  return Array.from({ length: totalFrames }, (_, i) => {
    const n = config.frameStart + i;
    const filename = `${config.basename}${String(n).padStart(config.pad, "0")}.${config.ext}`;
    return encodeURI(`${config.dir}/${filename}`);
  });
};

// Cache para armazenar as imagens já carregadas
const imageCache = new Map<PortfolioType, HTMLImageElement[]>();
const preloadingPortfolios = new Set<PortfolioType>();

export const preloadPortfolioFrames = (type: PortfolioType): Promise<HTMLImageElement[]> => {
  // Já foi carregado, retorna do cache
  if (imageCache.has(type)) {
    return Promise.resolve(imageCache.get(type)!);
  }

  // Já está carregando, aguarda
  if (preloadingPortfolios.has(type)) {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (imageCache.has(type)) {
          clearInterval(checkInterval);
          resolve(imageCache.get(type)!);
        }
      }, 100);
    });
  }

  preloadingPortfolios.add(type);
  const urls = generateFrameURLs(type);
  const images: HTMLImageElement[] = new Array(urls.length);
  
  console.log(`[Preload] Iniciando pré-carregamento de ${urls.length} frames para ${type}...`);

  return new Promise((resolve) => {
    let loaded = 0;
    const total = urls.length;

    urls.forEach((url, i) => {
      const img = new Image();
      img.decoding = "async";
      images[i] = img;
      
      const onComplete = () => {
        loaded++;
        if (loaded === total) {
          imageCache.set(type, images);
          preloadingPortfolios.delete(type);
          console.log(`[Preload] ${type} completo: ${total} frames carregados`);
          resolve(images);
        }
      };

      img.onload = onComplete;
      img.onerror = onComplete;
      img.src = url;
    });
  });
};

export const preloadAllPortfolios = (): void => {
  preloadPortfolioFrames("dev");
  setTimeout(() => preloadPortfolioFrames("edits"), 2000);
};

export const getCachedImages = (type: PortfolioType): HTMLImageElement[] | null => {
  return imageCache.get(type) || null;
};

export const isPortfolioPreloaded = (type: PortfolioType): boolean => {
  return imageCache.has(type);
};

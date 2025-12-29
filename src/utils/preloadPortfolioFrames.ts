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

type PortfolioType = keyof typeof PORTFOLIOS;

const generateFrameURLs = (type: PortfolioType): string[] => {
  const config = PORTFOLIOS[type];
  const totalFrames = config.frameEnd - config.frameStart + 1;
  
  return Array.from({ length: totalFrames }, (_, i) => {
    const n = config.frameStart + i;
    const filename = `${config.basename}${String(n).padStart(config.pad, "0")}.${config.ext}`;
    return encodeURI(`${config.dir}/${filename}`);
  });
};

// Cache para controlar o que já foi pré-carregado
const preloadedPortfolios = new Set<PortfolioType>();
const preloadingPortfolios = new Set<PortfolioType>();

export const preloadPortfolioFrames = (type: PortfolioType): Promise<void> => {
  // Já foi carregado ou está carregando
  if (preloadedPortfolios.has(type) || preloadingPortfolios.has(type)) {
    return Promise.resolve();
  }

  preloadingPortfolios.add(type);
  const urls = generateFrameURLs(type);
  
  console.log(`[Preload] Iniciando pré-carregamento de ${urls.length} frames para ${type}...`);

  return new Promise((resolve) => {
    let loaded = 0;
    const total = urls.length;

    urls.forEach((url) => {
      const img = new Image();
      img.decoding = "async"; // Não bloqueia a thread principal
      
      const onComplete = () => {
        loaded++;
        if (loaded === total) {
          preloadedPortfolios.add(type);
          preloadingPortfolios.delete(type);
          console.log(`[Preload] ${type} completo: ${total} frames carregados`);
          resolve();
        }
      };

      img.onload = onComplete;
      img.onerror = onComplete; // Continua mesmo com erro
      img.src = url;
    });
  });
};

export const preloadAllPortfolios = (): void => {
  // Carrega com delay entre cada portfolio para não sobrecarregar
  preloadPortfolioFrames("dev");
  setTimeout(() => preloadPortfolioFrames("edits"), 2000);
};

export const isPortfolioPreloaded = (type: PortfolioType): boolean => {
  return preloadedPortfolios.has(type);
};

import { useEffect, useRef } from "react";

// Configuração dos frames de cada portfolio
const PORTFOLIO_FRAMES = {
  dev: {
    dir: "/background/Ultimate_tubular",
    basename: "Ultimate_tubular_",
    ext: "jpg", // Mude para "webp" após converter as imagens
    pad: 5,
    start: 14,
    priorityCount: 15, // Quantos frames pré-carregar
  },
  editor: {
    dir: "/background/sunset_timeline",
    basename: "Neon_sunset_timeline",
    ext: "jpg", // Mude para "webp" após converter as imagens
    pad: 3,
    start: 1,
    priorityCount: 15,
  },
};

const buildFrameURL = (
  config: typeof PORTFOLIO_FRAMES.dev,
  index: number
): string => {
  const n = config.start + index;
  const filename = `${config.basename}${String(n).padStart(config.pad, "0")}.${config.ext}`;
  return encodeURI(`${config.dir}/${filename}`);
};

/**
 * Hook para pré-carregar frames dos portfolios em background
 * Deve ser usado na Homepage para adiantar o carregamento
 */
export function usePrefetchPortfolioFrames(delay: number = 1000) {
  const prefetchedRef = useRef(false);

  useEffect(() => {
    // Evitar múltiplos prefetches
    if (prefetchedRef.current) return;

    const prefetch = () => {
      prefetchedRef.current = true;

      // Função para carregar frames em background com baixa prioridade
      const loadFramesInBackground = (
        config: typeof PORTFOLIO_FRAMES.dev,
        name: string
      ) => {
        const urls: string[] = [];
        for (let i = 0; i < config.priorityCount; i++) {
          urls.push(buildFrameURL(config, i));
        }

        let loadedCount = 0;

        const loadNext = (index: number) => {
          if (index >= urls.length) {
            console.log(`[Prefetch] ${name}: ${loadedCount}/${urls.length} frames cached`);
            return;
          }

          const img = new Image();
          img.decoding = "async";
          
          const onComplete = () => {
            loadedCount++;
            // Usar requestIdleCallback para não impactar performance
            if ("requestIdleCallback" in window) {
              requestIdleCallback(() => loadNext(index + 1), { timeout: 200 });
            } else {
              setTimeout(() => loadNext(index + 1), 50);
            }
          };

          img.onload = onComplete;
          img.onerror = onComplete;
          img.src = urls[index];
        };

        // Iniciar carregamento
        loadNext(0);
      };

      // Carregar frames do Dev primeiro, depois Editor
      loadFramesInBackground(PORTFOLIO_FRAMES.dev, "Dev");
      
      // Delay entre portfolios para não sobrecarregar
      setTimeout(() => {
        loadFramesInBackground(PORTFOLIO_FRAMES.editor, "Editor");
      }, 500);
    };

    // Aguardar a homepage carregar completamente antes de iniciar prefetch
    const timer = setTimeout(() => {
      // Usar requestIdleCallback se disponível para não impactar UX
      if ("requestIdleCallback" in window) {
        requestIdleCallback(prefetch, { timeout: 3000 });
      } else {
        prefetch();
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);
}

// Exportar configuração para uso nos componentes de portfolio
export const FRAME_CONFIG = PORTFOLIO_FRAMES;

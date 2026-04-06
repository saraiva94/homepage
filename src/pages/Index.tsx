/**
 * ========================================
 * INDEX.TSX - COM PRELOAD DE PORTFOLIOS
 * ========================================
 * 
 * FLUXO OTIMIZADO:
 * 1. Loading Screen (2-3s)
 * 2. Homepage aparece
 * 3. ENQUANTO usuário está vendo homepage:
 *    → Frames do Dev preload em background
 *    → Frames do Edits preload em background
 * 4. Quando usuário clica em portfolio:
 *    → Frames JÁ ESTÃO prontos!
 *    → Sem barra de loading
 *    → Experiência instantânea
 */

import { useEffect, useState, useCallback, useRef } from "react";
import { About } from "@/components/About";
import { LoadingScreen } from "@/components/LoadingScreen";
import { CyberpunkBackground } from "@/components/CyberpunkBackground";
import { useOptimizedPreload } from "@/hooks/useOptimizedPreload";
import stacksImgRaw from "@/assets/optimized/stacks.webp";

const stacksImg = stacksImgRaw as unknown as string;

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [contentReady, setContentReady] = useState(false);
  const preloadStartedRef = useRef(false);

  /**
   * ========================================
   * PRELOAD DE FRAMES DO DEV (BACKGROUND)
   * ========================================
   */
  const devPreload = useOptimizedPreload({
    totalFrames: 261,
    portfolioType: 'dev',
    batchSize: 15,
    autoStart: false,
    silent: false,
  });

  /**
   * ========================================
   * PRELOAD DE FRAMES DO EDITS (BACKGROUND)
   * ========================================
   */
  const editsPreload = useOptimizedPreload({
    totalFrames: 300,
    portfolioType: 'edits',
    batchSize: 15,
    autoStart: false,
    silent: false,
  });

  /**
   * ========================================
   * HANDLER: LOADING COMPLETO
   * ========================================
   */
  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false);
    // Pequeno delay para animação suave
    setTimeout(() => setContentReady(true), 100);
  }, []);

  /**
   * ========================================
   * IDLE PREFETCH (BACKGROUND)
   * 1. Após 3s idle: prefetch route chunks
   * 2. Via requestIdleCallback: preload frames
   * ========================================
   */
  useEffect(() => {
    if (!isLoading && contentReady && !preloadStartedRef.current) {
      preloadStartedRef.current = true;

      const idleTimer = setTimeout(() => {
        // Prefetch route chunks (low priority)
        import("@/pages/portfolio/Dev");
        import("@/pages/portfolio/Edits");

        // Preload frames when browser is idle
        const startFramePreload = () => {
          devPreload.loadFrames();
          setTimeout(() => editsPreload.loadFrames(), 1500);
        };

        if ('requestIdleCallback' in window) {
          (window as any).requestIdleCallback(startFramePreload, { timeout: 8000 });
        } else {
          setTimeout(startFramePreload, 1000);
        }
      }, 3000);

      return () => clearTimeout(idleTimer);
    }
  }, [isLoading, contentReady]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * ========================================
   * RENDER: LOADING SCREEN
   * ========================================
   */
  if (isLoading) {
    return (
      <LoadingScreen 
        onComplete={handleLoadingComplete}
        minDuration={2500}
      />
    );
  }

  /**
   * ========================================
   * RENDER: HOMEPAGE
   * ========================================
   */
  return (
    <div className="w-full h-[100dvh] overflow-hidden relative bg-black flex flex-col">
      {/* Fundo cyberpunk interativo com partículas */}
      <CyberpunkBackground />

      {/* Header com Command Lines / Timelines */}
      <header
        className={`relative w-full py-8 md:py-6 shrink-0 transition-all duration-700 ease-out ${
          contentReady ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}
        style={{ zIndex: 20, position: 'relative' }}
      >
        <div
          className="w-full mx-auto grid items-center px-4"
          style={{ gridTemplateColumns: '1fr auto 1fr' }}
        >
          <div className="flex justify-end font-mono" style={{ paddingRight: '0.6ch' }}>
            <span
              className="glitch text-lg sm:text-xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight text-white font-mono whitespace-nowrap"
              data-text="Command Lines"
            >
              Command Lines
            </span>
          </div>

          <div className="flex items-center justify-center">
            <img
              src={stacksImg}
              alt="Tech Stack"
              className="h-auto max-w-[60px] sm:max-w-[80px] md:max-w-[140px] lg:max-w-[180px] xl:max-w-[220px] object-contain select-none"
              loading="eager"
            />
          </div>

          <div className="flex justify-start font-mono" style={{ paddingLeft: '1.2ch' }}>
            <span
              className="glitch text-lg sm:text-xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight text-white font-mono whitespace-nowrap"
              data-text="Timelines"
            >
              Timelines
            </span>
          </div>
        </div>
      </header>

      {/* Card principal - centralizado no espaço abaixo do navbar */}
      <main
        className="flex-1 flex items-center justify-center min-h-0 -mt-4 md:mt-0"
        style={{ zIndex: 10, position: 'relative' }}
      >
        <div
          className={`w-[95%] sm:w-[90%] md:w-[85%] lg:w-[80%] max-w-[min(90vw,1600px)] max-h-full transition-all duration-700 ease-out delay-150 ${
            contentReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ height: "clamp(400px, calc(100dvh - 140px), 820px)" }}
        >
          <About isVisible={contentReady} />
        </div>
      </main>
    </div>
  );
}

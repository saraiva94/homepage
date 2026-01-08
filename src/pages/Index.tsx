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

import { useEffect, useState, useCallback } from "react";
import { About } from "@/components/About";
import CursorTrail from "@/components/CursorTrail";
import { LoadingScreen } from "@/components/LoadingScreen";
import { CyberpunkBackground } from "@/components/CyberpunkBackground";
import { useOptimizedPreload, getCacheInfo } from "@/hooks/useOptimizedPreload";
import stacksImgRaw from "@/assets/stacks.png";

const stacksImg = stacksImgRaw as unknown as string;

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [contentReady, setContentReady] = useState(false);

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
    silent: true,
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
    silent: true,
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
   * PRELOAD DE PORTFOLIOS (BACKGROUND)
   * Inicia DEPOIS que homepage está visível
   * ========================================
   */
  useEffect(() => {
    if (!isLoading && contentReady) {
      const timer = setTimeout(() => {
        console.log('[Index] 🎬 Iniciando preload de portfolios em background...');
        devPreload.loadFrames();
        
        setTimeout(() => {
          editsPreload.loadFrames();
        }, 3000);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isLoading, contentReady]);

  /**
   * ========================================
   * STATUS DO PRELOAD (DEBUG - apenas console)
   * ========================================
   */
  useEffect(() => {
    const statusInterval = setInterval(() => {
      const cacheInfo = getCacheInfo();
      const totalCached = Object.values(cacheInfo).reduce((a, b) => a + b, 0);
      
      if (totalCached > 0) {
        console.log('[Index] 📊 Cache status:', cacheInfo);
      }
    }, 5000);

    return () => clearInterval(statusInterval);
  }, []);

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
      {/* Fundo cyberpunk interativo */}
      <CyberpunkBackground className="z-0" />
      
      <CursorTrail />

      {/* Header com Command Lines / Timelines */}
      <header 
        className={`relative z-10 w-full py-4 md:py-6 shrink-0 transition-all duration-700 ease-out ${
          contentReady ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-0">
            
            {/* Command Lines - Esquerda */}
            <div className="flex-1 flex justify-center md:justify-start md:-mr-6 lg:-mr-12 xl:-mr-16 order-1 md:order-1">
              <span
                className="glitch text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight text-white font-mono whitespace-nowrap"
                data-text="Command Lines"
              >
                Command Lines
              </span>
            </div>

            {/* Imagem das stacks - Centro */}
            <div className="flex-shrink-0 flex items-center justify-center order-first md:order-2">
              <img
                src={stacksImg}
                alt="Tech Stack"
                className="w-full h-auto max-w-[80px] sm:max-w-[100px] md:max-w-[140px] lg:max-w-[180px] xl:max-w-[220px] object-contain select-none pointer-events-none"
                loading="eager"
              />
            </div>

            {/* Timelines - Direita */}
            <div className="flex-1 flex justify-center md:justify-end md:-ml-8 lg:-ml-20 xl:-ml-28 order-2 md:order-3">
              <span
                className="glitch text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight text-white font-mono whitespace-nowrap"
                data-text="Timelines"
              >
                Timelines
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Card principal - mais próximo do navbar */}
      <main className="flex-1 relative z-10 px-2 sm:px-4 pb-4 flex items-start justify-center">
        <div
          className={`w-[95%] sm:w-[90%] md:w-[85%] lg:w-[80%] max-w-6xl transition-all duration-700 ease-out delay-150 ${
            contentReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ height: "clamp(400px, calc(100vh - 140px), 820px)" }}
        >
          <About isVisible={contentReady} />
        </div>
      </main>
    </div>
  );
}

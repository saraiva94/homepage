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
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import CursorTrail from "@/components/CursorTrail";
import { LoadingScreen } from "@/components/LoadingScreen";
import { CyberpunkBackground } from "@/components/CyberpunkBackground";
import { useOptimizedPreload, getCacheInfo } from "@/hooks/useOptimizedPreload";

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [heroReady, setHeroReady] = useState(false);
  const [resourcesLoaded, setResourcesLoaded] = useState(false);

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
   * RECURSOS PRONTOS
   * ========================================
   */
  useEffect(() => {
    // Com o fundo cyberpunk, não há recursos críticos externos para carregar
    setResourcesLoaded(true);
  }, []);

  /**
   * ========================================
   * HANDLER: LOADING COMPLETO
   * ========================================
   */
  const handleLoadingComplete = useCallback(() => {
    if (resourcesLoaded) {
      setIsLoading(false);
    }
  }, [resourcesLoaded]);

  /**
   * ========================================
   * HANDLER: HERO VIDEOS CARREGADOS
   * ========================================
   */
  const handleHeroVideosLoaded = useCallback(() => {
    setHeroReady(true);
  }, []);

  /**
   * ========================================
   * FALLBACK: SE HERO NÃO CARREGAR
   * ========================================
   */
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (!heroReady) {
        console.warn('[Index] Hero fallback triggered');
        setHeroReady(true);
      }
    }, 3000);

    return () => clearTimeout(fallbackTimer);
  }, [heroReady]);

  /**
   * ========================================
   * PRELOAD DE PORTFOLIOS (BACKGROUND)
   * Inicia DEPOIS que homepage está visível
   * ========================================
   */
  useEffect(() => {
    if (!isLoading && heroReady) {
      // Aguarda 1.5s para não competir com animações da homepage
      const timer = setTimeout(() => {
        console.log('[Index] 🎬 Iniciando preload de portfolios em background...');
        
        // Inicia preload do Dev primeiro (mais comum)
        devPreload.loadFrames();
        
        // Depois de 3s, inicia o Edits
        setTimeout(() => {
          editsPreload.loadFrames();
        }, 3000);

      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isLoading, heroReady]);

  /**
   * ========================================
   * STATUS DO PRELOAD (DEBUG)
   * ========================================
   */
  useEffect(() => {
    // Log do progresso a cada 5 segundos (debug)
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
    <div className="w-full min-h-[100dvh] overflow-x-hidden relative bg-black flex flex-col">
      {/* Fundo cyberpunk interativo */}
      <CyberpunkBackground className="z-0" />
      
      <CursorTrail />

      <header className="w-full shrink-0 relative z-10">
        <Hero 
          onVideosLoaded={handleHeroVideosLoaded}
          isVisible={!isLoading} 
        />
      </header>

      <main className="flex-1 flex items-center justify-center p-2 sm:p-4 relative z-10">
        <div
          className="w-[95%] sm:w-[90%] md:w-[85%] lg:w-[80%] max-w-6xl"
          style={{ height: "clamp(480px, 75vh, 920px)" }}
        >
          <About isVisible={heroReady} />
        </div>
      </main>
    </div>
  );
}

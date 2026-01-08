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
import homepageBg from "@/assets/homepage-bg.png";
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
   * PRELOAD DE RECURSOS CRÍTICOS
   * ========================================
   */
  useEffect(() => {
    const preloadCriticalResources = async () => {
      try {
        const criticalResources = [homepageBg];

        const imagePromises = criticalResources.map((src) => {
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = reject;
            img.src = src;
          });
        });

        await Promise.all(imagePromises);
        console.log('[Index] Recursos críticos carregados');
        setResourcesLoaded(true);
      } catch (error) {
        console.error('[Index] Erro ao carregar recursos:', error);
        setResourcesLoaded(true);
      }
    };

    preloadCriticalResources();
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
    <div
      className="w-full min-h-[100dvh] overflow-x-hidden relative bg-cover bg-center bg-no-repeat flex flex-col"
      style={{
        backgroundImage: `url(${homepageBg})`,
      }}
    >
      <CursorTrail />

      <header className="w-full shrink-0">
        <Hero 
          onVideosLoaded={handleHeroVideosLoaded}
          isVisible={!isLoading} 
        />
      </header>

      <main className="flex-1 flex items-center justify-center p-2 sm:p-4">
        <div
          className="w-[95%] sm:w-[90%] md:w-[85%] lg:w-[80%] max-w-6xl"
          style={{ height: "clamp(480px, 75vh, 920px)" }}
        >
          <About isVisible={heroReady} />
        </div>
      </main>

      {/* Debug info (remover em produção) */}
      {import.meta.env.DEV && (
        <div className="fixed bottom-4 left-4 bg-black/80 backdrop-blur-sm border border-cyan-500/30 rounded px-3 py-2 text-xs font-mono text-cyan-400 z-50">
          <div>Dev: {devPreload.loadedFrames}/261 ({devPreload.progress.toFixed(0)}%)</div>
          <div>Edits: {editsPreload.loadedFrames}/300 ({editsPreload.progress.toFixed(0)}%)</div>
        </div>
      )}
    </div>
  );
}

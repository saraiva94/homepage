/**
 * ========================================
 * INDEX.TSX - COM LOADING SCREEN CYBERPUNK
 * ========================================
 * 
 * FLUXO:
 * 1. Loading Screen aparece primeiro
 * 2. Preload de recursos críticos acontece
 * 3. Loading completa → Hero + About aparecem
 * 4. Preload de portfolios em background
 */

import { useEffect, useState, useCallback } from "react";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import CursorTrail from "@/components/CursorTrail";
import { LoadingScreen } from "@/components/LoadingScreen";
import homepageBg from "@/assets/homepage-bg.png";
import { preloadAllPortfolios } from "@/utils/preloadPortfolioFrames";

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [heroReady, setHeroReady] = useState(false);
  const [resourcesLoaded, setResourcesLoaded] = useState(false);

  /**
   * ========================================
   * PRELOAD DE RECURSOS CRÍTICOS
   * ========================================
   */
  useEffect(() => {
    const preloadCriticalResources = async () => {
      try {
        // Lista de recursos críticos para preload
        const criticalResources = [
          // Background da homepage
          homepageBg,
        ];

        // Preload de imagens críticas
        const imagePromises = criticalResources.map((src) => {
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = reject;
            img.src = src;
          });
        });

        // Aguarda todas as imagens críticas
        await Promise.all(imagePromises);
        
        console.log('[Index] Recursos críticos carregados');
        setResourcesLoaded(true);
      } catch (error) {
        console.error('[Index] Erro ao carregar recursos:', error);
        // Continua mesmo com erro (não trava a aplicação)
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
    // Só esconde loading quando recursos estão prontos
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
    // Se após 4 segundos o Hero ainda não carregou, mostra mesmo assim
    const fallbackTimer = setTimeout(() => {
      if (!heroReady) {
        console.warn('[Index] Hero fallback triggered');
        setHeroReady(true);
      }
    }, 4000);

    return () => clearTimeout(fallbackTimer);
  }, [heroReady]);

  /**
   * ========================================
   * PRELOAD DE PORTFOLIOS (BACKGROUND)
   * ========================================
   */
  useEffect(() => {
    // Só inicia preload de portfolios depois que o loading terminou
    if (!isLoading) {
      const timer = setTimeout(() => {
        console.log('[Index] Iniciando preload de portfolios...');
        preloadAllPortfolios();
      }, 1000); // Delay de 1s para não competir com renderização

      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  /**
   * ========================================
   * RENDER: LOADING SCREEN
   * ========================================
   */
  if (isLoading) {
    return (
      <LoadingScreen 
        onComplete={handleLoadingComplete}
        minDuration={2500} // 2.5 segundos mínimo
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
      {/* Cursor Trail (efeito cyberpunk) */}
      <CursorTrail />

      {/* Header: Hero Section */}
      <header className="w-full shrink-0">
        <Hero 
          onVideosLoaded={handleHeroVideosLoaded}
          isVisible={!isLoading} 
        />
      </header>

      {/* Main: About Section */}
      <main className="flex-1 flex items-center justify-center p-2 sm:p-4">
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

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
   * RENDER: HOMEPAGE (só fundo + About card)
   * ========================================
   */
  return (
    <div className="w-full min-h-[100dvh] overflow-x-hidden relative bg-black flex items-center justify-center">
      {/* Fundo cyberpunk interativo (mesmo do loading) */}
      <CyberpunkBackground className="z-0" />
      
      <CursorTrail />

      {/* Card principal centralizado */}
      <main className="relative z-10 p-2 sm:p-4 w-full flex items-center justify-center">
        <div
          className={`w-[95%] sm:w-[90%] md:w-[85%] lg:w-[80%] max-w-6xl transition-all duration-700 ease-out ${
            contentReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ height: "clamp(480px, 75vh, 920px)" }}
        >
          <About isVisible={contentReady} />
        </div>
      </main>
    </div>
  );
}

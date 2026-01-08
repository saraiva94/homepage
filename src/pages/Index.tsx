import { useEffect, useState, useCallback } from "react";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import CursorTrail from "@/components/CursorTrail";
import homepageBg from "@/assets/homepage-bg.png";
import { preloadAllPortfolios } from "@/utils/preloadPortfolioFrames";

export default function Index() {
  const [heroReady, setHeroReady] = useState(false);

  const handleHeroVideosLoaded = useCallback(() => {
    setHeroReady(true);
  }, []);

  // Fallback: se algum evento de vídeo não disparar em algum navegador,
  // não deixamos a UI "presa" indefinidamente.
  useEffect(() => {
    const t = window.setTimeout(() => setHeroReady(true), 3500);
    return () => window.clearTimeout(t);
  }, []);

  // Pré-carrega os frames dos portfolios (não bloqueia render)
  useEffect(() => {
    const timer = setTimeout(() => {
      preloadAllPortfolios();
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="w-full min-h-[100dvh] overflow-x-hidden relative bg-cover bg-center bg-no-repeat flex flex-col"
      style={{
        backgroundImage: `url(${homepageBg})`,
      }}
    >
      <CursorTrail />

      <header className="w-full shrink-0">
        <Hero onVideosLoaded={handleHeroVideosLoaded} />
      </header>

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


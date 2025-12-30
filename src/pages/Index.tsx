import { useEffect, useState, useCallback } from "react";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import CursorTrail from "@/components/CursorTrail";
import homepageBg from "@/assets/homepage-bg.png";
import { preloadAllPortfolios } from "@/utils/preloadPortfolioFrames";

export default function Index() {
  const [videosLoaded, setVideosLoaded] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showHero, setShowHero] = useState(false);

  const handleVideosLoaded = useCallback(() => {
    setVideosLoaded(true);
  }, []);

  // Inicia a animação do About imediatamente
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAbout(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Quando os vídeos carregarem, mostra o Hero (com fallback)
  useEffect(() => {
    let timer: number | undefined;

    if (videosLoaded) {
      timer = window.setTimeout(() => {
        setShowHero(true);
      }, 200);
    }

    // Fallback: se o browser não disparar eventos de vídeo, não "mata" o layout
    const fallback = window.setTimeout(() => {
      setShowHero(true);
    }, 1200);

    return () => {
      if (timer) window.clearTimeout(timer);
      window.clearTimeout(fallback);
    };
  }, [videosLoaded]);

  // Pré-carrega os frames dos portfolios
  useEffect(() => {
    const timer = setTimeout(() => {
      preloadAllPortfolios();
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="w-full h-[100dvh] overflow-x-hidden overflow-y-auto relative bg-cover bg-center bg-no-repeat flex flex-col"
      style={{
        backgroundImage: `url(${homepageBg})`,
      }}
    >
      <CursorTrail />

      {/* Hero: altura natural quando visível, 0 quando não */}
      <div
        className="w-full shrink-0 overflow-hidden transition-all duration-[900ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          maxHeight: showHero ? "200px" : "0px",
          opacity: showHero ? 1 : 0,
        }}
      >
        <Hero onVideosLoaded={handleVideosLoaded} isVisible={showHero} />
      </div>

      {/* About: ocupa 80% largura x 90% altura do espaço disponível */}
      <div className="flex-1 min-h-0 flex items-center justify-center p-4">
        <div className="w-[80%] h-[90%] transition-all duration-[900ms] ease-[cubic-bezier(0.4,0,0.2,1)]">
          <About isVisible={showAbout} />
        </div>
      </div>
    </div>
  );
}

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

  // Quando os vídeos carregarem, mostra o Hero
  useEffect(() => {
    if (videosLoaded) {
      const timer = setTimeout(() => {
        setShowHero(true);
      }, 200);
      return () => clearTimeout(timer);
    }
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
      className="h-screen overflow-hidden relative bg-cover bg-center bg-fixed flex flex-col"
      style={{ backgroundImage: `url(${homepageBg})` }}
    >
      <CursorTrail />
      
      {/* Hero - aparece de cima quando os vídeos carregam */}
      <div 
        className={`flex-shrink-0 transition-all duration-700 ease-out ${
          showHero ? "opacity-100 max-h-[200px]" : "opacity-0 max-h-0"
        }`}
      >
        <Hero onVideosLoaded={handleVideosLoaded} isVisible={showHero} />
      </div>
      
      {/* About - centralizado quando Hero não está visível, se ajusta quando Hero aparece */}
      <div 
        className={`flex-1 flex transition-all duration-700 ease-out ${
          showHero 
            ? "items-start pt-4" 
            : "items-center justify-center"
        }`}
      >
        <About isVisible={showAbout} compact={showHero} />
      </div>
    </div>
  );
}
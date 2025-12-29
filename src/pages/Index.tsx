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
      <Hero onVideosLoaded={handleVideosLoaded} isVisible={showHero} />

      {/* About: mantém proporções; reduz no máximo 20% quando o navbar entra */}
      <div
        className={
          "flex-1 min-h-0 flex items-center justify-center transition-transform duration-700 ease-out " +
          (showHero ? "scale-[0.8] origin-center" : "scale-100")
        }
      >
        <About isVisible={showAbout} />
      </div>
    </div>
  );
}
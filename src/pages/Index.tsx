import { useEffect, useState, useCallback, useRef, useLayoutEffect } from "react";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import CursorTrail from "@/components/CursorTrail";
import homepageBg from "@/assets/homepage-bg.png";
import { preloadAllPortfolios } from "@/utils/preloadPortfolioFrames";

export default function Index() {
  const [videosLoaded, setVideosLoaded] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showHero, setShowHero] = useState(false);

  const aboutWrapperRef = useRef<HTMLDivElement | null>(null);
  const aboutContentRef = useRef<HTMLDivElement | null>(null);
  const [aboutScale, setAboutScale] = useState<number>(1);
  const [heroHeight, setHeroHeight] = useState<number>(0);

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

  // Mede o Hero quando ele aparece
  useLayoutEffect(() => {
    const measure = () => {
      if (showHero) {
        const heroEl = document.querySelector<HTMLElement>("[data-hero]");
        setHeroHeight(heroEl?.offsetHeight ?? 0);
      } else {
        setHeroHeight(0);
      }
    };

    measure();

    // Também mede após a transição terminar
    const timer = setTimeout(measure, 750);
    window.addEventListener("resize", measure);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", measure);
    };
  }, [showHero]);

  // Calcula escala do About para caber no viewport sem scroll
  useLayoutEffect(() => {
    const aboutEl = aboutContentRef.current;
    if (!aboutEl) return;

    const calculate = () => {
      const contentH = aboutEl.scrollHeight;
      if (contentH <= 0) return;

      // Espaço disponível = viewport - altura do hero (se visível)
      const available = window.innerHeight - heroHeight;
      if (available <= 0) {
        setAboutScale(1);
        return;
      }

      // Escala necessária, limitada entre 0.8 e 1
      const rawScale = available / contentH;
      setAboutScale(Math.min(1, Math.max(0.8, rawScale)));
    };

    calculate();

    const ro = new ResizeObserver(calculate);
    ro.observe(aboutEl);
    window.addEventListener("resize", calculate);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", calculate);
    };
  }, [heroHeight, showAbout]);

  return (
    <div
      className="h-screen overflow-hidden relative bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${homepageBg})` }}
    >
      <CursorTrail />
      
      {/* Hero: quando não visível, fica fora do fluxo (height 0) */}
      <div
        className="w-full overflow-hidden transition-all duration-700 ease-out"
        style={{ height: showHero ? heroHeight || "auto" : 0 }}
      >
        <Hero onVideosLoaded={handleVideosLoaded} isVisible={showHero} />
      </div>

      {/* About: ocupa o restante do viewport, centralizado verticalmente */}
      <div
        ref={aboutWrapperRef}
        className="flex items-center justify-center transition-all duration-700 ease-out"
        style={{ height: `calc(100vh - ${heroHeight}px)` }}
      >
        <div
          className="w-full origin-center transition-transform duration-700 ease-out will-change-transform"
          style={{ transform: `scale(${aboutScale})` }}
        >
          <div ref={aboutContentRef}>
            <About isVisible={showAbout} />
          </div>
        </div>
      </div>
    </div>
  );
}

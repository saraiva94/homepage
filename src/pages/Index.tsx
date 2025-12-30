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

  const aboutContentRef = useRef<HTMLDivElement | null>(null);
  const [aboutScale, setAboutScale] = useState<number>(1);
  const [heroHeight, setHeroHeight] = useState<number>(0);
  
  // Armazena a altura original do About (antes de qualquer escala)
  const originalAboutHeight = useRef<number>(0);

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

  // Mede o Hero continuamente
  useLayoutEffect(() => {
    const measure = () => {
      if (showHero) {
        const heroEl = document.querySelector<HTMLElement>("[data-hero]");
        if (heroEl) {
          setHeroHeight(heroEl.offsetHeight);
        }
      } else {
        setHeroHeight(0);
      }
    };

    // Mede imediatamente
    measure();

    // Mede novamente após transições
    const timers = [
      setTimeout(measure, 100),
      setTimeout(measure, 400),
      setTimeout(measure, 800),
    ];

    window.addEventListener("resize", measure);

    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("resize", measure);
    };
  }, [showHero]);

  // Mede a altura original do About UMA VEZ (antes de aplicar escala)
  useLayoutEffect(() => {
    const aboutEl = aboutContentRef.current;
    if (!aboutEl || !showAbout) return;

    // Mede após o About estar visível
    const measureOriginal = () => {
      const parent = aboutEl.parentElement as HTMLDivElement | null;
      if (!parent) return;

      // Temporariamente remove a escala para medir o tamanho real
      const previousTransform = parent.style.transform;
      parent.style.transform = "scale(1)";

      // Força reflow e mede
      const height = aboutEl.getBoundingClientRect().height;
      if (height > 0 && originalAboutHeight.current === 0) {
        originalAboutHeight.current = height;
      }

      // Restaura a escala (mesmo se era string vazia)
      parent.style.transform = previousTransform;
    };

    const timer = setTimeout(measureOriginal, 150);
    return () => clearTimeout(timer);
  }, [showAbout]);

  // Calcula escala do About para caber no viewport sem scroll
  useLayoutEffect(() => {
    if (originalAboutHeight.current <= 0) return;

    const calculate = () => {
      const contentH = originalAboutHeight.current;
      const available = window.innerHeight - heroHeight;

      if (available <= 0 || contentH <= 0) {
        setAboutScale(1);
        return;
      }

      // Escala necessária, limitada entre 0.75 e 1
      const rawScale = available / contentH;
      const clampedScale = Math.min(1, Math.max(0.75, rawScale));
      setAboutScale(clampedScale);
    };

    calculate();

    // Recalcula após mudanças
    const timers = [
      setTimeout(calculate, 100),
      setTimeout(calculate, 500),
      setTimeout(calculate, 900),
    ];

    window.addEventListener("resize", calculate);

    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("resize", calculate);
    };
  }, [heroHeight, showAbout]);

  return (
    <div
      className="h-screen overflow-hidden relative bg-cover bg-center bg-fixed flex flex-col"
      style={{ backgroundImage: `url(${homepageBg})` }}
    >
      <CursorTrail />
      
      {/* Hero: altura natural quando visível, 0 quando não */}
      <div
        className="w-full shrink-0 overflow-hidden transition-all duration-700 ease-out"
        style={{ 
          maxHeight: showHero ? "200px" : "0px",
          opacity: showHero ? 1 : 0,
        }}
      >
        <Hero onVideosLoaded={handleVideosLoaded} isVisible={showHero} />
      </div>

      {/* About: ocupa o restante do viewport, centralizado verticalmente */}
      <div
        className="flex-1 min-h-0 flex items-center justify-center transition-all duration-700 ease-out overflow-hidden"
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

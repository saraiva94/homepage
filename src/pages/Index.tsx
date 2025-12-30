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
  const [verticalOffset, setVerticalOffset] = useState<number>(0);
  const [viewportHeight, setViewportHeight] = useState<number>(
    typeof window !== "undefined" ? window.innerHeight : 800
  );

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

  // Atualiza viewportHeight no resize
  useEffect(() => {
    const handleResize = () => setViewportHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Mede o Hero quando ele aparece
  useLayoutEffect(() => {
    if (!showHero) {
      setHeroHeight(0);
      return;
    }

    const heroEl = document.querySelector<HTMLElement>("[data-hero]");
    if (!heroEl) return;

    const updateHero = () => setHeroHeight(heroEl.offsetHeight);
    updateHero();

    const ro = new ResizeObserver(() => updateHero());
    ro.observe(heroEl);

    return () => ro.disconnect();
  }, [showHero]);

  // Calcula escala e offset do About
  useLayoutEffect(() => {
    const aboutEl = aboutContentRef.current;
    if (!aboutEl) return;

    const calculate = () => {
      const contentH = aboutEl.scrollHeight;
      if (contentH <= 0) return;

      // Espaço disponível depende se o Hero está visível
      const currentHeroH = showHero ? heroHeight : 0;
      const available = viewportHeight - currentHeroH;

      if (available <= 0) {
        setAboutScale(1);
        setVerticalOffset(0);
        return;
      }

      // Calcula escala necessária (mínimo 0.8, máximo 1)
      const rawScale = available / contentH;
      const clampedScale = Math.min(1, Math.max(0.8, rawScale));
      setAboutScale(clampedScale);

      // Calcula altura escalada
      const scaledH = contentH * clampedScale;

      // Offset para centralizar verticalmente no espaço disponível
      const offset = Math.max(0, (available - scaledH) / 2);
      setVerticalOffset(offset);
    };

    calculate();

    const ro = new ResizeObserver(() => calculate());
    ro.observe(aboutEl);

    return () => ro.disconnect();
  }, [showHero, showAbout, heroHeight, viewportHeight]);

  // Quando Hero aparece, o padding-top deve ser a altura do Hero (About fica logo abaixo)
  // Quando Hero não aparece, usamos verticalOffset para centralizar
  const paddingTop = showHero ? heroHeight : verticalOffset;

  return (
    <div
      className="h-screen overflow-hidden relative bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${homepageBg})` }}
    >
      <CursorTrail />
      <Hero onVideosLoaded={handleVideosLoaded} isVisible={showHero} />

      {/* About: centralizado antes do Hero; quando o Hero entra, desce para ficar abaixo dele */}
      <div
        className="absolute inset-0 w-full flex justify-center transition-all duration-700 ease-out"
        style={{ paddingTop }}
      >
        <div
          className="w-full origin-top transition-transform duration-700 ease-out will-change-transform"
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

import { useEffect, useState, useCallback, useRef } from "react";
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
  const [aboutContentHeight, setAboutContentHeight] = useState<number>(0);
  const [aboutScale, setAboutScale] = useState<number>(1);

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

  // Mede o About (sem distorcer elementos internos) e aplica uma escala global (máx. 20%)
  useEffect(() => {
    const aboutEl = aboutContentRef.current;
    if (!aboutEl) return;

    const update = () => {
      const heroEl = document.querySelector<HTMLElement>("[data-hero]");
      const heroH = showHero ? heroEl?.offsetHeight ?? 0 : 0;
      const contentH = aboutEl.offsetHeight;

      setAboutContentHeight(contentH);

      // Espaço disponível no primeiro viewport (evita rolagem)
      const available = window.innerHeight - heroH;
      if (contentH <= 0 || available <= 0) {
        setAboutScale(1);
        return;
      }

      const rawScale = available / contentH;
      const clamped = Math.min(1, Math.max(0.8, rawScale));
      setAboutScale(clamped);
    };

    update();

    const ro = new ResizeObserver(() => update());
    ro.observe(aboutEl);

    const heroEl = document.querySelector<HTMLElement>("[data-hero]");
    if (heroEl) ro.observe(heroEl);

    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("resize", update);
      ro.disconnect();
    };
  }, [showHero, showAbout]);

  const scaledHeight = aboutContentHeight > 0 ? aboutContentHeight * aboutScale : undefined;

  return (
    <div
      className="min-h-screen relative bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${homepageBg})` }}
    >
      <CursorTrail />
      <Hero onVideosLoaded={handleVideosLoaded} isVisible={showHero} />

      {/* Mantém o layout original do card; escala o bloco inteiro para caber no viewport inicial */}
      <div className="w-full flex justify-center" style={{ height: scaledHeight }}>
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

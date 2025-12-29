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

  // Mede o Hero quando ele aparece (para posicionar o About abaixo dele)
  useEffect(() => {
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

    window.addEventListener("resize", updateHero);
    return () => {
      window.removeEventListener("resize", updateHero);
      ro.disconnect();
    };
  }, [showHero]);

  // Mede o About e aplica escala para caber no viewport (máx. 20% de redução)
  useEffect(() => {
    const aboutEl = aboutContentRef.current;
    if (!aboutEl) return;

    const update = () => {
      const contentH = aboutEl.offsetHeight;
      setAboutContentHeight(contentH);

      // Espaço disponível: viewport completo se Hero não visível, senão subtrai Hero
      const currentHeroH = showHero ? heroHeight : 0;
      const available = window.innerHeight - currentHeroH;

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

    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("resize", update);
      ro.disconnect();
    };
  }, [showHero, showAbout, heroHeight]);

  const scaledHeight = aboutContentHeight > 0 ? aboutContentHeight * aboutScale : undefined;

  // Calcula posição vertical para centralizar quando Hero não está visível
  const availableSpace = showHero ? window.innerHeight - heroHeight : window.innerHeight;
  const verticalOffset = scaledHeight
    ? Math.max(0, (availableSpace - scaledHeight) / 2)
    : 0;

  return (
    <div
      className="h-screen overflow-hidden relative bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${homepageBg})` }}
    >
      <CursorTrail />
      <Hero onVideosLoaded={handleVideosLoaded} isVisible={showHero} />

      {/* About: centralizado antes do Hero; quando o Hero entra, desce para ficar abaixo dele */}
      <div
        className="h-full w-full flex justify-center transition-all duration-700 ease-out"
        style={{ paddingTop: showHero ? heroHeight : verticalOffset }}
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

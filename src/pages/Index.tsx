import { useEffect, useState, useCallback, useLayoutEffect } from "react";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import CursorTrail from "@/components/CursorTrail";
import homepageBg from "@/assets/homepage-bg.png";
import { preloadAllPortfolios } from "@/utils/preloadPortfolioFrames";
import { useElementSize } from "@/hooks/useElementSize";

const HERO_MAX_H = 200;

export default function Index() {
  const [videosLoaded, setVideosLoaded] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showHero, setShowHero] = useState(false);

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

  // Medidas reais (layout) do conteúdo do About (offset* não muda com transform: scale)
  const { ref: aboutContentRef, size: aboutSize } = useElementSize<HTMLDivElement>(showAbout);

  // Mede o Hero durante a animação para interpolar o preenchimento (pré e pós-navbar)
  const { ref: heroRef, size: heroSize } = useElementSize<HTMLDivElement>(true);

  // Medida da área livre (o espaço real disponível depois do Hero aparecer)
  const { ref: aboutSlotRef, size: slotSize } = useElementSize<HTMLDivElement>(true);

  // Regra: o card deve preencher % do background livre sem quebrar o layout interno
  useLayoutEffect(() => {
    if (aboutSize.w <= 0 || aboutSize.h <= 0) return;
    if (slotSize.w <= 0 || slotSize.h <= 0) return;

    const calculate = () => {
      const contentW = aboutSize.w;
      const contentH = aboutSize.h;

      // Margens de segurança para não encostar nas bordas
      const availableW = Math.max(0, slotSize.w - 32);
      const availableH = Math.max(0, slotSize.h - 16);

      if (availableW <= 0 || availableH <= 0) {
        setAboutScale(1);
        return;
      }

      // 60% no layout horizontal, 80% no layout vertical
      const isVertical = availableH > availableW;
      const fillEnd = isVertical ? 0.8 : 0.6;

      // Antes do navbar entrar (Hero ~0px) = 100% do espaço livre;
      // Conforme o navbar entra, interpolamos até o alvo (60%/80%).
      const heroProgress = Math.min(1, Math.max(0, heroSize.h / HERO_MAX_H));
      const fill = 1 + (fillEnd - 1) * heroProgress;

      const targetW = availableW * fill;
      const targetH = availableH * fill;

      const scaleW = targetW / contentW;
      const scaleH = targetH / contentH;

      const rawScale = Math.min(scaleW, scaleH);
      const clamped = Math.min(1, Math.max(0.35, rawScale));
      setAboutScale(clamped);
    };

    calculate();

    // Acompanha a entrada do navbar/CLS (durante a animação do Hero)
    const start = performance.now();
    let rafId = 0;
    const tick = () => {
      calculate();
      if (performance.now() - start < 1600) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    const timers = [
      setTimeout(calculate, 120),
      setTimeout(calculate, 420),
      setTimeout(calculate, 820),
      setTimeout(calculate, 1200),
    ];

    const vv = window.visualViewport;
    vv?.addEventListener("resize", calculate);
    vv?.addEventListener("scroll", calculate);

    return () => {
      cancelAnimationFrame(rafId);
      timers.forEach(clearTimeout);
      vv?.removeEventListener("resize", calculate);
      vv?.removeEventListener("scroll", calculate);
    };
  }, [aboutSize.h, aboutSize.w, slotSize.h, slotSize.w, heroSize.h]);

  return (
    <div
      className="h-screen overflow-hidden relative bg-cover bg-center bg-fixed flex flex-col"
      style={{ backgroundImage: `url(${homepageBg})` }}
    >
      <CursorTrail />

      {/* Hero: altura natural quando visível, 0 quando não */}
      <div
        ref={heroRef}
        className="w-full shrink-0 overflow-hidden transition-all duration-[900ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          maxHeight: showHero ? "200px" : "0px",
          opacity: showHero ? 1 : 0,
        }}
      >
        <Hero onVideosLoaded={handleVideosLoaded} isVisible={showHero} />
      </div>

      {/* About: ocupa o restante do viewport, centralizado */}
      <div
        ref={aboutSlotRef}
        className="flex-1 min-h-0 flex items-start justify-center pt-6"
      >
        <div
          className="w-full max-w-6xl origin-center transition-transform duration-[900ms] ease-[cubic-bezier(0.4,0,0.2,1)] will-change-transform"
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

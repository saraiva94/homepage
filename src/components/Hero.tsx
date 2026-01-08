/**
 * Hero Component - Versão Otimizada
 * 
 * Otimizações:
 * - Vídeo único (não 4x)
 * - Lazy loading com IntersectionObserver
 * - Preload="none" até necessário
 */

import { useEffect, useRef, useCallback, useState } from "react";
import stacksImgRaw from "@/assets/stacks.png";

const stacksImg = stacksImgRaw as unknown as string;

interface HeroProps {
  onVideosLoaded?: () => void;
  isVisible?: boolean;
}

export function Hero({ onVideosLoaded, isVisible = true }: HeroProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const hasNotified = useRef(false);

  /**
   * IntersectionObserver - Carrega vídeo apenas quando Hero está visível
   */
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !shouldLoadVideo) {
            setShouldLoadVideo(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [shouldLoadVideo]);

  /**
   * Video Loading Handler
   */
  const handleVideoCanPlay = useCallback(() => {
    setVideoLoaded(true);
    
    if (!hasNotified.current) {
      hasNotified.current = true;
      onVideosLoaded?.();
    }
  }, [onVideosLoaded]);

  /**
   * Video Playback
   */
  useEffect(() => {
    if (!videoRef.current || !videoLoaded) return;

    const video = videoRef.current;
    
    const playVideo = async () => {
      try {
        video.muted = true;
        video.playsInline = true;
        await video.play();
      } catch (error) {
        console.warn('[Hero] Video autoplay prevented:', error);
      }
    };

    playVideo();
  }, [videoLoaded]);

  /**
   * Fallback Timeout - Se vídeo não carregar, mostra conteúdo mesmo assim
   */
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (!hasNotified.current) {
        hasNotified.current = true;
        setVideoLoaded(true);
        onVideosLoaded?.();
      }
    }, 3000);

    return () => clearTimeout(fallbackTimer);
  }, [onVideosLoaded]);

  return (
    <section 
      ref={containerRef}
      data-hero
      className={`relative isolate w-full overflow-hidden bg-black text-white transition-all duration-[900ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-full"
      }`}
    >
      {/* Vídeo de Fundo - Otimizado (1 vídeo, lazy loading) */}
      <div
        className={`absolute inset-0 z-0 pointer-events-none overflow-hidden transition-opacity duration-700 ease-out ${
          videoLoaded ? "opacity-80" : "opacity-0"
        }`}
      >
        {shouldLoadVideo && (
          <video
            ref={videoRef}
            className="w-full h-full object-cover object-center"
            muted
            playsInline
            loop
            preload="none"
            aria-hidden="true"
            onCanPlay={handleVideoCanPlay}
          >
            <source src="/binary.mp4" type="video/mp4" />
          </video>
        )}

        {/* Gradient overlay */}
        <div 
          className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60"
          aria-hidden="true"
        />
      </div>

      {/* Conteúdo - Crítico (sempre visível) */}
      <div className="relative z-20 container mx-auto px-4 py-px">
        <div className="relative pb-[5px] md:pb-[6px]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-1 md:gap-0 mb-1">
            
            {/* Command Lines - Esquerda */}
            <div className="flex-1 flex justify-center md:justify-start md:-mr-6 lg:-mr-12 xl:-mr-16 order-1 md:order-1">
              <span
                className="glitch text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight text-white font-mono whitespace-nowrap"
                data-text="Command Lines"
              >
                Command Lines
              </span>
            </div>

            {/* Imagem das stacks - Centro */}
            <div className="flex-shrink-0 flex items-center justify-center order-first md:order-2">
              <img
                src={stacksImg}
                alt="Tech Stack Icons - Adobe Premiere, VS Code, After Effects"
                className="w-full h-auto max-w-[120px] sm:max-w-[140px] md:max-w-[180px] lg:max-w-[220px] xl:max-w-[280px] object-contain select-none pointer-events-none"
                loading="eager"
                decoding="async"
                width="308"
                height="auto"
              />
            </div>

            {/* Timelines - Direita */}
            <div className="flex-1 flex justify-center md:justify-end md:-ml-8 lg:-ml-20 xl:-ml-28 order-2 md:order-3">
              <span
                className="glitch text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight text-white font-mono whitespace-nowrap"
                data-text="Timelines"
              >
                Timelines
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Indicator */}
      {!videoLoaded && shouldLoadVideo && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}
    </section>
  );
}

import { useEffect, useRef, useCallback, useState } from "react";
import stacksImgRaw from "@/assets/optimized/stacks.webp";

const stacksImg = stacksImgRaw as unknown as string;

// URL do vídeo (ajuste se necessário)
const BINARY_VIDEO_URL = "/binary.mp4";
const VIDEO_POSTER_URL = "/frames/video-poster.jpg"; // Fallback image

interface HeroProps {
  onVideosLoaded?: () => void;
  isVisible?: boolean;
}

export function Hero({ onVideosLoaded, isVisible = true }: HeroProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const hasNotified = useRef(false);

  /**
   * ========================================
   * INTERSECTION OBSERVER
   * Detecta quando Hero está visível
   * ========================================
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
   * ========================================
   * VIDEO LOADING HANDLER
   * ========================================
   */
  const handleVideoCanPlay = useCallback(() => {
    setVideoLoaded(true);
    
    if (!hasNotified.current) {
      hasNotified.current = true;
      onVideosLoaded?.();
    }
  }, [onVideosLoaded]);

  /**
   * ========================================
   * VIDEO ERROR HANDLER
   * ========================================
   */
  const handleVideoError = useCallback((_e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    setVideoError(true);
    
    // Notifica mesmo com erro para não travar a UI
    if (!hasNotified.current) {
      hasNotified.current = true;
      onVideosLoaded?.();
    }
  }, [onVideosLoaded]);

  /**
   * ========================================
   * VIDEO PLAYBACK
   * Garante que vídeo toque automaticamente
   * ========================================
   */
  useEffect(() => {
    if (!videoRef.current || !videoLoaded || videoError) return;

    const video = videoRef.current;
    
    const playVideo = async () => {
      try {
        video.muted = true;
        video.playsInline = true;
        video.loop = true;
        
        await video.play();
      } catch {
        // Tenta reproduzir no próximo click do usuário
        const playOnInteraction = () => {
          video.play().catch(() => {});
          document.removeEventListener('click', playOnInteraction);
        };
        document.addEventListener('click', playOnInteraction);
      }
    };

    playVideo();
  }, [videoLoaded, videoError]);

  /**
   * ========================================
   * FALLBACK TIMEOUT
   * Se vídeo não carregar em 3s, notifica mesmo assim
   * ========================================
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
      style={{ minHeight: 'clamp(200px, 30vh, 400px)' }}
    >
      {/* ========================================
          VÍDEO DE FUNDO OU GRADIENT FALLBACK
          ======================================== */}
      <div
        className={`absolute inset-0 z-0 pointer-events-none overflow-hidden transition-opacity duration-700 ease-out ${
          videoLoaded && !videoError ? "opacity-80" : "opacity-0"
        }`}
      >
        {shouldLoadVideo && !videoError && (
          <video
            ref={videoRef}
            className="w-full h-full object-cover object-center"
            muted
            playsInline
            loop
            preload="auto"
            poster={VIDEO_POSTER_URL}
            aria-hidden="true"
            onCanPlay={handleVideoCanPlay}
            onError={handleVideoError}
            onLoadedData={() => {}}
          >
            <source src={BINARY_VIDEO_URL} type="video/mp4" />
            Seu navegador não suporta vídeo HTML5.
          </video>
        )}
      </div>

      {/* Gradient de fundo (sempre presente como fallback) */}
      <div 
        className={`absolute inset-0 z-[1] pointer-events-none transition-opacity duration-1000 ${
          videoLoaded && !videoError ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          background: 'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.3) 0%, rgba(6, 182, 212, 0.2) 50%, rgba(0, 0, 0, 1) 100%)'
        }}
      />

      {/* Overlay para melhor legibilidade */}
      <div 
        className="absolute inset-0 z-[2] bg-gradient-to-b from-black/40 via-transparent to-black/60"
        aria-hidden="true"
      />

      {/* ========================================
          CONTEÚDO - CRÍTICO (SEMPRE VISÍVEL)
          ======================================== */}
      <div className="relative z-20 container mx-auto px-4 py-6 md:py-8">
        <div className="relative">
          
          {/* Linha principal com logo e textos */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
            
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
                alt="Tech Stack - Adobe Premiere, VS Code, After Effects"
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

      {/* ========================================
          LOADING INDICATOR
          Mostra enquanto vídeo carrega
          ======================================== */}
      {!videoLoaded && shouldLoadVideo && !videoError && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
            <p className="text-cyan-400 text-sm font-mono">Carregando vídeo...</p>
          </div>
        </div>
      )}

      {/* ========================================
          ERROR MESSAGE (DEBUG)
          ======================================== */}
      {videoError && (
        <div className="absolute bottom-4 right-4 z-30 bg-red-900/80 backdrop-blur-sm border border-red-500 rounded px-3 py-2 text-xs font-mono text-red-200">
          <span>⚠️ Vídeo não disponível - usando fallback</span>
        </div>
      )}
    </section>
  );
}

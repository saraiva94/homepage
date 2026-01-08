import { useEffect, useRef, useCallback, useState } from "react";
import binary from "@/assets/binary.mp4";
import stacksImgRaw from "@/assets/stacks.png";

const stacksImg = stacksImgRaw as unknown as string;

interface HeroProps {
  onVideosLoaded?: () => void;
  isVisible?: boolean;
}

export function Hero({ onVideosLoaded, isVisible = true }: HeroProps) {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [loadedCount, setLoadedCount] = useState(0);
  const hasNotified = useRef(false);

  // Todos os 4 vídeos prontos → mostra o conteúdo com fade
  const allVideosReady = loadedCount >= 4;

  const handleVideoCanPlay = useCallback(() => {
    setLoadedCount((prev) => prev + 1);
  }, []);

  // Notifica quando todos os 4 vídeos estão carregados
  useEffect(() => {
    if (allVideosReady && !hasNotified.current) {
      hasNotified.current = true;
      onVideosLoaded?.();
    }
  }, [allVideosReady, onVideosLoaded]);

  const syncAndPlay = useCallback(() => {
    const videos = videoRefs.current.filter(Boolean) as HTMLVideoElement[];
    if (videos.length === 0) return;

    const master = videos[0];
    
    const playAll = () => {
      videos.forEach((v) => {
        v.muted = true;
        v.playsInline = true;
        v.loop = true;
        if (v !== master) {
          v.currentTime = master.currentTime;
        }
        v.play().catch(() => {});
      });
    };

    if (master.readyState >= 2) {
      playAll();
    } else {
      master.addEventListener("canplay", playAll, { once: true });
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(syncAndPlay, 100);
    return () => clearTimeout(t);
  }, [syncAndPlay]);

  const setVideoRef = (index: number) => (el: HTMLVideoElement | null) => {
    videoRefs.current[index] = el;
  };

  return (
    <section 
      data-hero
      className={`relative isolate w-full overflow-hidden bg-black text-white transition-all duration-[900ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-full"
      }`}
    >
      {/* Vídeo de fundo - grid duplicado otimizado */}
      <div
        className={`absolute inset-0 z-0 pointer-events-none overflow-hidden grid grid-cols-2 grid-rows-2 transition-opacity duration-700 ease-out ${
          allVideosReady ? "opacity-80" : "opacity-0"
        }`}
      >
        {[0, 1, 2, 3].map((index) => (
          <video
            key={index}
            ref={setVideoRef(index)}
            className="w-full h-full object-cover object-center"
            muted
            playsInline
            loop
            preload="auto"
            aria-hidden="true"
            onCanPlay={handleVideoCanPlay}
          >
            <source src={binary} type="video/mp4" />
          </video>
        ))}
      </div>

      {/* Conteúdo - aparece instantaneamente */}
      <div className="relative z-20 container mx-auto px-4 py-px">
        <div className="relative pb-[5px] md:pb-[6px]">
          {/* Linha principal */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-1 md:gap-0 mb-1">
            {/* Command Lines - Esquerda */}
            <div className="flex-1 flex justify-center md:justify-start md:-mr-8 lg:-mr-16 xl:-mr-20 order-1 md:order-1">
              <span
                className="glitch text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight text-white font-mono whitespace-nowrap"
                data-text="Command Lines"
              >
                Command Lines
              </span>
            </div>

            {/* Imagem das stacks - Centro */}
            <div className="flex-shrink-0 flex items-center justify-center order-first md:order-2">
              <img
                src={stacksImg}
                alt="Stacks"
                className="w-full h-auto max-w-[140px] sm:max-w-[160px] md:max-w-[200px] lg:max-w-[250px] xl:max-w-[308px] object-contain select-none pointer-events-none"
              />
            </div>

            {/* Timelines - Direita */}
            <div className="flex-1 flex justify-center md:justify-end md:-ml-12 lg:-ml-28 xl:-ml-36 order-2 md:order-3">
              <span
                className="glitch text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight text-white font-mono whitespace-nowrap"
                data-text="Timelines"
              >
                Timelines
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

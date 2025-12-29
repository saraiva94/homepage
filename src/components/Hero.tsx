import { useEffect, useRef, useCallback } from "react";
import binary from "@/assets/binary.mp4";
import stacksImgRaw from "@/assets/stacks.png";

const stacksImg = stacksImgRaw as unknown as string;

export function Hero() {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const syncAndPlay = useCallback(() => {
    const videos = videoRefs.current.filter(Boolean) as HTMLVideoElement[];
    if (videos.length === 0) return;

    // Use the first video as master
    const master = videos[0];
    
    const playAll = () => {
      videos.forEach((v) => {
        v.muted = true;
        v.playsInline = true;
        v.loop = true;
        // Sync time with master
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
    // Small delay to ensure all refs are set
    const t = setTimeout(syncAndPlay, 100);
    return () => clearTimeout(t);
  }, [syncAndPlay]);

  const setVideoRef = (index: number) => (el: HTMLVideoElement | null) => {
    videoRefs.current[index] = el;
  };

  return (
    <section className="relative isolate overflow-hidden bg-black text-white">
      {/* Vídeo de fundo - grid duplicado otimizado */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden grid grid-cols-2 grid-rows-2">
        {[0, 1, 2, 3].map((index) => (
          <video
            key={index}
            ref={setVideoRef(index)}
            className="w-full h-full object-cover object-center opacity-80"
            muted
            playsInline
            loop
            preload={index === 0 ? "auto" : "metadata"}
            aria-hidden="true"
          >
            <source src={binary} type="video/mp4" />
          </video>
        ))}
      </div>

      {/* Conteúdo */}
      <div className="relative z-20 container mx-auto px-4 py-px">
        <div className="relative pb-[5px] md:pb-[6px]">
          {/* Linha principal */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-1">
            {/* Command Lines - Esquerda */}
            <div className="flex-1 flex justify-start md:-mr-16 lg:-mr-20">
              <span
                className="glitch text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-white font-mono"
                data-text="Command Lines"
              >
                Command Lines
              </span>
            </div>

            {/* Imagem das stacks - Centro */}
            <div className="flex-shrink-0 flex items-center justify-center">
              <img
                src={stacksImg}
                alt="Stacks"
                className="w-full h-auto max-w-[182px] md:max-w-[224px] lg:max-w-[266px] xl:max-w-[308px] object-contain select-none pointer-events-none"
              />
            </div>

            {/* Timelines - Direita */}
            <div className="flex-1 flex justify-end md:-ml-28 lg:-ml-36">
              <span
                className="glitch text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-white font-mono"
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

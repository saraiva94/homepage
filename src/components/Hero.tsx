import { useEffect, useRef } from "react";
import binary from "@/assets/binary.mp4";
import stacksImgRaw from "@/assets/stacks.png";

const stacksImg = stacksImgRaw as unknown as string;

export function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.playsInline = true;
    v.loop = true;
    const tryPlay = () => v.play().catch(() => {});
    if (v.readyState >= 2) tryPlay();
    else {
      v.addEventListener("canplay", tryPlay, { once: true });
      const t = setTimeout(tryPlay, 1200);
      return () => clearTimeout(t);
    }
  }, []);

  return (
    <section className="relative isolate overflow-hidden bg-black text-green-400">
      {/* Overlay escuro */}
      <div className="absolute inset-0 z-[1] bg-black/50 pointer-events-none" />
      {/* Vídeo de fundo - grid duplicado */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden grid grid-cols-2 grid-rows-2">
        <video
          ref={videoRef}
          className="w-full h-full object-cover object-center opacity-60"
          autoPlay
          muted
          playsInline
          loop
          preload="auto"
          aria-hidden="true"
        >
          <source src={binary} type="video/mp4" />
        </video>
        <video
          className="w-full h-full object-cover object-center opacity-60"
          autoPlay
          muted
          playsInline
          loop
          preload="auto"
          aria-hidden="true"
        >
          <source src={binary} type="video/mp4" />
        </video>
        <video
          className="w-full h-full object-cover object-center opacity-60"
          autoPlay
          muted
          playsInline
          loop
          preload="auto"
          aria-hidden="true"
        >
          <source src={binary} type="video/mp4" />
        </video>
        <video
          className="w-full h-full object-cover object-center opacity-60"
          autoPlay
          muted
          playsInline
          loop
          preload="auto"
          aria-hidden="true"
        >
          <source src={binary} type="video/mp4" />
        </video>
      </div>

      {/* Conteúdo */}
      <div className="relative z-20 container mx-auto px-4 py-px">
        <div className="relative pb-[5px] md:pb-[6px]">
          {/* Linha principal */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-1">
            {/* Command Lines - Esquerda */}
            <div className="flex-1 flex justify-start md:-mr-16 lg:-mr-20">
              <span
                className="glitch text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-green-400 font-mono"
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
                className="glitch text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-green-400 font-mono"
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
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
      {/* Vídeo de fundo */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover object-center opacity-[0.4] [transform:translateZ(0)] grayscale [filter:grayscale(100%)_brightness(1.2)_sepia(100%)_hue-rotate(70deg)_saturate(5)]"
          autoPlay
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
        >
          <source src={binary} type="video/mp4" />
        </video>
      </div>

      {/* Conteúdo */}
      <div className="relative z-20 container mx-auto px-4 py-6">
        <div className="relative pb-[32px] md:pb-[36px]">
          {/* Linha principal */}
          <div className="grid gap-4 lg:grid-cols-2 items-center mb-4">
            {/* Título */}
            <div>
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold leading-tight text-green-400">
                <span
                  className="glitch block whitespace-nowrap py-0.5 font-mono"
                  data-text="Command Lines"
                >
                  Command Lines
                </span>
                <span className="flex items-center">
                  <i aria-hidden className="w-24 sm:w-32 lg:w-40" />
                  <span
                    className="glitch block whitespace-nowrap py-0.5 font-mono"
                    data-text="Timelines"
                  >
                    Timelines
                  </span>
                </span>
              </h1>
            </div>

            {/* Imagem das stacks */}
            <div className="flex items-center justify-center">
              <img
                src={stacksImg}
                alt="Stacks"
                className="w-full h-auto max-w-[520px] md:max-w-[640px] lg:max-w-[760px] xl:max-w-[880px] object-contain select-none pointer-events-none"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
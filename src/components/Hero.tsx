import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import binary from "@/assets/binary.mp4";
import stacksImgRaw from "@/assets/stacks.png";
import { Clapperboard, Code2 } from "lucide-react";

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
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-10 text-green-400">
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

          {/* Barra fixa de botões colada na base da SECTION */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0">
            <div className="relative pointer-events-auto mx-0 px-4 h-[32px] md:h-[36px] pb-[16px] md:pb-[18px]">
              <div className="flex gap-3 items-end">
                <Link
                  to="/portfolio/edits"
                  className="
                    group h-10 flex items-center justify-center gap-2
                    px-3 rounded-md font-semibold text-sm
                    bg-green-900/80 hover:bg-green-700 active:bg-green-800
                    text-green-400 border border-green-500/30
                    focus-visible:outline-2 focus-visible:outline-green-500/50 focus-visible:outline-offset-2

                    transition-colors duration-300 ease-in-out
                    motion-safe:transition-transform motion-safe:duration-300
                    hover:-translate-y-0.5 hover:shadow-[0_0_15px_rgba(0,255,0,0.3)]
                  "
                >
                  <Clapperboard
                    className="
                      w-4 h-4
                      motion-safe:transition-transform motion-safe:duration-300
                      group-hover:scale-110 group-hover:-rotate-1
                    "
                  />
                  Portfólio Editor
                </Link>

                <Link
                  to="/portfolio/dev"
                  className="
                    group h-10 flex items-center justify-center gap-2
                    px-3 rounded-md font-semibold text-sm
                    bg-green-900/80 hover:bg-green-700 active:bg-green-800
                    text-green-400 border border-green-500/30
                    focus-visible:outline-2 focus-visible:outline-green-500/50 focus-visible:outline-offset-2

                    transition-colors duration-300 ease-in-out
                    motion-safe:transition-transform motion-safe:duration-300
                    hover:-translate-y-0.5 hover:shadow-[0_0_15px_rgba(0,255,0,0.3)]
                  "
                >
                  <Code2
                    className="
                      w-4 h-4
                      motion-safe:transition-transform motion-safe:duration-300
                      group-hover:scale-110 group-hover:-rotate-1
                    "
                  />
                  Portfólio Desenvolvedor
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
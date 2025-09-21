"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import binary from "../../../assets/binary.mp4";
import stacksImg from "../../../assets/stacks.png";
import { Clapperboard, Code2 } from "lucide-react"; 

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
    <section className="relative isolate overflow-hidden bg-[#6f00ff] text-white">
      {/* Vídeo de fundo (sem distorcer) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover object-center opacity-[0.25] [transform:translateZ(0)]"
          autoPlay
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
        >
          <source src={binary as unknown as string} type="video/mp4" />
        </video>
      </div>

      {/* Conteúdo */}
      <div className="relative z-20 container mx-auto px-4 py-12">
        {/* Wrapper relativo: reserva exatamente a altura da barra */}
        <div className="relative pb-[64px] md:pb-[72px]">
          {/* Linha principal */}
          <div className="grid gap-8 lg:grid-cols-2 items-center mb-8">
            {/* Título */}
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-10 [-webkit-text-stroke:1.1px_rgba(0,0,0,.5)] [text-shadow:0_2px_10px_rgba(0,0,0,.55),0_0_2px_rgba(0,0,0,.8)]">
                <span
                  className="glitch block whitespace-nowrap py-0.5 font-mono"
                  data-text="Command Lines"
                >
                  Command Lines
                </span>
                <span className="flex items-center">
                  <i aria-hidden className="w-24 sm:w-32 lg:w-40" />
                  <span
                    className="glitch block whitespace-nowrap py-0.5 font-mono [--glitch-cycle:3.2s]"
                    data-text="Timelines"
                  >
                    Timelines
                  </span>
                </span>
              </h1>
            </div>

            {/* Imagem das stacks */}
            <div className="flex items-center justify-center">
              <Image
                src={stacksImg}
                alt="Stacks"
                width={1600}
                height={800}
                className="w-full h-auto max-w-[520px] md:max-w-[640px] lg:max-w-[760px] xl:max-w-[880px] object-contain select-none pointer-events-none"
                priority
              />
            </div>
          </div>

          {/* Barra fixa de botões colada na base da SECTION */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0">
            <div className="relative pointer-events-auto mx-0 px-4 h-[64px] md:h-[72px] pb-[35px] md:pb-[35px]">
              <div className="flex gap-3 items-end">
                <a
                  href="#" className="h-13 flex items-center justify-center gap-2
                             px-4 rounded-md font-semibold
                             bg-[#001077] hover:bg-[#2563eb] active:bg-[#1d4ed8]
                             focus-visible:outline-2 focus-visible:outline-white/50 focus-visible:outline-offset-2"
                >
                  <Clapperboard className="w-5 h-5" />
                  Portfólio Editor
                </a>
                <a
                  href="#" className="h-13 flex items-center justify-center gap-2
                             px-4 rounded-md font-semibold
                             bg-[#001077] hover:bg-[#2563eb] active:bg-[#1d4ed8]
                             focus-visible:outline-2 focus-visible:outline-white/50 focus-visible:outline-offset-2"
                >
                  <Code2 className="w-5 h-5" />
                  Portfólio Desenvolvedor
                </a>
              </div>
            </div>
          </div>
          {/* /footer */}
        </div>
      </div>
    </section>
  );
}

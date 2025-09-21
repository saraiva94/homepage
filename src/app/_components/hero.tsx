"use client";

import { useEffect, useRef } from "react";
import { WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import binary from "../../../assets/binary.mp4";
import stacksImg from "../../../assets/stacks.png";

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
      {/* Vídeo de fundo */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <video
          ref={videoRef}
          className="w-full h-full object-cover object-center scale-[1.05] opacity-[0.25] [transform:translateZ(0)] pointer-events-none"
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
      <div className="relative z-20 container mx-auto py-16 px-4">
        <article className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Coluna de texto */}
          <div className="space-y-6">

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-10 [-webkit-text-stroke:1.1px_rgba(0,0,0,.5)] [text-shadow:0_2px_10px_rgba(0,0,0,.55),0_0_2px_rgba(0,0,0,.8)]">

              <span className="glitch block whitespace-nowrap py-0.5 font-mono" data-text="Command Lines">Command Lines</span> 
              <span className="flex items-center">
                
                <i aria-hidden className="w-28 sm:w-36 lg:w-40" /> {/* invisível */}
                <span className="glitch block whitespace-nowrap py-0.5 font-mono [--glitch-cycle:3.2s]" data-text="Timelines">Timelines</span>
              </span>
            </h1>
            <div className="mt-3 flex items-center justify-between gap-4">
              <a
                href="https://wa.me/5521969381944"
                className="bg-green-500 hover:bg-blue-600 px-5 py-2 rounded-md font-semibold inline-flex items-center gap-2 w-fit
                           outline-none focus-visible:outline-2 focus-visible:outline-ring/50 focus-visible:outline-offset-2"
              >
                <WhatsappLogo className="w-5 h-5" />
                Contato via Whatsapp
              </a>
              <Image
                src={stacksImg}
                alt="Stacks"
                width={1200}
                height={600}
                className="
                  h-auto object-contain select-none pointer-events-none
                  w-[clamp(140px,38vw,320px)]
                  lg:hidden
                "
                priority
              />
            </div>
          </div>
          <div className="hidden lg:flex items-center justify-center">
            <Image
              src={stacksImg}
              alt="Stacks"
              width={1600}
              height={800}
              className="
                w-full h-auto
                max-w-[520px] md:max-w-[640px] lg:max-w-[760px] xl:max-w-[880px]
                object-contain select-none pointer-events-none
              "
              priority
            />
          </div>
        </article>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import AOS from "aos";
import "aos/dist/aos.css";

gsap.registerPlugin(ScrollTrigger);

// ---------- CONFIG ----------

// Frames agora servidos de /public  →  /portifolio/background/sunset timeline/Neon sunset timeline000.jpg
const FRAME_START = 14;     // começa em 001
const FRAME_END   = 274;   // termina em 300
const FRAME_PAD   = 5;  
const TOTAL_FRAMES = FRAME_END - FRAME_START + 1;

const FRAMES_DIR = "/background/Ultimate_tubular";
const FRAME_BASENAME = "Ultimate_tubular_";
const FRAME_EXT = "jpg"; 

const frameURL = (idx0: number) => {
  const n = FRAME_START + idx0;
  const file = `${FRAME_BASENAME}${String(n).padStart(FRAME_PAD, "0")}.${FRAME_EXT}`;
  return encodeURI(`${FRAMES_DIR}/${file}`);
};

// ajuste aqui os vídeos que você colocou em /public/videos
const videos = [
  "coding.mp4",
  "coding.mp4",
  "coding.mp4",
  "coding.mp4",
  "coding.mp4",
  "coding.mp4",
  "coding.mp4",
  "coding.mp4",
];

export default function EditsPage() {
  const pinRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const imagesRef = useRef<HTMLImageElement[]>([]);
  const stateRef = useRef({ frame: 0, count: TOTAL_FRAMES });

  // ---- Lenis + sync ----
  useLayoutEffect(() => {
    const lenis = new Lenis({ smoothWheel: true, lerp: 0.12 });
    const raf = (t: number) => {
      lenis.raf(t);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
    lenis.on("scroll", ScrollTrigger.update);
    return () => (lenis as unknown as { destroy?: () => void }).destroy?.();
  }, []);

  // ---- AOS ----
  useEffect(() => {
    AOS.init({ once: true, duration: 700, easing: "ease-out-cubic" });
  }, []);

  // ---- Canvas DPR + cover ----
  const setupCanvas = () => {
    const canvas = canvasRef.current!;
    const ctx = (ctxRef.current ||= canvas.getContext("2d"));
    if (!ctx) return;

    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    canvas.width = Math.floor(vw * dpr);
    canvas.height = Math.floor(vh * dpr);
    canvas.style.width = `${vw}px`;
    canvas.style.height = `${vh}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const render = () => {
    const ctx = ctxRef.current!;
    const canvas = canvasRef.current!;
    const img = imagesRef.current[stateRef.current.frame];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    ctx.clearRect(0, 0, cw, ch);

    const canvasAspect = cw / ch;
    const imageAspect = img.naturalWidth / img.naturalHeight;

    let dw = cw,
      dh = ch,
      dx = 0,
      dy = 0;

    if (imageAspect > canvasAspect) {
      dh = ch;
      dw = dh * imageAspect;
      dx = (cw - dw) / 2;
    } else {
      dw = cw;
      dh = dw / imageAspect;
      dy = (ch - dh) / 2;
    }
    ctx.drawImage(img, dx, dy, dw, dh);
  };

  // ---- Preload a partir do /public ----
  useEffect(() => {
    const urls = Array.from({ length: TOTAL_FRAMES }, (_, i) => frameURL(i));
    imagesRef.current = new Array(urls.length);

    let remaining = urls.length;
    let first404Shown = false;

    for (let i = 0; i < urls.length; i++) {
      const img = new Image();
      img.decoding = "sync";
      img.src = urls[i];
      img.onload = img.onerror = () => {
        // debug simples para 404
        if (img.naturalWidth === 0 && !first404Shown) {
          first404Shown = true;
          console.warn("Algum frame retornou 404. Exemplo:", urls[i]);
        }
        remaining--;
        if (remaining === 0) {
          setupCanvas();
          stateRef.current.frame = 0;
          render();
          buildScroll();
        }
      };
      imagesRef.current[i] = img;
    }

    const onResize = () => {
      setupCanvas();
      render();
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- ScrollTrigger (frames + profundidade no header) ----
  function buildScroll() {
    const pin = pinRef.current!;
    const durationPx = window.innerHeight * 5; // 5 “rolagens” pinadas
    const header = headerRef.current;

    ScrollTrigger.create({
      trigger: pin,
      start: "top top",
      end: `+=${durationPx}`,
      scrub: 1,
      pin: true,
      pinSpacing: true,
      onUpdate: (self) => {
        const progress = self.progress;

        // frames (0..0.9 do range)
        const animProgress = Math.min(progress / 0.9, 1);
        const targetFrame = Math.round(animProgress * (stateRef.current.count - 1));
        if (targetFrame !== stateRef.current.frame) {
          stateRef.current.frame = targetFrame;
          render();
        }

        // header: 0..25% afasta em Z e fade-out
        if (header) {
          if (progress <= 0.25) {
            const zProgress = progress / 0.25;
            const translateZ = -800 * zProgress;
            let opacity = 1;
            if (progress > 0.2) opacity = 1 - (progress - 0.2) / 0.05; // 20%→25% some
            gsap.set(header, {
              transform: `translate(-50%,-50%) translateZ(${translateZ}px)`,
              opacity: Math.max(0, Math.min(1, opacity)),
            });
          } else {
            gsap.set(header, { opacity: 0 });
          }
        }
      },
    });
  }

  return (
    <main className="relative bg-black text-white">
      {/* bloco pinado com o canvas de fundo */}
      <div
        ref={pinRef}
        className="sticky top-0 h-screen w-screen z-50"
        style={{ perspective: "1200px" }}
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

        {/* header 3D da primeira rolagem */}
        <div
          ref={headerRef}
          className="absolute left-1/2 top-[12vh] -translate-x-1/2 -translate-y-1/2 text-center [transform-style:preserve-3d]"
          style={{ opacity: 1 }}
        >
          <Link href="/" className="inline-block mb-4 underline underline-offset-4">
            ← Voltar
          </Link>
          <h1 className="text-3xl md:text-5xl font-bold">Portfólio — Edits</h1>
          <p className="opacity-80 mt-2">Rolagem com profundidade (frames + canvas)</p>
        </div>
      </div>

      {/* Telas com AOS: somente players (sem “Apresentação”) */}
      {videos.map((name, idx) => (
        <section
          key={idx}
          className="h-screen flex items-center justify-center"
        >
          <div data-aos="zoom-in-down" className="w-[min(92vw,1000px)] px-6">
            <h3 className="text-xl font-semibold mb-3">Projeto {idx + 1}</h3>
            <video controls className="w-full rounded-2xl border border-white/10 shadow-2xl">
              <source src={`/videos/${name}`} type="video/mp4" />
            </video>
          </div>
        </section>
      ))}

      {/* Fechamento */}
      <section className="h-screen flex items-center justify-center">
        <div data-aos="zoom-in" className="w-[min(92vw,1000px)] px-6 text-center">
          <h3 className="text-xl font-semibold mb-3">Fechamento</h3>
          <p className="opacity-80 mb-4">Obrigado por rolar. Quer ver mais?</p>
          <Link
            href="/"
            className="inline-block rounded-md bg-white text-black px-4 py-2 font-semibold"
          >
            Voltar à Home
          </Link>
        </div>
      </section>
    </main>
  );
}

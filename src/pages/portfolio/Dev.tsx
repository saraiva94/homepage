import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

// ============= CONSTANTES CONFIGURÁVEIS (Ultimate_tubular) =============
const FRAME_START = 14;
const FRAME_END = 274;
const TOTAL_FRAMES = FRAME_END - FRAME_START + 1;

const FRAMES_DIR = "/background/Ultimate_tubular";
const FRAME_BASENAME = "Ultimate_tubular_";
const FRAME_EXT = "jpg";
const FRAME_PAD = 5;

// Scroll config
const HERO_SCROLL_SCREENS = 9; // Total de telas de scroll (1 hero + 8 videos)

// Perspective config
const PERSPECTIVE_PX = 1000;

// ============= HELPERS =============
const frameURL = (idx0: number): string => {
  const n = FRAME_START + idx0;
  const filename = `${FRAME_BASENAME}${String(n).padStart(FRAME_PAD, "0")}.${FRAME_EXT}`;
  return encodeURI(`${FRAMES_DIR}/${filename}`);
};

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

const videos = [
  "coding.mp4", "coding.mp4", "coding.mp4", "coding.mp4",
  "coding.mp4", "coding.mp4", "coding.mp4", "coding.mp4",
];

export default function DevPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const containerRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLDivElement | null)[]>([]);
  const endButtonRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const stateRef = useRef({ frame: 0, count: TOTAL_FRAMES });

  // ============= LENIS + SCROLLTRIGGER =============
  useEffect(() => {
    const lenis = new Lenis({ smoothWheel: true, lerp: 0.1 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    return () => {
      lenis.destroy();
      gsap.ticker.lagSmoothing(500, 33);
    };
  }, []);

  // ============= CANVAS SETUP =============
  const setupCanvas = (): void => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctxRef.current = ctx;

    // Usa o tamanho real renderizado (evita gaps/"faixa" por diferenças de vw/scrollbar)
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));

    // Desenha em CSS pixels
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  // ============= RENDER FRAME =============
  const render = (): void => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;

    const img = imagesRef.current[stateRef.current.frame];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    if (cw === 0 || ch === 0) return;

    ctx.clearRect(0, 0, cw, ch);

    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = cw / ch;

    let dw: number, dh: number, dx: number, dy: number;
    if (imgRatio > canvasRatio) {
      dh = ch;
      dw = dh * imgRatio;
      dx = (cw - dw) / 2;
      dy = 0;
    } else {
      dw = cw;
      dh = dw / imgRatio;
      dx = 0;
      dy = (ch - dh) / 2;
    }

    ctx.drawImage(img, dx, dy, dw, dh);
  };

  // ============= PRELOAD + INIT =============
  useEffect(() => {
    const urls = Array.from({ length: TOTAL_FRAMES }, (_, i) => frameURL(i));
    imagesRef.current = new Array(urls.length);
    let remaining = urls.length;

    for (let i = 0; i < urls.length; i++) {
      const img = new Image();
      img.decoding = "sync";
      img.src = urls[i];
      const onReady = () => {
        remaining--;
        if (remaining === 0) {
          console.log(`[Dev] Loaded ${TOTAL_FRAMES} frames`);
          setupCanvas();
          stateRef.current.frame = 0;
          render();
          initScroll();
        }
      };
      img.onload = onReady;
      img.onerror = () => { console.warn(`[Dev] Frame ${i} failed`); onReady(); };
      imagesRef.current[i] = img;
    }

    let resizeTimer: number;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        setupCanvas();
        render();
        ScrollTrigger.refresh();
      }, 150);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(resizeTimer);
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  // ============= SCROLLTRIGGER =============
  function initScroll(): void {
    const container = containerRef.current;
    if (!container) return;

    const totalVideos = videos.length;
    const scrollEnd = window.innerHeight * HERO_SCROLL_SCREENS;

    ScrollTrigger.create({
      trigger: container,
      start: "top top",
      end: `+=${scrollEnd}`,
      pin: true,
      pinSpacing: true,
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress;

        // ===== FRAMES =====
        const targetFrame = Math.round(progress * (stateRef.current.count - 1));
        if (targetFrame !== stateRef.current.frame) {
          stateRef.current.frame = targetFrame;
          render();
        }

        // ===== HEADER - fade out suave =====
        if (headerRef.current) {
          const headerFadeEnd = 0.12;
          const t = clamp01(progress / headerFadeEnd);
          const eased = 1 - Math.pow(1 - t, 3);
          const opacity = 1 - eased;
          gsap.set(headerRef.current, {
            transform: "translate(-50%, 0)",
            opacity,
            pointerEvents: opacity < 0.1 ? "none" : "auto",
          });
        }

        // ===== SCROLL HINT - desaparece descendo =====
        if (scrollHintRef.current) {
          const hintFadeEnd = 0.08;
          const hintProgress = clamp01(progress / hintFadeEnd);
          gsap.set(scrollHintRef.current, {
            opacity: 1 - hintProgress,
            y: hintProgress * 100,
          });
        }

        // ===== VIDEOS - entram de cima, saem para baixo =====
        const progressPerVideo = 1 / totalVideos;

        videoRefs.current.forEach((videoEl, idx) => {
          if (!videoEl) return;

          const videoStart = idx * progressPerVideo;
          const videoEnd = videoStart + progressPerVideo;
          const enterEnd = videoStart + progressPerVideo * 0.4; // entrada mais longa
          const exitStart = videoEnd - progressPerVideo * 0.3;

          if (progress < videoStart) {
            // Antes de entrar: escondido acima
            gsap.set(videoEl, { y: "-60%", opacity: 0, scale: 0.9 });
          } else if (progress >= videoStart && progress < enterEnd) {
            // Entrando: vem de cima para o centro
            const t = (progress - videoStart) / (enterEnd - videoStart);
            const eased = 1 - Math.pow(1 - t, 2); // ease-out suave
            gsap.set(videoEl, {
              y: `${-60 + eased * 60}%`, // -60% -> 0%
              opacity: eased,
              scale: 0.9 + eased * 0.1,
            });
          } else if (progress >= enterEnd && progress < exitStart) {
            // Visível no centro
            gsap.set(videoEl, { y: "0%", opacity: 1, scale: 1 });
          } else if (progress >= exitStart && progress <= videoEnd) {
            // Saindo: continua descendo
            const t = (progress - exitStart) / (videoEnd - exitStart);
            const eased = Math.pow(t, 2); // ease-in suave
            gsap.set(videoEl, {
              y: `${eased * 60}%`, // 0% -> 60%
              opacity: 1 - eased,
              scale: 1 - eased * 0.1,
            });
          } else {
            // Depois de sair: escondido abaixo
            gsap.set(videoEl, { y: "60%", opacity: 0, scale: 0.9 });
          }
        });

        // ===== BOTÃO HOMEPAGE - aparece quando último vídeo sai =====
        if (endButtonRef.current) {
          const buttonStart = 0.85;
          
          if (progress >= buttonStart) {
            const t = (progress - buttonStart) / (1 - buttonStart);
            const eased = 1 - Math.pow(1 - t, 3);
            gsap.set(endButtonRef.current, {
              opacity: eased,
              scale: 0.8 + eased * 0.2,
              pointerEvents: eased > 0.5 ? "auto" : "none",
            });
          } else {
            gsap.set(endButtonRef.current, { opacity: 0, scale: 0.8, pointerEvents: "none" });
          }
        }
      },
    });

    requestAnimationFrame(() => ScrollTrigger.refresh());
  }

  return (
    <main className="relative w-screen min-h-[100dvh] bg-black text-white overflow-hidden">
      {/* Container pinned */}
      <section
        ref={containerRef}
        className="relative w-screen h-[100dvh] overflow-hidden"
        style={{ perspective: `${PERSPECTIVE_PX}px` }}
      >
        {/* Canvas fullscreen */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full z-0 bg-black"
        />

        {/* Header - Botão Homepage */}
        <div
          ref={headerRef}
          className="absolute left-1/2 top-8 z-30"
          style={{ transform: "translate(-50%, 0)" }}
        >
          <Link
            to="/"
            className="relative px-6 py-3 text-base font-bold bg-white text-black rounded-full hover:bg-white/90 transition-all hover:scale-105 border border-sky-400/60 animate-glow-pulse"
            style={{
              boxShadow: "0 0 20px rgba(56, 189, 248, 0.5), 0 0 40px rgba(56, 189, 248, 0.3)",
            }}
          >
            Homepage
          </Link>
        </div>

        {/* Scroll instruction */}
        <div
          ref={scrollHintRef}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-3 pointer-events-none"
        >
          <span className="text-white text-base font-semibold tracking-wider uppercase px-6 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
            Role para ver o conteúdo
          </span>
          <svg
            className="w-8 h-8 text-white animate-bounce"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>

        {/* Videos - cada um em layer separado */}
        {videos.map((name, idx) => (
          <div
            key={idx}
            ref={(el) => {
              videoRefs.current[idx] = el;
            }}
            className="absolute inset-0 flex items-center justify-center z-20 px-4"
            style={{ transform: "translateY(100%)", opacity: 0 }}
          >
            <div className="w-full max-w-[1000px]">
              <video
                controls
                playsInline
                className="w-full aspect-video max-h-[80dvh] rounded-2xl border border-white/20 shadow-2xl object-contain"
              >
                <source src={`/videos/${name}`} type="video/mp4" />
              </video>
            </div>
          </div>
        ))}

        {/* Botão Homepage - aparece ao fim */}
        <div
          ref={endButtonRef}
          className="absolute inset-0 flex items-center justify-center z-30"
          style={{ opacity: 0, pointerEvents: "none" }}
        >
          <Link
            to="/"
            className="relative px-8 py-4 text-xl font-bold bg-white text-black rounded-full hover:bg-white/90 transition-all hover:scale-105 border border-sky-400/60 animate-glow-pulse pointer-events-auto"
            style={{
              boxShadow: "0 0 20px rgba(56, 189, 248, 0.5), 0 0 40px rgba(56, 189, 248, 0.3)",
            }}
          >
            Homepage
          </Link>
        </div>
      </section>
    </main>
  );
}

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

// Header config
const HEADER_FADE_END = 0.15;
const Z_HEADER_BACK = -600;
const PERSPECTIVE_PX = 1000;

// ============= HELPERS =============
const frameURL = (idx0: number): string => {
  const n = FRAME_START + idx0;
  const filename = `${FRAME_BASENAME}${String(n).padStart(FRAME_PAD, "0")}.${FRAME_EXT}`;
  return encodeURI(`${FRAMES_DIR}/${filename}`);
};

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

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

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    canvas.width = Math.floor(vw * dpr);
    canvas.height = Math.floor(vh * dpr);
    canvas.style.width = `${vw}px`;
    canvas.style.height = `${vh}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  // ============= RENDER FRAME =============
  const render = (): void => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;

    const img = imagesRef.current[stateRef.current.frame];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const cw = window.innerWidth;
    const ch = window.innerHeight;
    ctx.clearRect(0, 0, cw, ch);

    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = cw / ch;

    let dw: number, dh: number, dx: number, dy: number;
    if (imgRatio > canvasRatio) {
      dh = ch; dw = dh * imgRatio; dx = (cw - dw) / 2; dy = 0;
    } else {
      dw = cw; dh = dw / imgRatio; dx = 0; dy = (ch - dh) / 2;
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

        // ===== HEADER fade =====
        if (headerRef.current) {
          const headerProgress = clamp01(progress / HEADER_FADE_END);
          const z = lerp(0, Z_HEADER_BACK, headerProgress);
          const opacity = 1 - headerProgress;
          gsap.set(headerRef.current, {
            transform: `translate(-50%, 0) translateZ(${z}px)`,
            opacity: clamp01(opacity),
          });
        }

        // ===== VIDEOS - um por vez =====
        const progressPerVideo = 1 / totalVideos;

        videoRefs.current.forEach((videoEl, idx) => {
          if (!videoEl) return;

          const videoStart = idx * progressPerVideo;
          const videoEnd = videoStart + progressPerVideo;
          const enterEnd = videoStart + progressPerVideo * 0.25;
          const exitStart = videoEnd - progressPerVideo * 0.25;

          if (progress < videoStart) {
            gsap.set(videoEl, { y: "100%", opacity: 0, scale: 0.8 });
          } else if (progress >= videoStart && progress < enterEnd) {
            const t = (progress - videoStart) / (enterEnd - videoStart);
            const eased = 1 - Math.pow(1 - t, 3);
            gsap.set(videoEl, {
              y: `${100 - eased * 100}%`,
              opacity: eased,
              scale: 0.8 + eased * 0.2,
            });
          } else if (progress >= enterEnd && progress < exitStart) {
            gsap.set(videoEl, { y: "0%", opacity: 1, scale: 1 });
          } else if (progress >= exitStart && progress < videoEnd) {
            const t = (progress - exitStart) / (videoEnd - exitStart);
            const eased = Math.pow(t, 3);
            gsap.set(videoEl, {
              y: `${-eased * 100}%`,
              opacity: 1 - eased,
              scale: 1 - eased * 0.2,
            });
          } else {
            gsap.set(videoEl, { y: "-100%", opacity: 0, scale: 0.8 });
          }
        });
      },
    });

    requestAnimationFrame(() => ScrollTrigger.refresh());
  }

  return (
    <main className="relative bg-black text-white overflow-hidden">
      {/* Container pinned */}
      <section
        ref={containerRef}
        className="relative w-full h-[100dvh] overflow-hidden"
        style={{ perspective: `${PERSPECTIVE_PX}px` }}
      >
        {/* Canvas fullscreen */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full z-0 bg-black"
        />

        {/* Header */}
        <div
          ref={headerRef}
          className="absolute left-1/2 top-4 z-30"
          style={{ transform: "translate(-50%, 0)", transformStyle: "preserve-3d" }}
        >
          <Link
            to="/"
            className="inline-block rounded-md px-4 py-2 font-semibold border border-white bg-white text-black hover:bg-transparent hover:text-white transition"
          >
            ← Voltar
          </Link>
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
      </section>
    </main>
  );
}

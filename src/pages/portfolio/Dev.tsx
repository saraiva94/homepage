import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import AOS from "aos";
import "aos/dist/aos.css";

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
const FRAME_END_AT = 0.9; // Frames terminam em 90% do scroll

// Header animation config
const HEADER_Z_END = 0.25;
const HEADER_FADE_START = 0.2;
const HEADER_FADE_END = 0.25;
const Z_HEADER_BACK = -800;
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
  const headerRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const stateRef = useRef({ frame: 0, count: TOTAL_FRAMES });

  // ============= LENIS + SCROLLTRIGGER SYNC (OBRIGATÓRIO) =============
  useEffect(() => {
    const lenis = new Lenis({ smoothWheel: true, lerp: 0.12 });

    // CRÍTICO: Lenis scroll → ScrollTrigger.update()
    lenis.on("scroll", ScrollTrigger.update);

    // Conectar Lenis ao loop GSAP (ticker) - não usar RAF separado
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    // Desabilitar lag smoothing para sync consistente
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.lagSmoothing(500, 33);
    };
  }, []);

  useEffect(() => {
    AOS.init({ once: true, duration: 700, easing: "ease-out-cubic", offset: 200 });
  }, []);

  // ============= CANVAS SETUP (DPR correto) =============
  const setupCanvas = (): void => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctxRef.current = ctx;

    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    canvas.width = Math.floor(vw * dpr);
    canvas.height = Math.floor(vh * dpr);
    canvas.style.width = `${vw}px`;
    canvas.style.height = `${vh}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  // ============= RENDER FRAME (cover + centralizado) =============
  const render = (): void => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;

    const img = imagesRef.current[stateRef.current.frame];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const cw = window.innerWidth;
    const ch = window.innerHeight;
    ctx.clearRect(0, 0, cw, ch);

    const canvasAspect = cw / ch;
    const imageAspect = img.naturalWidth / img.naturalHeight;

    let dw = cw, dh = ch, dx = 0, dy = 0;

    if (imageAspect > canvasAspect) {
      dh = ch; dw = dh * imageAspect; dx = (cw - dw) / 2;
    } else {
      dw = cw; dh = dw / imageAspect; dy = (ch - dh) / 2;
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

      const onAssetReady = () => {
        remaining--;
        if (remaining === 0) {
          console.log(`[Dev] FRAME_COUNT: ${TOTAL_FRAMES}, imagesLoaded: true, firstFrameOk: ${imagesRef.current[0]?.complete}`);
          setupCanvas();
          stateRef.current.frame = 0;
          render();
          buildScroll();
        }
      };

      img.onload = onAssetReady;
      img.onerror = () => {
        console.warn(`[Dev] Frame ${i} falhou: ${urls[i]}`);
        onAssetReady();
      };

      imagesRef.current[i] = img;
    }

    // Resize handler com debounce
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
  function buildScroll(): void {
    const durationPx = document.body.scrollHeight - window.innerHeight;

    ScrollTrigger.create({
      trigger: "body",
      start: "top top",
      end: `+=${durationPx}`,
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress;

        // ===== FRAMES (0% → 90%) =====
        const frameProgress = Math.min(progress / FRAME_END_AT, 1);
        const targetFrame = Math.round(frameProgress * (stateRef.current.count - 1));
        if (targetFrame !== stateRef.current.frame) {
          stateRef.current.frame = targetFrame;
          render();
        }

        // ===== HEADER: Z recuo + fade =====
        if (headerRef.current) {
          const tZ = clamp01(progress / HEADER_Z_END);
          const z = lerp(0, Z_HEADER_BACK, tZ);

          let headerOpacity: number;
          if (progress < HEADER_FADE_START) {
            headerOpacity = 1;
          } else if (progress <= HEADER_FADE_END) {
            headerOpacity = 1 - (progress - HEADER_FADE_START) / (HEADER_FADE_END - HEADER_FADE_START);
          } else {
            headerOpacity = 0;
          }

          gsap.set(headerRef.current, {
            transform: `translate(-50%, -50%) translateZ(${z}px)`,
            opacity: clamp01(headerOpacity),
          });
        }
      },
    });

    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });
  }

  return (
    <main 
      className="relative bg-black text-white" 
      style={{ transformStyle: "preserve-3d", perspective: `${PERSPECTIVE_PX}px` }}
    >
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full z-0"
        style={{ pointerEvents: "none" }}
      />

      <div
        ref={headerRef}
        className="fixed left-1/2 top-[12vh] -translate-x-1/2 -translate-y-1/2 text-center z-10"
        style={{ 
          transformStyle: "preserve-3d",
          opacity: 1 
        }}
      >
        <Link 
          to="/" 
          className="inline-block mb-6 rounded-md px-4 py-2 font-semibold
            border border-white bg-white text-black
            hover:bg-transparent hover:text-white transition"
        >
          ← Voltar
        </Link>
      </div>

      {videos.map((name, idx) => (
        <section key={idx} className="h-screen flex items-center justify-center">
          <div data-aos="zoom-in" className="w-[min(92vw,1000px)] px-6">
            <video controls className="w-full rounded-2xl border border-white/10 shadow-2xl">
              <source src={`/videos/${name}`} type="video/mp4" />
            </video>
          </div>
        </section>
      ))}

      <section className="h-screen flex items-center justify-center">
        <div data-aos="zoom-in" className="w-[min(92vw,1000px)] px-6 text-center">
          <h3 className="text-xl font-semibold mb-3">Fechamento</h3>
          <p className="opacity-80 mb-4">Obrigado por rolar. Quer ver mais?</p>
          <div className="flex justify-center gap-4">
            <Link
              to="/"
              className="inline-block rounded-md bg-white text-black px-4 py-2 font-semibold"
            >
              Voltar à Home
            </Link>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="inline-block rounded-md bg-gray-700 text-white px-4 py-2 font-semibold"
            >
              Voltar ao Topo
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

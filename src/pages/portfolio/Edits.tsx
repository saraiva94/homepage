import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

// ============= CONSTANTES CONFIGURÁVEIS =============
// Frames config - MESMO DO Dev.tsx que funciona
const FRAME_START = 14;
const FRAME_END = 274;
const TOTAL_FRAMES = FRAME_END - FRAME_START + 1;

const FRAMES_DIR = "/background/Ultimate_tubular";
const FRAME_BASENAME = "Ultimate_tubular_";
const FRAME_EXT = "jpg";
const FRAME_PAD = 5;

// Scroll config
const HERO_SCROLL_SCREENS = 7; // Quantas telas de scroll para a seção hero
const FRAME_END_AT = 0.9; // Frames terminam em 90% do scroll

// Nav/Header fade config
// const NAV_FADE_END = 0.1; // Reservado para animação de nav
const HEADER_Z_END = 0.25;
const HEADER_FADE_START = 0.2;
const HEADER_FADE_END = 0.25;

// Dashboard/Video config
const DASH_START = 0.3;
const DASH_OPACITY_FULL = 0.5;
const DASH_END = 0.9;

// Z-depth config
const Z_HEADER_BACK = -800;
const PERSPECTIVE_PX = 1000;

// ============= HELPERS =============
// Gera URL do frame com padding de 5 dígitos
const frameURL = (idx0: number) => {
  const n = FRAME_START + idx0;
  const filename = `${FRAME_BASENAME}${String(n).padStart(FRAME_PAD, "0")}.${FRAME_EXT}`;
  return encodeURI(`${FRAMES_DIR}/${filename}`);
};

// Clamp entre 0 e 1
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

// Lerp linear
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const videos = ["Dieta_animal.mp4", "Groppaverso.mp4", "Propagandas.mp4"];

export default function EditsPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const stateRef = useRef({ frame: 0, count: TOTAL_FRAMES });

  // ============= LENIS SMOOTH SCROLL =============
  useEffect(() => {
    const lenis = new Lenis({ 
      smoothWheel: true, 
      lerp: 0.12 
    });
    
    // Integração Lenis + ScrollTrigger (OBRIGATÓRIO)
    lenis.on("scroll", ScrollTrigger.update);
    
    // GSAP ticker -> lenis.raf
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    
    // Desabilitar lag smoothing para sync perfeito
    gsap.ticker.lagSmoothing(0);
    
    return () => {
      lenis.destroy();
      gsap.ticker.lagSmoothing(500, 33);
    };
  }, []);

  // ============= CANVAS SETUP (DPR correto) =============
  const setupCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = (ctxRef.current ||= canvas.getContext("2d"));
    if (!ctx) return;

    // DPR limitado a 2 para performance
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Dimensões do canvas com DPR
    canvas.width = Math.floor(vw * dpr);
    canvas.height = Math.floor(vh * dpr);
    canvas.style.width = `${vw}px`;
    canvas.style.height = `${vh}px`;
    
    // CRÍTICO: setTransform para não acumular scale
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  // ============= RENDER FRAME (cover + centralizado) =============
  const render = () => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;

    const img = imagesRef.current[stateRef.current.frame];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    // Usar clientWidth/Height (CSS px, não canvas px)
    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    
    ctx.clearRect(0, 0, cw, ch);

    // Calcular aspect ratios para "cover"
    const canvasAspect = cw / ch;
    const imageAspect = img.naturalWidth / img.naturalHeight;

    let dw = cw, dh = ch, dx = 0, dy = 0;

    if (imageAspect > canvasAspect) {
      // Imagem mais larga - ajustar por altura
      dh = ch;
      dw = dh * imageAspect;
      dx = (cw - dw) / 2;
    } else {
      // Imagem mais alta - ajustar por largura
      dw = cw;
      dh = dw / imageAspect;
      dy = (ch - dh) / 2;
    }
    
    ctx.drawImage(img, dx, dy, dw, dh);
  };

  // ============= PRELOAD + INIT =============
  useEffect(() => {
    const urls = Array.from({ length: TOTAL_FRAMES }, (_, i) => frameURL(i));
    imagesRef.current = new Array(urls.length);

    let remaining = urls.length;

    // Preload robusto com onload/onerror
    for (let i = 0; i < urls.length; i++) {
      const img = new Image();
      img.decoding = "sync";
      img.src = urls[i];
      
      const onAssetReady = () => {
        remaining--;
        if (remaining === 0) {
          // Log de debug
          console.log(`[Edits] FRAME_COUNT: ${TOTAL_FRAMES}, imagesLoaded: true, firstFrameOk: ${imagesRef.current[0]?.complete}`);
          
          setupCanvas();
          stateRef.current.frame = 0;
          render();
          buildScroll();
        }
      };
      
      img.onload = onAssetReady;
      img.onerror = () => {
        console.warn(`[Edits] Frame ${i} falhou ao carregar: ${urls[i]}`);
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

  // ============= SCROLL TRIGGER =============
  function buildScroll() {
    const scrollEnd = window.innerHeight * HERO_SCROLL_SCREENS;

    ScrollTrigger.create({
      trigger: "body",
      start: "top top",
      end: `+=${scrollEnd}`,
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress;

        // ===== FRAMES - só redesenha quando muda =====
        const frameProgress = Math.min(progress / FRAME_END_AT, 1);
        const targetFrame = Math.floor(frameProgress * (stateRef.current.count - 1));
        
        if (targetFrame !== stateRef.current.frame) {
          stateRef.current.frame = targetFrame;
          render();
        }

        // ===== HEADER - Z + fade =====
        if (headerRef.current) {
          const tZ = clamp01(progress / HEADER_Z_END);
          const z = lerp(0, Z_HEADER_BACK, tZ);
          
          let headerOpacity = 1;
          if (progress < HEADER_FADE_START) {
            headerOpacity = 1;
          } else if (progress >= HEADER_FADE_START && progress < HEADER_FADE_END) {
            headerOpacity = lerp(1, 0, (progress - HEADER_FADE_START) / (HEADER_FADE_END - HEADER_FADE_START));
          } else {
            headerOpacity = 0;
          }
          
          gsap.set(headerRef.current, {
            transform: `translate(-50%, 0) translateZ(${z}px)`,
            opacity: Math.max(0, Math.min(1, headerOpacity)),
          });
        }

        // ===== VIDEO CONTAINER - entrada com depth =====
        if (videoContainerRef.current) {
          let videoOpacity = 0;
          let videoZ = 800;
          
          if (progress < DASH_START) {
            videoOpacity = 0;
            videoZ = 800;
          } else if (progress >= DASH_START && progress < DASH_OPACITY_FULL) {
            // Fade in
            const t = (progress - DASH_START) / (DASH_OPACITY_FULL - DASH_START);
            videoOpacity = t;
            videoZ = lerp(800, 200, t);
          } else if (progress >= DASH_OPACITY_FULL && progress < DASH_END) {
            // Fully visible, continue Z approach
            const t = (progress - DASH_OPACITY_FULL) / (DASH_END - DASH_OPACITY_FULL);
            videoOpacity = 1;
            videoZ = lerp(200, 0, t);
          } else {
            // Locked at end
            videoOpacity = 1;
            videoZ = 0;
          }
          
          gsap.set(videoContainerRef.current, {
            opacity: videoOpacity,
            transform: `translateZ(${videoZ}px)`,
          });
        }
      },
    });
    
    // Refresh após layout estável
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });
  }

  return (
    <main 
      className="relative bg-black text-white" 
      style={{ transformStyle: "preserve-3d", perspective: `${PERSPECTIVE_PX}px` }}
    >
      {/* Canvas fixo - background com sequência de frames */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full z-0"
        style={{ pointerEvents: "none" }}
      />

      {/* Header com botão voltar - animado com Z */}
      <div
        ref={headerRef}
        className="fixed left-1/2 top-8 -translate-x-1/2 text-center z-30"
        style={{ 
          transformStyle: "preserve-3d",
          opacity: 1 
        }}
      >
        <Link
          to="/"
          className="inline-block rounded-md px-4 py-2 font-semibold
            border border-white bg-white text-black
            hover:bg-transparent hover:text-white transition"
        >
          ← Voltar
        </Link>
      </div>

      {/* Container de vídeos - aparece com scroll */}
      <div
        ref={videoContainerRef}
        className="fixed inset-0 flex items-center justify-center z-20"
        style={{ 
          transformStyle: "preserve-3d",
          opacity: 0,
          pointerEvents: "auto"
        }}
      >
        <div className="w-[min(92vw,1000px)] px-6">
          <div className="space-y-8">
            {videos.map((name, idx) => (
              <video
                key={idx}
                controls
                className="w-full rounded-2xl border border-white/10 shadow-2xl"
              >
                <source src={`/videos/${name}`} type="video/mp4" />
              </video>
            ))}
            
            {/* Footer */}
            <div className="text-center pt-8">
              <h3 className="text-xl font-semibold mb-3">Quer ver mais?</h3>
              <p className="opacity-80 mb-4">Faça contato</p>
              <div className="flex justify-center gap-4">
                <Link
                  to="/"
                  className="inline-block rounded-md bg-white text-black px-4 py-2 font-semibold hover:bg-gray-100 transition"
                >
                  Voltar à Home
                </Link>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="inline-block rounded-md bg-gray-700 text-white px-4 py-2 font-semibold hover:bg-gray-600 transition"
                >
                  Início
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll spacer - cria área scrollável para ScrollTrigger */}
      <div 
        style={{ height: `${HERO_SCROLL_SCREENS * 100}vh` }} 
        aria-hidden="true" 
      />
    </main>
  );
}

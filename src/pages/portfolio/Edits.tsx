import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

// ============= CONSTANTES CONFIGURÁVEIS (sunset_timeline) =============
const FRAME_START = 1;
const FRAME_END = 300;
const TOTAL_FRAMES = FRAME_END - FRAME_START + 1;

const FRAMES_DIR = "/background/sunset_timeline";
const FRAME_BASENAME = "Neon_sunset_timeline";
const FRAME_EXT = "jpg";
const FRAME_PAD = 3; // 3 dígitos: 001, 002, ..., 300

// Scroll config
const HERO_SCROLL_SCREENS = 7; // 7x altura da tela para o scroll do hero
const FRAME_END_AT = 0.9; // Frames terminam em 90% do scroll

// Header animation config
const HEADER_Z_END = 0.25; // Header recua em Z até 25%
const HEADER_FADE_START = 0.2; // Header começa fade aos 20%
const HEADER_FADE_END = 0.25; // Header invisível aos 25%

// Dashboard/Video config
const DASH_START = 0.6; // Dashboard aparece aos 60%
const DASH_OPACITY_FULL = 0.8; // Opacidade chega a 1 aos 80%
const DASH_END = 0.9; // Dashboard termina aos 90%

// Z-depth config (valores em px)
const Z_HEADER_BACK = -500; // Header vai "para trás" (negativo)
const Z_DASH_START = 800; // Dashboard começa "na frente" (positivo)
const PERSPECTIVE_PX = 1000;

// ============= HELPERS =============
// Gera URL do frame com padding correto
const frameURL = (idx0: number): string => {
  const n = FRAME_START + idx0;
  const filename = `${FRAME_BASENAME}${String(n).padStart(FRAME_PAD, "0")}.${FRAME_EXT}`;
  return encodeURI(`${FRAMES_DIR}/${filename}`);
};

// Clamp entre 0 e 1
const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

// Interpolação linear
const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

const videos = ["Dieta_animal.mp4", "Groppaverso.mp4", "Propagandas.mp4"];

export default function EditsPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const heroRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const stateRef = useRef({ frame: 0, count: TOTAL_FRAMES });
  const lenisRef = useRef<Lenis | null>(null);

  // ============= LENIS SMOOTH SCROLL + SCROLLTRIGGER SYNC =============
  useEffect(() => {
    // Criar instância Lenis
    const lenis = new Lenis({
      smoothWheel: true,
      lerp: 0.1,
    });
    lenisRef.current = lenis;

    // CRÍTICO: Lenis scroll → ScrollTrigger.update()
    lenis.on("scroll", ScrollTrigger.update);

    // Conectar Lenis ao loop GSAP (ticker)
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    // Desabilitar lag smoothing para sync consistente
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      lenisRef.current = null;
      gsap.ticker.lagSmoothing(500, 33); // Restaurar default
    };
  }, []);

  // ============= CANVAS SETUP (DPR correto, sem acumular scale) =============
  const setupCanvas = (): void => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctxRef.current = ctx;

    // DPR limitado a 2 para performance
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Dimensões internas do canvas (resolução real)
    canvas.width = Math.floor(vw * dpr);
    canvas.height = Math.floor(vh * dpr);

    // Dimensões CSS (tamanho visual)
    canvas.style.width = `${vw}px`;
    canvas.style.height = `${vh}px`;

    // CRÍTICO: setTransform para não acumular scale em resizes
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  // ============= RENDER FRAME (cover + centralizado) =============
  const render = (): void => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;

    const img = imagesRef.current[stateRef.current.frame];
    // Validar que imagem está carregada
    if (!img || !img.complete || img.naturalWidth === 0) return;

    // Usar dimensões CSS (innerWidth/innerHeight) para consistência
    const cw = window.innerWidth;
    const ch = window.innerHeight;

    ctx.clearRect(0, 0, cw, ch);

    // Calcular aspect ratios para "cover"
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = cw / ch;

    let dw: number, dh: number, dx: number, dy: number;

    if (imgRatio > canvasRatio) {
      // Imagem mais larga que canvas - escalar pela altura, centralizar X
      dh = ch;
      dw = dh * imgRatio;
      dx = (cw - dw) / 2;
      dy = 0;
    } else {
      // Imagem mais alta que canvas - escalar pela largura, centralizar Y
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

    // Preload robusto com onload/onerror
    for (let i = 0; i < urls.length; i++) {
      const img = new Image();
      img.decoding = "sync";
      img.src = urls[i];

      const onAssetReady = () => {
        remaining--;
        if (remaining === 0) {
          // Log de debug para validação
          console.log(
            `[Edits] FRAME_COUNT: ${TOTAL_FRAMES}, imagesLoaded: true, firstFrameOk: ${imagesRef.current[0]?.complete}`
          );

          // Inicializar canvas e render primeiro frame
          setupCanvas();
          stateRef.current.frame = 0;
          render();

          // Inicializar ScrollTrigger APÓS preload completo
          initScroll();
        }
      };

      img.onload = onAssetReady;
      img.onerror = () => {
        console.warn(`[Edits] Frame ${i} falhou: ${urls[i]}`);
        onAssetReady(); // Continuar mesmo com erro
      };

      imagesRef.current[i] = img;
    }

    // Resize handler com debounce (150ms)
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
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  // ============= SCROLLTRIGGER: PIN + SCRUB + FRAME MAPPING =============
  function initScroll(): void {
    const hero = heroRef.current;
    if (!hero) return;

    const scrollEnd = window.innerHeight * HERO_SCROLL_SCREENS;

    ScrollTrigger.create({
      trigger: hero,
      start: "top top",
      end: `+=${scrollEnd}`,
      pin: true,
      pinSpacing: true,
      scrub: true,
      onUpdate: (self) => {
        const progress = self.progress; // 0..1

        // ===== FRAMES (0% → 90%) =====
        // Frames só até FRAME_END_AT (90%)
        const frameProgress = Math.min(progress / FRAME_END_AT, 1);
        const targetFrame = Math.floor(frameProgress * (stateRef.current.count - 1));

        // Só redesenhar se frame mudou (performance)
        if (targetFrame !== stateRef.current.frame) {
          stateRef.current.frame = targetFrame;
          render();
        }

        // ===== HEADER: Z recuo (0% → 25%) + fade (20% → 25%) =====
        if (headerRef.current) {
          // Z transform
          const tZ = clamp01(progress / HEADER_Z_END);
          const z = lerp(0, Z_HEADER_BACK, tZ);

          // Opacidade por faixas
          let headerOpacity: number;
          if (progress < HEADER_FADE_START) {
            headerOpacity = 1;
          } else if (progress <= HEADER_FADE_END) {
            headerOpacity = 1 - (progress - HEADER_FADE_START) / (HEADER_FADE_END - HEADER_FADE_START);
          } else {
            headerOpacity = 0;
          }

          gsap.set(headerRef.current, {
            transform: `translate(-50%, 0) translateZ(${z}px)`,
            opacity: clamp01(headerOpacity),
          });
        }

        // ===== DASHBOARD/VIDEOS: Z entrada (60% → 90%) + fade (60% → 80%) =====
        if (dashboardRef.current) {
          let dashOpacity: number;
          let dashZ: number;

          if (progress < DASH_START) {
            // Antes de 60%: invisível, Z no início
            dashOpacity = 0;
            dashZ = Z_DASH_START;
          } else if (progress <= DASH_END) {
            // Entre 60% e 90%
            const t = (progress - DASH_START) / (DASH_END - DASH_START); // 0..1
            dashZ = lerp(Z_DASH_START, 0, t);

            // Opacidade: 0→1 entre 60% e 80%
            if (progress <= DASH_OPACITY_FULL) {
              dashOpacity = (progress - DASH_START) / (DASH_OPACITY_FULL - DASH_START);
            } else {
              // Mantém 1 entre 80% e 90%
              dashOpacity = 1;
            }
          } else {
            // Após 90%: fixar valores finais
            dashOpacity = 1;
            dashZ = 0;
          }

          gsap.set(dashboardRef.current, {
            opacity: clamp01(dashOpacity),
            transform: `translateZ(${dashZ}px)`,
          });
        }

        // Debug logs para validação (remover em produção)
        // Uncomment to debug:
        // const checkPoints = [0, 0.1, 0.25, 0.6, 0.8, 0.9];
        // checkPoints.forEach(cp => {
        //   if (Math.abs(progress - cp) < 0.005) {
        //     console.log(`[Progress ${cp}] frame: ${stateRef.current.frame}, header: ${headerRef.current?.style.opacity}, dash: ${dashboardRef.current?.style.opacity}`);
        //   }
        // });
      },
    });

    // Refresh após layout estável
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });
  }

  return (
    <main className="relative bg-black text-white">
      {/* HERO SECTION - será pinned pelo ScrollTrigger */}
      <section
        ref={heroRef}
        className="relative h-screen w-full overflow-hidden"
        style={{ perspective: `${PERSPECTIVE_PX}px` }}
      >
        {/* Canvas full-screen - background com sequência de frames */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full z-0"
          style={{ pointerEvents: "none" }}
        />

        {/* HEADER - recua em Z e faz fade */}
        <div
          ref={headerRef}
          className="absolute left-1/2 top-8 -translate-x-1/2 z-30"
          style={{
            transformStyle: "preserve-3d",
            opacity: 1,
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

        {/* DASHBOARD/VIDEOS - entra com Z e fade */}
        <div
          ref={dashboardRef}
          className="absolute inset-0 flex items-center justify-center z-20"
          style={{
            transformStyle: "preserve-3d",
            opacity: 0,
            transform: `translateZ(${Z_DASH_START}px)`,
          }}
        >
          <div className="w-[min(92vw,1000px)] px-6 max-h-[80vh] overflow-y-auto">
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
              <div className="text-center pt-8 pb-4">
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
      </section>

      {/* OUTRO SECTION - para dar scroll após unpin */}
      <section className="h-screen flex items-center justify-center">
        <h1 className="text-2xl opacity-50">Fim do portfolio</h1>
      </section>
    </main>
  );
}

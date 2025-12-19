import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { supabase } from "@/integrations/backend/client";
import { FRAME_CONFIG } from "@/hooks/usePrefetchPortfolioFrames";
import { PortfolioQADebug } from "@/components/portfolio/PortfolioQADebug";

gsap.registerPlugin(ScrollTrigger);

// ============= CONSTANTES CONFIGURÁVEIS (Ultimate_tubular) =============
const CONFIG = FRAME_CONFIG.dev;
const FRAME_START = CONFIG.start;
const FRAME_END = 274;
const TOTAL_FRAMES = FRAME_END - FRAME_START + 1;

const PERSPECTIVE_PX = 1000;
const PRIORITY_FRAMES = 10;

// ============= HELPERS =============
const frameURL = (idx0: number): string => {
  const n = FRAME_START + idx0;
  const filename = `${CONFIG.basename}${String(n).padStart(CONFIG.pad, "0")}.${CONFIG.ext}`;
  return encodeURI(`${CONFIG.dir}/${filename}`);
};

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

interface Video {
  id: string;
  video_url: string;
  display_order: number;
}

export default function DevPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const containerRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLDivElement | null)[]>([]);
  const endButtonRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const stateRef = useRef({ frame: 0, count: TOTAL_FRAMES });
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const lenisRef = useRef<Lenis | null>(null);

  // Fetch videos from database
  useEffect(() => {
    const fetchVideos = async () => {
      const { data, error } = await supabase
        .from("portfolio_videos")
        .select("*")
        .eq("portfolio_type", "dev")
        .order("display_order");

      if (error) {
        console.error("Error fetching videos:", error);
      } else {
        setVideos(data || []);
      }
      setIsLoading(false);
    };

    fetchVideos();
  }, []);

  // ============= VIEWPORT SIZE (corrige zoom/dimensões em mobile/desktop) =============
  const getViewportSize = useCallback(() => {
    const vv = window.visualViewport;
    const width = Math.max(1, Math.round(vv?.width ?? window.innerWidth));
    const height = Math.max(1, Math.round(vv?.height ?? window.innerHeight));
    return { width, height };
  }, []);

  // ============= CANVAS SETUP (responsivo) =============
  const setupCanvas = useCallback((): void => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    ctxRef.current = ctx;

    const { width: cssWidth, height: cssHeight } = getViewportSize();
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    canvas.width = Math.floor(cssWidth * dpr);
    canvas.height = Math.floor(cssHeight * dpr);

    // coordenadas em CSS pixels
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
  }, [getViewportSize]);

  // ============= RENDER FRAME =============
  const render = useCallback((): void => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    const { width: cw, height: ch } = getViewportSize();

    // Sempre pinta o fundo, mesmo se o frame ainda não carregou
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, cw, ch);

    const img = imagesRef.current[stateRef.current.frame];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    // "cover" para preencher a tela (sem pillarboxing)
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = cw / ch;

    let dw: number, dh: number, dx: number, dy: number;
    if (imgRatio > canvasRatio) {
      // imagem mais larga: escala pela altura
      dh = ch;
      dw = dh * imgRatio;
      dx = (cw - dw) / 2;
      dy = 0;
    } else {
      // imagem mais alta: escala pela largura
      dw = cw;
      dh = dw / imgRatio;
      dx = 0;
      dy = (ch - dh) / 2;
    }

    ctx.drawImage(img, dx, dy, dw, dh);
  }, [getViewportSize]);

  // ============= SCROLLTRIGGER =============
  const initScroll = useCallback((): void => {
    const container = containerRef.current;
    if (!container) return;

    if (scrollTriggerRef.current) {
      scrollTriggerRef.current.kill();
    }

    const totalVideos = videos.length;
    if (totalVideos === 0) return;

    const heroScrollScreens = 1 + totalVideos + 0.5;
    const scrollEnd = window.innerHeight * heroScrollScreens;

    scrollTriggerRef.current = ScrollTrigger.create({
      trigger: container,
      start: "top top",
      end: `+=${scrollEnd}`,
      pin: true,
      pinSpacing: true,
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress;

        const targetFrame = Math.round(progress * (stateRef.current.count - 1));
        if (targetFrame !== stateRef.current.frame) {
          stateRef.current.frame = targetFrame;
          render();
        }

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

        if (scrollHintRef.current) {
          const hintFadeEnd = 0.08;
          const hintProgress = clamp01(progress / hintFadeEnd);
          gsap.set(scrollHintRef.current, {
            opacity: 1 - hintProgress,
            y: hintProgress * 100,
          });
        }

        const progressPerVideo = 1 / totalVideos;

        videoRefs.current.forEach((videoEl, idx) => {
          if (!videoEl || idx >= totalVideos) return;

          const isLastVideo = idx === totalVideos - 1;
          const videoStart = idx * progressPerVideo;
          const videoEnd = isLastVideo ? 0.95 : videoStart + progressPerVideo;
          const enterEnd = videoStart + progressPerVideo * 0.4;
          const exitStart = isLastVideo 
            ? videoEnd - (videoEnd - enterEnd) * 0.5 
            : videoEnd - progressPerVideo * 0.35;

          if (progress < videoStart) {
            gsap.set(videoEl, { y: "-60%", opacity: 0, scale: 0.3 });
          } else if (progress >= videoStart && progress < enterEnd) {
            const t = (progress - videoStart) / (enterEnd - videoStart);
            const eased = 1 - Math.pow(1 - t, 2);
            gsap.set(videoEl, {
              y: `${-60 + eased * 60}%`,
              opacity: eased,
              scale: 0.3 + eased * 0.7,
            });
          } else if (progress >= enterEnd && progress < exitStart) {
            gsap.set(videoEl, { y: "0%", opacity: 1, scale: 1 });
          } else if (progress >= exitStart && progress <= videoEnd) {
            const t = (progress - exitStart) / (videoEnd - exitStart);
            const eased = Math.pow(t, 2);
            gsap.set(videoEl, {
              y: `${eased * 60}%`,
              opacity: 1 - eased,
              scale: 1 + eased * 0.8,
            });
          } else {
            gsap.set(videoEl, { y: "60%", opacity: 0, scale: 1.8 });
          }
        });

        if (endButtonRef.current) {
          const buttonStart = 0.95;
          
          if (progress >= buttonStart) {
            const t = (progress - buttonStart) / (1 - buttonStart);
            const eased = 1 - Math.pow(1 - t, 2);
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
  }, [videos.length, render]);

  // ============= LENIS SETUP =============
  useEffect(() => {
    if (!isReady) return;

    const lenis = new Lenis({ smoothWheel: true, lerp: 0.1 });
    lenisRef.current = lenis;
    
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    
    return () => {
      lenis.destroy();
      lenisRef.current = null;
      gsap.ticker.lagSmoothing(500, 33);
    };
  }, [isReady]);

  // ============= PRELOAD =============
  useEffect(() => {
    if (isLoading) return;

    const urls = Array.from({ length: TOTAL_FRAMES }, (_, i) => frameURL(i));
    imagesRef.current = new Array(urls.length);

    let loadedCount = 0;
    let firstSuccessfulUrl: string | null = null;
    let firstErrorUrl: string | null = null;

    const loadImage = (index: number): Promise<boolean> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.decoding = "async";

        const url = urls[index];

        const onComplete = (ok: boolean) => {
          loadedCount++;
          setLoadProgress(Math.round((loadedCount / urls.length) * 100));
          resolve(ok);
        };

        img.onload = () => {
          if (!firstSuccessfulUrl) firstSuccessfulUrl = url;
          onComplete(true);
        };
        img.onerror = () => {
          if (!firstErrorUrl) firstErrorUrl = url;
          onComplete(false);
        };

        imagesRef.current[index] = img;
        img.src = url;
      });
    };

    // Carregar frames prioritários primeiro
    const priorityPromises = urls.slice(0, PRIORITY_FRAMES).map((_, i) => loadImage(i));

    Promise.all(priorityPromises).then((results) => {
      const hasAtLeastOneFrame = results.some(Boolean);

      setupCanvas();
      stateRef.current.frame = 0;
      render();

      if (!hasAtLeastOneFrame) {
        setLoadError(firstErrorUrl ?? urls[0]);
        return;
      }

      setIsReady(true);
      setTimeout(() => initScroll(), 100);

      // Carregar resto em batches
      const BATCH_SIZE = 20;
      let currentBatch = PRIORITY_FRAMES;

      const loadNextBatch = () => {
        const batch = [];
        for (let i = 0; i < BATCH_SIZE && currentBatch < urls.length; i++, currentBatch++) {
          batch.push(loadImage(currentBatch));
        }

        if (batch.length > 0) {
          Promise.all(batch).then(() => setTimeout(loadNextBatch, 16));
        }
      };

      loadNextBatch();

      // QA: um refresh depois do primeiro paint e outro após a primeira onda de assets
      requestAnimationFrame(() => ScrollTrigger.refresh());
      setTimeout(() => ScrollTrigger.refresh(), 600);
    });

    const onResize = () => {
      setupCanvas();
      render();
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      if (scrollTriggerRef.current) scrollTriggerRef.current.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [isLoading, setupCanvas, render, initScroll]);

  // Loading state
  if (isLoading || !isReady) {
    if (loadError) {
      return (
        <div className="fixed inset-0 bg-black flex flex-col items-center justify-center gap-4 z-50 p-6 text-center">
          <div className="text-white text-lg font-semibold">Portfólio não carregou (frames)</div>
          <div className="text-white/60 text-sm max-w-[680px] break-all">
            Primeiro frame falhou ao carregar: {loadError}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="px-6 py-3 text-base font-bold bg-white text-black rounded-full hover:bg-white/90 transition-all"
              onClick={() => window.location.reload()}
            >
              Recarregar
            </button>
            <Link
              to="/"
              className="px-6 py-3 text-base font-bold bg-white/10 text-white rounded-full hover:bg-white/15 transition-all border border-white/20"
            >
              Voltar
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/30 via-blue-900/20 to-purple-900/30 animate-pulse" />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-white rounded-full transition-all duration-300"
              style={{ width: `${loadProgress}%` }}
            />
          </div>
          <span className="text-white/50 text-sm">{loadProgress}%</span>
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center gap-6">
        <div className="text-white text-xl">Nenhum vídeo disponível</div>
        <Link
          to="/"
          className="px-6 py-3 text-base font-bold bg-white text-black rounded-full hover:bg-white/90 transition-all hover:scale-105"
        >
          Voltar para Homepage
        </Link>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden">
      <PortfolioQADebug
        name="dev"
        isReady={isReady}
        isLoading={isLoading}
        loadProgress={loadProgress}
        frame={stateRef.current.frame}
        totalFrames={TOTAL_FRAMES}
        videosCount={videos.length}
        canvasEl={canvasRef.current}
        containerEl={containerRef.current}
      />

      {/* Canvas fora do container do ScrollTrigger para evitar escala/transform do pin */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 bg-black"
        style={{ width: "100vw", height: "100vh", display: "block" }}
      />

      <section
        ref={containerRef}
        className="absolute inset-0 overflow-hidden"
        style={{ perspective: `${PERSPECTIVE_PX}px` }}
      >
        <div
          ref={headerRef}
          className="absolute left-1/2 top-4 sm:top-8 z-30"
          style={{ transform: "translate(-50%, 0)" }}
        >
          <Link
            to="/"
            className="relative px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base font-bold bg-white text-black rounded-full hover:bg-white/90 transition-all hover:scale-105 border border-sky-400/60 animate-glow-pulse"
            style={{
              boxShadow: "0 0 20px rgba(56, 189, 248, 0.5), 0 0 40px rgba(56, 189, 248, 0.3)",
            }}
          >
            Homepage
          </Link>
        </div>

        <div
          ref={scrollHintRef}
          className="absolute bottom-8 sm:bottom-12 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 sm:gap-3 pointer-events-none"
        >
          <span className="text-white text-xs sm:text-base font-semibold tracking-wider uppercase px-4 py-1.5 sm:px-6 sm:py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
            Role para ver o conteúdo
          </span>
          <svg
            className="w-6 h-6 sm:w-8 sm:h-8 text-white animate-bounce"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>

        {videos.map((video, idx) => (
          <div
            key={video.id}
            ref={(el) => {
              videoRefs.current[idx] = el;
            }}
            className="absolute inset-0 flex items-center justify-center z-20 p-4"
            style={{ transform: "translateY(100%)", opacity: 0 }}
          >
            <div className="w-full max-w-[90vw] sm:max-w-[80vw] lg:max-w-[1000px]">
              <video
                controls
                playsInline
                preload="metadata"
                className="w-full aspect-video rounded-xl sm:rounded-2xl border border-white/20 shadow-2xl object-contain"
              >
                <source src={video.video_url} type="video/mp4" />
              </video>
            </div>
          </div>
        ))}

        <div
          ref={endButtonRef}
          className="absolute inset-0 flex items-center justify-center z-30"
          style={{ opacity: 0, pointerEvents: "none" }}
        >
          <Link
            to="/"
            className="relative px-6 py-3 sm:px-8 sm:py-4 text-lg sm:text-xl font-bold bg-white text-black rounded-full hover:bg-white/90 transition-all hover:scale-105 border border-sky-400/60 animate-glow-pulse pointer-events-auto"
            style={{
              boxShadow: "0 0 20px rgba(56, 189, 248, 0.5), 0 0 40px rgba(56, 189, 248, 0.3)",
            }}
          >
            Homepage
          </Link>
        </div>
      </section>
    </div>
  );
}

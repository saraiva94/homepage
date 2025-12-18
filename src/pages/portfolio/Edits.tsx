import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { supabase } from "@/integrations/backend/client";
import { FRAME_CONFIG } from "@/hooks/usePrefetchPortfolioFrames";

gsap.registerPlugin(ScrollTrigger);

// ============= CONSTANTES CONFIGURÁVEIS (sunset_timeline) =============
const CONFIG = FRAME_CONFIG.editor;
const FRAME_START = CONFIG.start;
const FRAME_END = 300;
const TOTAL_FRAMES = FRAME_END - FRAME_START + 1;

const PERSPECTIVE_PX = 1000;

// Performance: Carregar primeiros frames rapidamente para primeira pintura
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

export default function EditsPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  
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
        .eq("portfolio_type", "editor")
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

  // ============= CANVAS SETUP =============
  const setupCanvas = useCallback((): void => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;
    ctxRef.current = ctx;

    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, []);

  // ============= RENDER FRAME =============
  const render = useCallback((): void => {
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
  }, []);

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

        const videoScrollEnd = 0.9;
        const progressPerVideo = videoScrollEnd / totalVideos;

        videoRefs.current.forEach((videoEl, idx) => {
          if (!videoEl || idx >= totalVideos) return;

          const videoStart = idx * progressPerVideo;
          const videoEnd = videoStart + progressPerVideo;
          const enterEnd = videoStart + progressPerVideo * 0.35;
          const exitStart = videoEnd - progressPerVideo * 0.35;

          if (progress < videoStart) {
            gsap.set(videoEl, { opacity: 0, scale: 0.4, y: "0%" });
          } else if (progress >= videoStart && progress < enterEnd) {
            const t = (progress - videoStart) / (enterEnd - videoStart);
            const eased = 1 - Math.pow(1 - t, 3);
            gsap.set(videoEl, {
              opacity: eased,
              scale: 0.4 + eased * 0.6,
              y: "0%",
            });
          } else if (progress >= enterEnd && progress < exitStart) {
            gsap.set(videoEl, { opacity: 1, scale: 1, y: "0%" });
          } else if (progress >= exitStart && progress <= videoEnd) {
            const t = (progress - exitStart) / (videoEnd - exitStart);
            const eased = Math.pow(t, 2);
            gsap.set(videoEl, {
              opacity: 1 - eased,
              scale: 1 + eased * 0.6,
              y: "0%",
            });
          } else {
            gsap.set(videoEl, { opacity: 0, scale: 1.6, y: "0%" });
          }
        });

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

  // ============= PRELOAD OTIMIZADO =============
  useEffect(() => {
    if (isLoading) return;

    const urls = Array.from({ length: TOTAL_FRAMES }, (_, i) => frameURL(i));
    imagesRef.current = new Array(urls.length);
    
    let loadedCount = 0;
    let priorityLoaded = false;

    const loadImage = (index: number): Promise<void> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.decoding = "async"; // Async para não bloquear thread principal
        
        const onComplete = () => {
          loadedCount++;
          setLoadProgress(Math.round((loadedCount / urls.length) * 100));
          
          // Quando frames prioritários carregarem, iniciar página
          if (!priorityLoaded && loadedCount >= PRIORITY_FRAMES) {
            priorityLoaded = true;
            setupCanvas();
            stateRef.current.frame = 0;
            render();
            setIsReady(true);
            // Iniciar scroll após pequeno delay para garantir render
            requestAnimationFrame(() => {
              initScroll();
            });
          }
          
          if (loadedCount === urls.length) {
            console.log(`[Edits] Loaded ${TOTAL_FRAMES} frames`);
          }
          
          resolve();
        };

        img.onload = onComplete;
        img.onerror = () => {
          console.warn(`[Edits] Frame ${index} failed`);
          onComplete();
        };
        
        imagesRef.current[index] = img;
        img.src = urls[index];
      });
    };

    // Carregar frames prioritários primeiro (em paralelo)
    const priorityPromises = urls.slice(0, PRIORITY_FRAMES).map((_, i) => loadImage(i));
    
    // Depois carregar o resto em batches para não sobrecarregar
    Promise.all(priorityPromises).then(() => {
      const BATCH_SIZE = 20;
      let currentBatch = PRIORITY_FRAMES;
      
      const loadNextBatch = () => {
        const batch = [];
        for (let i = 0; i < BATCH_SIZE && currentBatch < urls.length; i++, currentBatch++) {
          batch.push(loadImage(currentBatch));
        }
        
        if (batch.length > 0) {
          Promise.all(batch).then(() => {
            // Usar requestIdleCallback se disponível, senão setTimeout
            if ('requestIdleCallback' in window) {
              requestIdleCallback(loadNextBatch, { timeout: 100 });
            } else {
              setTimeout(loadNextBatch, 16);
            }
          });
        }
      };
      
      loadNextBatch();
    });

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
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
      }
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [isLoading, setupCanvas, render, initScroll]);

  // Loading state com progresso
  if (isLoading || !isReady) {
    return (
      <div className="w-screen h-screen bg-black flex flex-col items-center justify-center gap-4">
        <div className="relative w-48 h-1 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="absolute inset-y-0 left-0 bg-white rounded-full transition-all duration-200"
            style={{ width: `${loadProgress}%` }}
          />
        </div>
        <div className="text-white/60 text-sm font-medium">
          {loadProgress < 100 ? `${loadProgress}%` : 'Preparando...'}
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="w-screen h-screen bg-black flex flex-col items-center justify-center gap-6">
        <div className="text-white text-xl">Nenhum vídeo disponível</div>
        <Link
          to="/"
          className="px-6 py-3 text-base font-bold bg-black text-white rounded-full hover:bg-black/90 transition-all hover:scale-105 border border-sky-400/60"
        >
          Voltar para Homepage
        </Link>
      </div>
    );
  }

  return (
    <main className="relative w-screen min-h-[100dvh] bg-black text-white overflow-hidden">
      <section
        ref={containerRef}
        className="relative w-screen h-[100dvh] overflow-hidden"
        style={{ perspective: `${PERSPECTIVE_PX}px` }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full z-0 bg-black"
        />

        <div
          ref={headerRef}
          className="absolute left-1/2 top-8 z-30"
          style={{ transform: "translate(-50%, 0)" }}
        >
          <Link
            to="/"
            className="relative px-6 py-3 text-base font-bold bg-black text-white rounded-full hover:bg-black/90 transition-all hover:scale-105 border border-sky-400/60 animate-glow-pulse"
            style={{
              boxShadow: "0 0 20px rgba(56, 189, 248, 0.5), 0 0 40px rgba(56, 189, 248, 0.3)",
            }}
          >
            Homepage
          </Link>
        </div>

        <div
          ref={scrollHintRef}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-3 pointer-events-none"
        >
          <span className="text-white text-base font-semibold tracking-wider uppercase px-6 py-2 bg-black/60 backdrop-blur-sm rounded-full border border-white/30">
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

        {videos.map((video, idx) => (
          <div
            key={video.id}
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
                preload="metadata"
                className="w-full aspect-video max-h-[80dvh] rounded-2xl border border-white/20 shadow-2xl object-contain"
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
            className="relative px-8 py-4 text-xl font-bold bg-black text-white rounded-full hover:bg-black/90 transition-all hover:scale-105 border border-sky-400/60 animate-glow-pulse pointer-events-auto"
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

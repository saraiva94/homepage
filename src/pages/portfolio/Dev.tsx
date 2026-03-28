/**
 * ========================================
 * DEV.TSX - SEM BARRA DE LOADING
 * ========================================
 * 
 * MUDANÇAS:
 * - Remove ProgressBar component
 * - Usa frames do cache (já preloaded na homepage)
 * - Se cache vazio, carrega silenciosamente
 * - Experiência instantânea
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import Lenis from "lenis";
import { supabase } from "@/integrations/backend/client";
import { getCachedFrames, useOptimizedPreload, getGlobalProgress } from "@/hooks/useOptimizedPreload";
import { LoadingScreen } from "@/components/LoadingScreen";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const TOTAL_FRAMES = 261;
const PERSPECTIVE_PX = 1000;
const MAX_VIDEOS = 8;

interface Video {
  id: string;
  video_url: string;
  display_order: number;
}

export default function DevPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);
  const [gsapLoaded, setGsapLoaded] = useState(false);
  const [showPage, setShowPage] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const containerRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLDivElement | null)[]>([]);
  const endButtonRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const stateRef = useRef({ frame: 0, count: TOTAL_FRAMES });
  const scrollTriggerRef = useRef<any>(null);
  const lenisRef = useRef<any>(null);
  const gsapRef = useRef<any>(null);
  const scrollTriggerApiRef = useRef<any>(null);

  const {
    loadFrames,
    progress: preloadProgress,
    images: preloadedImages,
    isComplete: framesComplete,
  } = useOptimizedPreload({
    totalFrames: TOTAL_FRAMES,
    portfolioType: 'dev',
    batchSize: 20,
    autoStart: false,
    silent: true,
  });

  useEffect(() => {
    // Mantém o ref sempre sincronizado.
    // Importante: stateRef.count precisa refletir a quantidade REAL de frames disponíveis
    // pra animação usar 100% do range (top → bottom) sem depender de frames undefined.
    if (preloadedImages.length > 0) {
      imagesRef.current = preloadedImages;
      stateRef.current.count = preloadedImages.length;
    }
  }, [preloadedImages]);

  // Inicia preload de frames imediatamente (em paralelo com loading screen)
  useEffect(() => {
    const cachedFrames = getCachedFrames('dev', TOTAL_FRAMES);
    if (cachedFrames && cachedFrames.length > 0) {
      console.log(`[Dev] ✅ Usando ${cachedFrames.length} frames do cache`);
      imagesRef.current = cachedFrames;
      stateRef.current.count = cachedFrames.length;
      return;
    }
    console.log('[Dev] ⏳ Cache vazio, carregando frames...');
    loadFrames();
  }, [loadFrames]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const { data, error } = await supabase
          .from("portfolio_videos")
          .select("*")
          .eq("portfolio_type", "dev")
          .order("display_order")
          .limit(MAX_VIDEOS);

        if (error) throw error;
        setVideos(data || []);
      } catch (error) {
        console.error("[Dev] Error fetching videos:", error);
      } finally {
        setIsLoadingVideos(false);
      }
    };

    fetchVideos();
  }, []);

  useEffect(() => {
    // ============= LENIS + SCROLLTRIGGER =============
    const isMobile = window.innerWidth < 768 || 'ontouchstart' in window;
    const lenis = new Lenis({ smoothWheel: true, lerp: isMobile ? 0.25 : 0.1 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf((time as number) * 1000));
    gsap.ticker.lagSmoothing(0);

    lenisRef.current = lenis;
    gsapRef.current = gsap;
    scrollTriggerApiRef.current = ScrollTrigger;
    setGsapLoaded(true);

    return () => {
      lenis.destroy();
      gsap.ticker.lagSmoothing(500, 33);
    };
  }, []);

  const setupCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;
    
    ctxRef.current = ctx;

    const rect = canvas.getBoundingClientRect();
    const isMobile = window.innerWidth < 768 || 'ontouchstart' in window;
    const dpr = isMobile ? 1 : Math.min(2, window.devicePixelRatio || 1);

    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const render = () => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas || imagesRef.current.length === 0) return;

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

  useEffect(() => {
    const hasAnyFrames = imagesRef.current.length > 0;
    if (!gsapLoaded || !showPage || !hasAnyFrames) return;

    setupCanvas();
    stateRef.current.frame = 0;
    render();

    const initScroll = () => {
      const container = containerRef.current;
      const gsap = gsapRef.current;
      const ScrollTrigger = scrollTriggerApiRef.current;
      if (!container || !gsap || !ScrollTrigger) return;

      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
      }

      const totalVideos = videos.length;
      if (totalVideos === 0) return;

      const heroScrollScreens = 1 + totalVideos + 0.5;
      const scrollEnd = window.innerHeight * heroScrollScreens;

      const isMobile = window.innerWidth < 768 || 'ontouchstart' in window;

      scrollTriggerRef.current = ScrollTrigger.create({
        trigger: container,
        start: "top top",
        end: `+=${scrollEnd}`,
        pin: true,
        pinSpacing: true,
        scrub: isMobile ? 2 : 1,
        onUpdate: (self: any) => {
          const progress = self.progress;

          const targetFrame = Math.round(progress * (stateRef.current.count - 1));
          if (targetFrame !== stateRef.current.frame && imagesRef.current[targetFrame]) {
            stateRef.current.frame = targetFrame;
            requestAnimationFrame(render);
          }

          if (headerRef.current) {
            const headerFadeEnd = 0.12;
            const t = Math.max(0, Math.min(1, progress / headerFadeEnd));
            const eased = 1 - Math.pow(1 - t, 3);
            const opacity = 1 - eased;
            gsap.set(headerRef.current, {
              transform: "translate(-50%, 0)",
              opacity,
              pointerEvents: opacity < 0.1 ? "none" : "auto",
              force3D: true,
            });
          }

          if (scrollHintRef.current) {
            const hintFadeEnd = 0.08;
            const hintProgress = Math.max(0, Math.min(1, progress / hintFadeEnd));
            gsap.set(scrollHintRef.current, {
              opacity: 1 - hintProgress,
              y: hintProgress * 100,
              force3D: true,
            });
          }

          const buttonStart = 0.95;
          const progressPerVideo = buttonStart / totalVideos;

          videoRefs.current.forEach((videoEl, idx) => {
            if (!videoEl || idx >= totalVideos) return;

            const videoStart = idx * progressPerVideo;
            const videoEnd = videoStart + progressPerVideo;
            const enterEnd = videoStart + progressPerVideo * 0.4;
            const exitStart = videoEnd - progressPerVideo * 0.35;

            if (progress < videoStart) {
              gsap.set(videoEl, { y: "-60%", opacity: 0, scale: 0.3, force3D: true });
            } else if (progress >= videoStart && progress < enterEnd) {
              const t = (progress - videoStart) / (enterEnd - videoStart);
              const eased = 1 - Math.pow(1 - t, 2);
              gsap.set(videoEl, {
                y: `${-60 + eased * 60}%`,
                opacity: eased,
                scale: 0.3 + eased * 0.7,
                force3D: true,
              });
            } else if (progress >= enterEnd && progress < exitStart) {
              gsap.set(videoEl, { y: "0%", opacity: 1, scale: 1, force3D: true });
            } else if (progress >= exitStart && progress <= videoEnd) {
              const t = (progress - exitStart) / (videoEnd - exitStart);
              const eased = Math.pow(t, 2);
              gsap.set(videoEl, {
                y: `${eased * 60}%`,
                opacity: 1 - eased,
                scale: 1 + eased * 0.8,
                force3D: true,
              });
            } else {
              gsap.set(videoEl, { y: "60%", opacity: 0, scale: 1.8, force3D: true });
            }
          });

          if (endButtonRef.current) {
            if (progress >= buttonStart) {
              const t = (progress - buttonStart) / (1 - buttonStart);
              const eased = 1 - Math.pow(1 - t, 2);
              gsap.set(endButtonRef.current, {
                opacity: eased,
                scale: 0.8 + eased * 0.2,
                pointerEvents: eased > 0.5 ? "auto" : "none",
                force3D: true,
              });
            } else {
              gsap.set(endButtonRef.current, { opacity: 0, scale: 0.8, pointerEvents: "none", force3D: true });
            }
          }
        },
      });

      requestAnimationFrame(() => ScrollTrigger.refresh());
    };

    initScroll();

    let resizeTimer: number;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        setupCanvas();
        render();
        if (gsapRef.current?.ScrollTrigger) {
          gsapRef.current.ScrollTrigger.refresh();
        }
      }, 150);
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(resizeTimer);
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
      }
    };
  }, [gsapLoaded, showPage, videos.length, preloadedImages.length]);

  // Polling do progresso global (funciona mesmo quando homepage iniciou o preload)
  const [frameProgressPolled, setFrameProgressPolled] = useState(0);
  useEffect(() => {
    if (showPage) return;
    const interval = setInterval(() => {
      const gp = getGlobalProgress('dev', TOTAL_FRAMES);
      setFrameProgressPolled(gp);
    }, 200);
    return () => clearInterval(interval);
  }, [showPage]);

  // Progresso real: videos(10) + gsap(10) + frames(80) via polling global
  const framesPct = Math.max(preloadProgress, frameProgressPolled);
  const realProgress = Math.min(
    Math.round(
      (isLoadingVideos ? 0 : 10) + (gsapLoaded ? 10 : 0) + framesPct * 0.8
    ),
    100
  );

  const handleLoadingComplete = useCallback(() => {
    setShowPage(true);
  }, []);

  if (!showPage) {
    return (
      <LoadingScreen
        progress={realProgress}
        onComplete={handleLoadingComplete}
        title="DEV"
        subtitle="PORTFOLIO"
      />
    );
  }

  if (videos.length === 0) {
    return (
      <div className="w-screen h-screen bg-black flex flex-col items-center justify-center gap-6">
        <div className="text-white text-xl">Nenhum vídeo disponível</div>
        <Link
          to="/"
          className="text-base font-bold bg-white text-black rounded-full hover:bg-white/90 transition-all hover:scale-105 border border-sky-400/60"
          style={{ padding: '1rem 3rem' }}
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
          style={{ willChange: 'contents' }}
        />

        <div
          ref={headerRef}
          className="absolute left-1/2 top-4 sm:top-8 z-30"
          style={{ transform: "translate(-50%, 0)" }}
        >
          <Link
            to="/"
            className="relative text-sm sm:text-base font-bold bg-white text-black rounded-full hover:bg-white/90 transition-all hover:scale-105 border border-sky-400/60 animate-glow-pulse"
            style={{ padding: '1rem 3rem' }}
          >
            Homepage
          </Link>
        </div>

        <div
          ref={scrollHintRef}
          className="absolute bottom-6 sm:bottom-12 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 sm:gap-3 pointer-events-none"
        >
          <span className="text-white text-xs sm:text-base font-semibold tracking-wider uppercase bg-white/20 backdrop-blur-sm rounded-full border border-white/30 text-center" style={{ padding: '0.75rem 2rem' }}>
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
            className="absolute inset-0 flex items-center justify-center z-20 px-2 sm:px-4"
            style={{ transform: "translateY(100%)", opacity: 0, willChange: 'transform, opacity' }}
          >
            <div className="w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-[1000px]">
              <video
                controls
                playsInline
                preload="none"
                className="w-full aspect-video max-h-[70dvh] sm:max-h-[80dvh] rounded-xl sm:rounded-2xl border border-white/20 shadow-2xl object-contain"
              >
                <source src={video.video_url} type="video/mp4" />
              </video>
            </div>
          </div>
        ))}

        <div
          ref={endButtonRef}
          className="absolute inset-0 flex flex-col sm:flex-row items-center justify-center z-30 gap-3 sm:gap-4 px-4"
          style={{ opacity: 0, pointerEvents: "none" }}
        >
          <Link
            to="/"
            className="relative text-base sm:text-xl font-bold bg-white text-black rounded-full hover:bg-white/90 transition-all hover:scale-105 border border-sky-400/60 animate-glow-pulse pointer-events-auto w-full sm:w-auto text-center"
            style={{ padding: '1.25rem 3.5rem' }}
          >
            Homepage
          </Link>
          <button
            onClick={() => {
              if (gsapRef.current) {
                gsapRef.current.to(window, {
                  scrollTo: { y: 0 },
                  duration: 2,
                  ease: "power2.inOut",
                });
              }
            }}
            className="relative text-base sm:text-xl font-bold bg-black/60 text-white rounded-full hover:bg-black/80 transition-all hover:scale-105 border border-white/40 backdrop-blur-sm pointer-events-auto w-full sm:w-auto text-center"
            style={{ padding: '1.25rem 3.5rem' }}
          >
            Voltar ao topo
          </button>
        </div>
      </section>
    </main>
  );
}

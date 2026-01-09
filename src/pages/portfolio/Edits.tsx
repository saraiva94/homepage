import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import Lenis from "lenis";
import { supabase } from "@/integrations/backend/client";
import { getCachedFrames, useOptimizedPreload } from "@/hooks/useOptimizedPreload";
import { LoadingScreen } from "@/components/LoadingScreen";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const TOTAL_FRAMES = 300;
const PERSPECTIVE_PX = 1000;
const MAX_VIDEOS = 8;

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

interface Video {
  id: string;
  video_url: string;
  display_order: number;
}

export default function EditsPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);
  const [gsapLoaded, setGsapLoaded] = useState(false);
  const [framesReady, setFramesReady] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
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

  const { loadFrames, progress: preloadProgress, images: preloadedImages } = useOptimizedPreload({
    totalFrames: TOTAL_FRAMES,
    portfolioType: 'edits',
    batchSize: 20,
    autoStart: false,
    silent: true,
  });

  // Sincroniza imagens do preload com ref
  useEffect(() => {
    if (preloadedImages.length > 0) {
      imagesRef.current = preloadedImages;
      setFramesReady(true);
    }
  }, [preloadedImages]);

  // Fetch videos from database
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const { data, error } = await supabase
          .from("portfolio_videos")
          .select("*")
          .eq("portfolio_type", "editor")
          .order("display_order")
          .limit(MAX_VIDEOS);

        if (error) throw error;
        setVideos(data || []);
      } catch (error) {
        console.error("[Edits] Error fetching videos:", error);
      } finally {
        setIsLoadingVideos(false);
      }
    };

    fetchVideos();
  }, []);

  // ============= LENIS + SCROLLTRIGGER =============
  useEffect(() => {
    const lenis = new Lenis({ smoothWheel: true, lerp: 0.1 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    
    lenisRef.current = lenis;
    setGsapLoaded(true);
    
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

    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));

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
    if (isLoadingVideos) return;

    const initImages = async () => {
      // Tenta usar imagens do cache primeiro
      const cachedImages = getCachedFrames('edits', TOTAL_FRAMES);
      
      if (cachedImages && cachedImages.length > 0) {
        console.log(`[Edits] ✅ Usando ${cachedImages.length} frames do cache`);
        imagesRef.current = cachedImages;
        setFramesReady(true);
      } else {
        // Se não tem cache, inicia preload em background
        console.log(`[Edits] ⏳ Cache vazio, carregando frames...`);
        loadFrames();
        // framesReady será setado pelo effect que observa preloadedImages
      }
    };

    initImages();
  }, [isLoadingVideos, loadFrames]);

  // Init scroll quando frames estiverem prontos
  useEffect(() => {
    if (!framesReady || videos.length === 0) return;

    setupCanvas();
    stateRef.current.frame = 0;
    render();
    initScroll();

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
  }, [framesReady, videos.length]);

  // ============= SCROLLTRIGGER =============
  function initScroll(): void {
    const container = containerRef.current;
    if (!container) return;

    // Kill existing ScrollTrigger
    if (scrollTriggerRef.current) {
      scrollTriggerRef.current.kill();
    }

    const totalVideos = videos.length;
    if (totalVideos === 0) return;

    // Dynamic scroll calculation: 1 hero screen + 1 screen per video + 0.5 for button
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

        // ===== VIDEOS - zoom contínuo: pequeno -> normal -> grande =====
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

  // Calcula progresso total
  const isFullyLoaded = !isLoadingVideos && gsapLoaded && framesReady;
  
  useEffect(() => {
    let progress = 0;
    if (!isLoadingVideos) progress += 20;
    if (gsapLoaded) progress += 20;
    if (framesReady) progress += 60;
    else progress += (preloadProgress * 0.6);
    setLoadingProgress(Math.min(progress, 100));
  }, [isLoadingVideos, gsapLoaded, framesReady, preloadProgress]);

  if (!isFullyLoaded) {
    return (
      <LoadingScreen 
        progress={loadingProgress}
        title="EDITS"
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
          className="px-6 py-3 text-base font-bold bg-black text-white rounded-full hover:bg-black/90 transition-all hover:scale-105 border border-sky-400/60"
        >
          Voltar para Homepage
        </Link>
      </div>
    );
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
          className="absolute left-1/2 top-4 sm:top-8 z-30"
          style={{ transform: "translate(-50%, 0)" }}
        >
          <Link
            to="/"
            className="relative px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base font-bold bg-black text-white rounded-full hover:bg-black/90 transition-all hover:scale-105 border border-sky-400/60 animate-glow-pulse"
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
          className="absolute bottom-6 sm:bottom-12 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 sm:gap-3 pointer-events-none px-4"
        >
          <span className="text-white text-xs sm:text-base font-semibold tracking-wider uppercase px-4 sm:px-6 py-1.5 sm:py-2 bg-black/60 backdrop-blur-sm rounded-full border border-white/30 text-center">
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

        {/* Videos - cada um em layer separado */}
        {videos.map((video, idx) => (
          <div
            key={video.id}
            ref={(el) => {
              videoRefs.current[idx] = el;
            }}
            className="absolute inset-0 flex items-center justify-center z-20 px-2 sm:px-4"
            style={{ transform: "translateY(100%)", opacity: 0 }}
          >
            <div className="w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-[1000px]">
              <video
                controls
                playsInline
                className="w-full aspect-video max-h-[70dvh] sm:max-h-[80dvh] rounded-xl sm:rounded-2xl border border-white/20 shadow-2xl object-contain"
              >
                <source src={video.video_url} type="video/mp4" />
              </video>
            </div>
          </div>
        ))}

        {/* Botões Homepage e Voltar ao início - aparecem ao fim */}
        <div
          ref={endButtonRef}
          className="absolute inset-0 flex flex-col sm:flex-row items-center justify-center z-30 gap-3 sm:gap-4 px-4"
          style={{ opacity: 0, pointerEvents: "none" }}
        >
          <Link
            to="/"
            className="relative px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-xl font-bold bg-black text-white rounded-full hover:bg-black/90 transition-all hover:scale-105 border border-sky-400/60 animate-glow-pulse pointer-events-auto w-full sm:w-auto text-center"
            style={{
              boxShadow: "0 0 20px rgba(56, 189, 248, 0.5), 0 0 40px rgba(56, 189, 248, 0.3)",
            }}
          >
            Homepage
          </Link>
          <button
            onClick={() => {
              gsap.to(window, {
                scrollTo: { y: 0 },
                duration: 2,
                ease: "power2.inOut",
              });
            }}
            className="relative px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-xl font-bold bg-white/20 text-white rounded-full hover:bg-white/30 transition-all hover:scale-105 border border-white/40 backdrop-blur-sm pointer-events-auto w-full sm:w-auto text-center"
          >
            Voltar ao início
          </button>
        </div>
      </section>
    </main>
  );
}

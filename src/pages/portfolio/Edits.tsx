import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { supabase } from "@/integrations/backend/client";
import { FRAME_CONFIG } from "@/hooks/usePrefetchPortfolioFrames";
import { PortfolioQADebug } from "@/components/portfolio/PortfolioQADebug";
import { useResponsiveFullscreenCanvas } from "@/hooks/useResponsiveFullscreenCanvas";
import { useFrameLoader } from "@/hooks/useFrameLoader";

gsap.registerPlugin(ScrollTrigger);

// ============= CONSTANTES CONFIGURÁVEIS (sunset_timeline) =============
const CONFIG = FRAME_CONFIG.editor;
const FRAME_START = CONFIG.start;
const FRAME_END = 300;
const TOTAL_FRAMES = FRAME_END - FRAME_START + 1;

const PERSPECTIVE_PX = 1000;
const PRIORITY_FRAMES = 15;
const PRELOAD_RANGE = 10;

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
  const [loadError, setLoadError] = useState<string | null>(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [framesLoaded, setFramesLoaded] = useState(0);
  const [frameLoadErrors, setFrameLoadErrors] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const containerRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLDivElement | null)[]>([]);
  const endButtonRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const scrollSpaceRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);
  const lastPreloadedRef = useRef(-1);

  const [scrollSpaceHeight, setScrollSpaceHeight] = useState<number>(() => window.innerHeight * 2);

  // Hook otimizado para carregar frames
  const frameLoader = useFrameLoader({
    dir: CONFIG.dir,
    basename: CONFIG.basename,
    ext: CONFIG.ext,
    pad: CONFIG.pad,
    start: FRAME_START,
    totalFrames: TOTAL_FRAMES,
  });

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

  // Canvas fullscreen responsivo
  const { resizeCanvas, sizeRef } = useResponsiveFullscreenCanvas(canvasRef, {
    maxDpr: 2,
  });

  // Render frame otimizado
  const render = useCallback((): void => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!ctxRef.current) {
      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) return;
      ctxRef.current = ctx;
    }

    const ctx = ctxRef.current;
    const cw = Math.max(1, Math.round(sizeRef.current.width || canvas.clientWidth || window.innerWidth));
    const ch = Math.max(1, Math.round(sizeRef.current.height || canvas.clientHeight || window.innerHeight));

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, cw, ch);

    const img = frameLoader.getFrame(frameRef.current);
    if (!img) return;

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
  }, [sizeRef, frameLoader]);

  // ScrollTrigger com preload adjacente
  const initScroll = useCallback((): void => {
    const triggerEl = scrollSpaceRef.current;
    if (!triggerEl) return;

    if (scrollTriggerRef.current) {
      scrollTriggerRef.current.kill();
    }

    const totalVideos = videos.length;
    if (totalVideos === 0) return;

    const heroScrollScreens = 1 + totalVideos + 0.5;
    const scrollEnd = window.innerHeight * heroScrollScreens;
    setScrollSpaceHeight(scrollEnd);

    scrollTriggerRef.current = ScrollTrigger.create({
      trigger: triggerEl,
      start: "top top",
      end: `+=${scrollEnd}`,
      scrub: 0.5,
      onUpdate: (self) => {
        const progress = self.progress;

        const targetFrame = Math.round(progress * (TOTAL_FRAMES - 1));
        if (targetFrame !== frameRef.current) {
          frameRef.current = targetFrame;
          setCurrentFrame(targetFrame);
          render();

          // Preload de frames adjacentes durante scroll
          if (Math.abs(targetFrame - lastPreloadedRef.current) > 3) {
            lastPreloadedRef.current = targetFrame;
            frameLoader.preloadAdjacent(targetFrame, PRELOAD_RANGE);
          }
        }

        // Header fade
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

        // Scroll hint fade
        if (scrollHintRef.current) {
          const hintFadeEnd = 0.08;
          const hintProgress = clamp01(progress / hintFadeEnd);
          gsap.set(scrollHintRef.current, {
            opacity: 1 - hintProgress,
            y: hintProgress * 100,
          });
        }

        // Video animations
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

        // End button
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
  }, [videos.length, render, frameLoader]);

  // Carregar frames usando o hook otimizado
  useEffect(() => {
    if (isLoading) return;

    // Enviar frames para cache do Service Worker
    frameLoader.precacheInServiceWorker(0, PRIORITY_FRAMES);

    // Carregar frames prioritários primeiro
    let totalErrors = 0;

    frameLoader
      .loadBatch(0, PRIORITY_FRAMES, 8, (loaded) => {
        setFramesLoaded(loaded);
        setLoadProgress(Math.round((loaded / TOTAL_FRAMES) * 100));
      })
      .then((loadedCount) => {
        const failedCount = PRIORITY_FRAMES - loadedCount;
        totalErrors += failedCount;
        setFrameLoadErrors(totalErrors);

        if (loadedCount === 0) {
          setLoadError(frameLoader.getFrameUrl(0));
          return;
        }

        resizeCanvas();
        frameRef.current = 0;
        render();
        setIsReady(true);

        setTimeout(() => initScroll(), 100);

        // Carregar resto dos frames em background
        let currentBatch = PRIORITY_FRAMES;
        const BATCH_SIZE = 25;

        const loadNextBatch = () => {
          if (currentBatch >= TOTAL_FRAMES) {
            setLoadProgress(100);
            return;
          }

          frameLoader
            .loadBatch(currentBatch, BATCH_SIZE, 6, (loaded) => {
              const progressLoaded = currentBatch + loaded;
              setFramesLoaded(progressLoaded);
              setLoadProgress(Math.round((progressLoaded / TOTAL_FRAMES) * 100));
            })
            .then((batchLoaded) => {
              const batchFailed = Math.min(BATCH_SIZE, TOTAL_FRAMES - currentBatch) - batchLoaded;
              totalErrors += batchFailed;
              setFrameLoadErrors(totalErrors);
              
              currentBatch += BATCH_SIZE;
              if ("requestIdleCallback" in window) {
                requestIdleCallback(() => loadNextBatch(), { timeout: 100 });
              } else {
                setTimeout(loadNextBatch, 32);
              }
            });
        };

        loadNextBatch();

        requestAnimationFrame(() => ScrollTrigger.refresh());
        setTimeout(() => ScrollTrigger.refresh(), 600);
      });

    const onResize = () => {
      resizeCanvas();
      render();
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      if (scrollTriggerRef.current) scrollTriggerRef.current.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [isLoading, resizeCanvas, render, initScroll, frameLoader]);

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
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/30 via-pink-900/20 to-purple-900/30 animate-pulse" />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-white rounded-full transition-all duration-300"
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
          className="px-6 py-3 text-base font-bold bg-black text-white rounded-full hover:bg-black/90 transition-all hover:scale-105 border border-white/20"
        >
          Voltar para Homepage
        </Link>
      </div>
    );
  }

  return (
    <div className="relative bg-black text-white">
      <div ref={scrollSpaceRef} style={{ height: scrollSpaceHeight }} aria-hidden />

      <div className="fixed inset-0 overflow-hidden">
        <PortfolioQADebug
          name="editor"
          isReady={isReady}
          isLoading={isLoading}
          loadProgress={loadProgress}
          frame={currentFrame}
          totalFrames={TOTAL_FRAMES}
          videosCount={videos.length}
          canvasEl={canvasRef.current}
          containerEl={containerRef.current}
          scrollTriggerInstance={scrollTriggerRef.current}
          framesLoaded={framesLoaded}
          frameLoadErrors={frameLoadErrors}
        />

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
              className="relative px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base font-bold bg-black text-white rounded-full hover:bg-black/90 transition-all hover:scale-105 border border-sky-400/60 animate-glow-pulse"
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
            <span className="text-white text-xs sm:text-base font-semibold tracking-wider uppercase px-4 py-1.5 sm:px-6 sm:py-2 bg-black/60 backdrop-blur-sm rounded-full border border-white/30">
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
              className="relative px-6 py-3 sm:px-8 sm:py-4 text-lg sm:text-xl font-bold bg-black text-white rounded-full hover:bg-black/90 transition-all hover:scale-105 border border-sky-400/60 animate-glow-pulse pointer-events-auto"
              style={{
                boxShadow: "0 0 20px rgba(56, 189, 248, 0.5), 0 0 40px rgba(56, 189, 248, 0.3)",
              }}
            >
              Homepage
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

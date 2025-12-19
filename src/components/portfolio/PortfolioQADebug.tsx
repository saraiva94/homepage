import { useEffect, useMemo, useState, useCallback } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type Props = {
  name: "dev" | "editor";
  isReady: boolean;
  isLoading: boolean;
  loadProgress: number;
  frame: number;
  totalFrames: number;
  videosCount: number;
  canvasEl: HTMLCanvasElement | null;
  containerEl: HTMLElement | null;
  scrollTriggerInstance?: ScrollTrigger | null;
  framesLoaded?: number;
  frameLoadErrors?: number;
};

type Metrics = {
  ts: number;
  vvW?: number;
  vvH?: number;
  vvScale?: number;
  innerW: number;
  innerH: number;
  dpr: number;
  canvasCssW: number;
  canvasCssH: number;
  canvasPxW: number;
  canvasPxH: number;
  containerW: number;
  containerH: number;
  pinSpacerW?: number;
  pinSpacerH?: number;
  // Scroll diagnostics
  scrollY: number;
  scrollMax: number;
  docHeight: number;
  stProgress: number;
  stIsActive: boolean;
  htmlOverflow: string;
  bodyOverflow: string;
};

type CacheStats = {
  frameCount: number;
  generalCount: number;
  swStatus: "active" | "installing" | "waiting" | "none";
};

function readMetrics(
  canvasEl: HTMLCanvasElement | null,
  containerEl: HTMLElement | null,
  scrollTriggerInstance?: ScrollTrigger | null
): Metrics {
  const vv = window.visualViewport ?? undefined;
  const canvasRect = canvasEl?.getBoundingClientRect();
  const containerRect = containerEl?.getBoundingClientRect();

  // ScrollTrigger cria um .pin-spacer ao redor do elemento pinado
  const pinSpacer = containerEl?.parentElement?.classList.contains("pin-spacer")
    ? (containerEl.parentElement as HTMLElement)
    : (containerEl?.closest?.(".pin-spacer") as HTMLElement | null) ?? null;

  const pinRect = pinSpacer?.getBoundingClientRect();

  // Scroll diagnostics
  const scrollY = window.scrollY || window.pageYOffset || 0;
  const docHeight = Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.offsetHeight
  );
  const scrollMax = Math.max(0, docHeight - window.innerHeight);

  // ScrollTrigger progress
  const stProgress = scrollTriggerInstance?.progress ?? 0;
  const stIsActive = scrollTriggerInstance?.isActive ?? false;

  // Check overflow styles
  const htmlStyle = getComputedStyle(document.documentElement);
  const bodyStyle = getComputedStyle(document.body);

  return {
    ts: Date.now(),
    vvW: vv?.width,
    vvH: vv?.height,
    vvScale: vv?.scale,
    innerW: window.innerWidth,
    innerH: window.innerHeight,
    dpr: window.devicePixelRatio || 1,
    canvasCssW: Math.round(canvasRect?.width ?? 0),
    canvasCssH: Math.round(canvasRect?.height ?? 0),
    canvasPxW: canvasEl?.width ?? 0,
    canvasPxH: canvasEl?.height ?? 0,
    containerW: Math.round(containerRect?.width ?? 0),
    containerH: Math.round(containerRect?.height ?? 0),
    pinSpacerW: pinRect ? Math.round(pinRect.width) : undefined,
    pinSpacerH: pinRect ? Math.round(pinRect.height) : undefined,
    scrollY,
    scrollMax,
    docHeight,
    stProgress,
    stIsActive,
    htmlOverflow: `${htmlStyle.overflowX}/${htmlStyle.overflowY}`,
    bodyOverflow: `${bodyStyle.overflowX}/${bodyStyle.overflowY}`,
  };
}

function getSwStatus(): CacheStats["swStatus"] {
  if (!("serviceWorker" in navigator)) return "none";
  const reg = navigator.serviceWorker.controller;
  if (reg) return "active";
  return "none";
}

export function PortfolioQADebug(props: Props) {
  const enabled = useMemo(() => {
    if (typeof window === "undefined") return false;
    const qs = new URLSearchParams(window.location.search);
    return qs.has("qa") || window.localStorage.getItem("portfolioQA") === "1";
  }, []);

  const [metrics, setMetrics] = useState<Metrics>(() =>
    readMetrics(props.canvasEl, props.containerEl, props.scrollTriggerInstance)
  );

  const [cacheStats, setCacheStats] = useState<CacheStats>({
    frameCount: 0,
    generalCount: 0,
    swStatus: getSwStatus(),
  });

  const updateMetrics = useCallback(() => {
    setMetrics(readMetrics(props.canvasEl, props.containerEl, props.scrollTriggerInstance));
    setCacheStats((prev) => ({ ...prev, swStatus: getSwStatus() }));
  }, [props.canvasEl, props.containerEl, props.scrollTriggerInstance]);

  // Obter estatísticas do cache do Service Worker
  useEffect(() => {
    if (!enabled) return;
    
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "CACHE_STATS") {
        setCacheStats((prev) => ({
          ...prev,
          frameCount: event.data.frameCount,
          generalCount: event.data.generalCount,
        }));
      }
    };

    navigator.serviceWorker?.addEventListener("message", handleMessage);

    // Solicitar stats a cada 2s
    const interval = setInterval(() => {
      navigator.serviceWorker?.controller?.postMessage("GET_CACHE_STATS");
    }, 2000);

    // Solicitar imediatamente
    navigator.serviceWorker?.controller?.postMessage("GET_CACHE_STATS");

    return () => {
      navigator.serviceWorker?.removeEventListener("message", handleMessage);
      clearInterval(interval);
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    updateMetrics();

    const id = window.setInterval(updateMetrics, 200);
    window.addEventListener("resize", updateMetrics);
    window.addEventListener("scroll", updateMetrics, { passive: true });
    window.visualViewport?.addEventListener("resize", updateMetrics);

    return () => {
      window.clearInterval(id);
      window.removeEventListener("resize", updateMetrics);
      window.removeEventListener("scroll", updateMetrics);
      window.visualViewport?.removeEventListener("resize", updateMetrics);
    };
  }, [enabled, updateMetrics]);

  if (!enabled) return null;

  const scrollBlocked =
    metrics.htmlOverflow.includes("hidden") ||
    metrics.bodyOverflow.includes("hidden") ||
    metrics.scrollMax <= 0;

  const framesLoaded = props.framesLoaded ?? 0;
  const frameErrors = props.frameLoadErrors ?? 0;

  return (
    <aside
      className="fixed left-3 top-3 z-[9999] w-[min(440px,calc(100vw-24px))] rounded-lg border border-border bg-background/90 p-3 text-foreground shadow-lg backdrop-blur max-h-[90vh] overflow-y-auto"
      aria-label="QA debug do portfólio"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="text-sm font-semibold">QA Portfolio ({props.name})</div>
        <button
          type="button"
          className="text-xs text-muted-foreground hover:text-foreground"
          onClick={() => {
            window.localStorage.setItem("portfolioQA", "0");
            window.location.reload();
          }}
        >
          fechar
        </button>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px] leading-4 text-muted-foreground">
        {/* Status */}
        <div className="col-span-2 mt-1 text-[10px] font-bold uppercase tracking-wide text-foreground/60">
          Status
        </div>
        <div>ready</div>
        <div className="text-foreground">{String(props.isReady)}</div>
        <div>loading</div>
        <div className="text-foreground">
          {String(props.isLoading)} ({props.loadProgress}%)
        </div>
        <div>frame</div>
        <div className="text-foreground">
          {props.frame + 1}/{props.totalFrames}
        </div>
        <div>frames loaded</div>
        <div className="text-foreground">
          {framesLoaded}/{props.totalFrames}
          {frameErrors > 0 && (
            <span className="text-red-400 ml-1">({frameErrors} erros)</span>
          )}
        </div>
        <div>vídeos</div>
        <div className="text-foreground">{props.videosCount}</div>

        {/* Cache */}
        <div className="col-span-2 mt-2 text-[10px] font-bold uppercase tracking-wide text-foreground/60">
          Service Worker & Cache
        </div>
        <div>SW status</div>
        <div className={`text-foreground ${cacheStats.swStatus === "active" ? "text-green-500" : "text-yellow-400"}`}>
          {cacheStats.swStatus}
        </div>
        <div>frames cached</div>
        <div className="text-foreground">{cacheStats.frameCount}</div>
        <div>general cached</div>
        <div className="text-foreground">{cacheStats.generalCount}</div>

        {/* Scroll */}
        <div className="col-span-2 mt-2 text-[10px] font-bold uppercase tracking-wide text-foreground/60">
          Scroll
        </div>
        <div>scrollY</div>
        <div className="text-foreground">
          {Math.round(metrics.scrollY)} / {Math.round(metrics.scrollMax)}
        </div>
        <div>docHeight</div>
        <div className="text-foreground">{Math.round(metrics.docHeight)}px</div>
        <div>ST progress</div>
        <div className="text-foreground font-mono">
          {(metrics.stProgress * 100).toFixed(1)}%{" "}
          <span className={metrics.stIsActive ? "text-green-500" : "text-red-400"}>
            ({metrics.stIsActive ? "active" : "idle"})
          </span>
        </div>
        <div>html overflow</div>
        <div className="text-foreground">{metrics.htmlOverflow}</div>
        <div>body overflow</div>
        <div className="text-foreground">{metrics.bodyOverflow}</div>

        {/* Viewport */}
        <div className="col-span-2 mt-2 text-[10px] font-bold uppercase tracking-wide text-foreground/60">
          Viewport
        </div>
        <div>vv (w×h)</div>
        <div className="text-foreground">
          {(metrics.vvW ?? 0).toFixed(0)}×{(metrics.vvH ?? 0).toFixed(0)} (scale{" "}
          {metrics.vvScale ?? 1})
        </div>
        <div>inner (w×h)</div>
        <div className="text-foreground">
          {metrics.innerW}×{metrics.innerH} (dpr {metrics.dpr})
        </div>

        {/* Canvas & Container */}
        <div className="col-span-2 mt-2 text-[10px] font-bold uppercase tracking-wide text-foreground/60">
          Canvas & Container
        </div>
        <div>canvas css</div>
        <div className="text-foreground">
          {metrics.canvasCssW}×{metrics.canvasCssH}
        </div>
        <div>canvas px</div>
        <div className="text-foreground">
          {metrics.canvasPxW}×{metrics.canvasPxH}
        </div>
        <div>container</div>
        <div className="text-foreground">
          {metrics.containerW}×{metrics.containerH}
        </div>
        <div>pin-spacer</div>
        <div className="text-foreground">
          {metrics.pinSpacerW ?? 0}×{metrics.pinSpacerH ?? 0}
        </div>
      </div>

      {/* Warnings */}
      {scrollBlocked && (
        <div className="mt-2 rounded-md bg-red-500/20 p-2 text-[11px] text-red-300 border border-red-500/30">
          <strong>⚠ Scroll bloqueado:</strong> overflow hidden ou docHeight insuficiente.
        </div>
      )}

      {(metrics.canvasCssW === 0 ||
        metrics.canvasCssH === 0 ||
        metrics.containerW === 0 ||
        metrics.containerH === 0) && (
        <div className="mt-2 rounded-md bg-amber-500/20 p-2 text-[11px] text-amber-300 border border-amber-500/30">
          <strong>⚠ Elemento com 0px:</strong> canvas ou container invisível.
        </div>
      )}
    </aside>
  );
}

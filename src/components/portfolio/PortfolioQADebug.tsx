import { useEffect, useMemo, useState } from "react";

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
};

function readMetrics(canvasEl: HTMLCanvasElement | null, containerEl: HTMLElement | null): Metrics {
  const vv = window.visualViewport ?? undefined;
  const canvasRect = canvasEl?.getBoundingClientRect();
  const containerRect = containerEl?.getBoundingClientRect();

  // ScrollTrigger cria um .pin-spacer ao redor do elemento pinado
  const pinSpacer = containerEl?.parentElement?.classList.contains("pin-spacer")
    ? (containerEl.parentElement as HTMLElement)
    : (containerEl?.closest?.(".pin-spacer") as HTMLElement | null) ?? null;

  const pinRect = pinSpacer?.getBoundingClientRect();

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
  };
}

export function PortfolioQADebug(props: Props) {
  const enabled = useMemo(() => {
    if (typeof window === "undefined") return false;
    const qs = new URLSearchParams(window.location.search);
    return qs.has("qa") || window.localStorage.getItem("portfolioQA") === "1";
  }, []);

  const [metrics, setMetrics] = useState<Metrics>(() => readMetrics(props.canvasEl, props.containerEl));

  useEffect(() => {
    if (!enabled) return;

    const tick = () => setMetrics(readMetrics(props.canvasEl, props.containerEl));
    tick();

    const id = window.setInterval(tick, 350);
    window.addEventListener("resize", tick);
    window.visualViewport?.addEventListener("resize", tick);

    return () => {
      window.clearInterval(id);
      window.removeEventListener("resize", tick);
      window.visualViewport?.removeEventListener("resize", tick);
    };
  }, [enabled, props.canvasEl, props.containerEl]);

  if (!enabled) return null;

  return (
    <aside
      className="fixed left-3 top-3 z-[9999] w-[min(420px,calc(100vw-24px))] rounded-lg border border-border bg-background/80 p-3 text-foreground shadow-lg backdrop-blur"
      aria-label="QA debug do portfólio"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="text-sm font-semibold">QA Portfolio ({props.name})</div>
        <button
          type="button"
          className="text-xs text-muted-foreground hover:text-foreground"
          onClick={() => {
            window.localStorage.setItem("portfolioQA", "0");
            // não mexer no querystring aqui; só esconde
            window.location.reload();
          }}
        >
          fechar
        </button>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] leading-4 text-muted-foreground">
        <div>ready</div>
        <div className="text-foreground">{String(props.isReady)}</div>

        <div>loading</div>
        <div className="text-foreground">{String(props.isLoading)} ({props.loadProgress}%)</div>

        <div>frame</div>
        <div className="text-foreground">
          {props.frame + 1}/{props.totalFrames}
        </div>

        <div>vídeos</div>
        <div className="text-foreground">{props.videosCount}</div>

        <div>vv (w×h)</div>
        <div className="text-foreground">
          {(metrics.vvW ?? 0).toFixed(0)}×{(metrics.vvH ?? 0).toFixed(0)} (scale {metrics.vvScale ?? 1})
        </div>

        <div>inner (w×h)</div>
        <div className="text-foreground">
          {metrics.innerW}×{metrics.innerH} (dpr {metrics.dpr})
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
          {(metrics.pinSpacerW ?? 0)}×{(metrics.pinSpacerH ?? 0)}
        </div>
      </div>

      {(metrics.canvasCssW === 0 || metrics.canvasCssH === 0 || metrics.containerW === 0 || metrics.containerH === 0) && (
        <div className="mt-2 rounded-md bg-accent/30 p-2 text-[11px] text-foreground">
          Alerta: algum elemento está com tamanho 0px (isso causa tela preta).
        </div>
      )}
    </aside>
  );
}

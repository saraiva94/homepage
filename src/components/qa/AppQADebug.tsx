import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

type Perf = {
  route: string;
  ts: number;
  domContentLoaded?: number;
  load?: number;
};

function readPerf(route: string): Perf {
  const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  return {
    route,
    ts: Date.now(),
    domContentLoaded: nav?.domContentLoadedEventEnd,
    load: nav?.loadEventEnd,
  };
}

export function AppQADebug() {
  const location = useLocation();

  const enabled = useMemo(() => {
    if (typeof window === "undefined") return false;
    const qs = new URLSearchParams(window.location.search);
    return qs.has("qa") || window.localStorage.getItem("appQA") === "1";
  }, []);

  const [perf, setPerf] = useState<Perf>(() => readPerf(location.pathname));

  useEffect(() => {
    if (!enabled) return;
    setPerf(readPerf(location.pathname));
  }, [enabled, location.pathname]);

  useEffect(() => {
    if (!enabled) return;

    const tick = () => setPerf(readPerf(location.pathname));
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [enabled, location.pathname]);

  if (!enabled) return null;

  const vv = window.visualViewport;

  return (
    <aside
      className="fixed bottom-3 left-3 z-[9999] w-[min(420px,calc(100vw-24px))] rounded-lg border border-border bg-background/80 p-3 text-foreground shadow-lg backdrop-blur"
      aria-label="QA debug do app"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="text-sm font-semibold">QA App</div>
        <button
          type="button"
          className="text-xs text-muted-foreground hover:text-foreground"
          onClick={() => {
            window.localStorage.setItem("appQA", "0");
            window.location.reload();
          }}
        >
          fechar
        </button>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] leading-4 text-muted-foreground">
        <div>route</div>
        <div className="text-foreground">{location.pathname}</div>

        <div>vv (w×h)</div>
        <div className="text-foreground">
          {(vv?.width ?? 0).toFixed(0)}×{(vv?.height ?? 0).toFixed(0)} (scale {vv?.scale ?? 1})
        </div>

        <div>inner (w×h)</div>
        <div className="text-foreground">
          {window.innerWidth}×{window.innerHeight} (dpr {window.devicePixelRatio || 1})
        </div>

        <div>DCL</div>
        <div className="text-foreground">{perf.domContentLoaded?.toFixed(0) ?? "-"}ms</div>

        <div>load</div>
        <div className="text-foreground">{perf.load?.toFixed(0) ?? "-"}ms</div>
      </div>
    </aside>
  );
}

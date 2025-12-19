import { useCallback, useEffect, useRef } from "react";

type Size = { width: number; height: number };

const getViewportSize = (): Size => {
  const vv = window.visualViewport;
  if (vv) return { width: vv.width, height: vv.height };
  return { width: window.innerWidth, height: window.innerHeight };
};

/**
 * Mantém um canvas fullscreen responsivo (desktop/tablet/mobile) usando o tamanho real
 * do elemento (clientWidth/clientHeight) e cai para visualViewport quando necessário.
 */
export function useResponsiveFullscreenCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  options?: { maxDpr?: number; onResize?: (size: Size) => void }
) {
  const sizeRef = useRef<Size>({ width: 0, height: 0 });

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const viewport = getViewportSize();

    const cssWidth = Math.max(1, Math.round(rect.width || viewport.width));
    const cssHeight = Math.max(1, Math.round(rect.height || viewport.height));

    const dpr = Math.min(options?.maxDpr ?? 2, window.devicePixelRatio || 1);

    // backing store
    const nextW = Math.floor(cssWidth * dpr);
    const nextH = Math.floor(cssHeight * dpr);

    if (canvas.width !== nextW) canvas.width = nextW;
    if (canvas.height !== nextH) canvas.height = nextH;

    // manter o CSS via layout (Tailwind/estilo), sem travar em px no inline
    const ctx = canvas.getContext("2d", { alpha: false });
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    sizeRef.current = { width: cssWidth, height: cssHeight };
    options?.onResize?.(sizeRef.current);
  }, [canvasRef, options]);

  useEffect(() => {
    resize();

    const onWindowResize = () => requestAnimationFrame(resize);
    window.addEventListener("resize", onWindowResize);
    window.addEventListener("orientationchange", onWindowResize);

    const vv = window.visualViewport;
    vv?.addEventListener("resize", onWindowResize);

    const canvas = canvasRef.current;
    const ro = canvas
      ? new ResizeObserver(() => requestAnimationFrame(resize))
      : null;
    if (canvas && ro) ro.observe(canvas);

    return () => {
      window.removeEventListener("resize", onWindowResize);
      window.removeEventListener("orientationchange", onWindowResize);
      vv?.removeEventListener("resize", onWindowResize);
      ro?.disconnect();
    };
  }, [canvasRef, resize]);

  return { resizeCanvas: resize, sizeRef };
}

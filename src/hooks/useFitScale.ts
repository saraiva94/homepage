import { useEffect, useLayoutEffect, useMemo, useState } from "react";

type Options = {
  minScale?: number;
  maxScale?: number;
};

/**
 * Calcula um scale (CSS transform) para que o conteúdo caiba verticalmente no container.
 * Ideal para evitar scroll/corte em grids densos mantendo a hierarquia visual.
 */
export function useFitScale(
  containerEl: HTMLElement | null,
  contentEl: HTMLElement | null,
  options: Options = {}
) {
  const { minScale = 0.82, maxScale = 1 } = options;
  const [scale, setScale] = useState(1);

  const depsKey = useMemo(
    () => `${minScale}:${maxScale}`,
    [minScale, maxScale]
  );

  const measure = () => {
    if (!containerEl || !contentEl) return;

    // Garantir medições com scale 1
    const prev = contentEl.style.transform;
    contentEl.style.transform = "scale(1)";

    const available = containerEl.clientHeight;
    const needed = contentEl.scrollHeight;

    contentEl.style.transform = prev;

    if (!available || !needed) return;

    const next = Math.max(minScale, Math.min(maxScale, available / needed));
    setScale(Number.isFinite(next) ? next : 1);
  };

  // Primeiro cálculo antes de pintar (evita flicker)
  useLayoutEffect(() => {
    measure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerEl, contentEl, depsKey]);

  useEffect(() => {
    if (!containerEl || !contentEl) return;

    const ro = new ResizeObserver(() => {
      // batch
      requestAnimationFrame(measure);
    });

    ro.observe(containerEl);
    ro.observe(contentEl);

    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerEl, contentEl, depsKey]);

  return scale;
}

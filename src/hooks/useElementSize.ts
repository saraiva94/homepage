import { useLayoutEffect, useRef, useState } from "react";

export type ElementSize = { w: number; h: number };

export function useElementSize<T extends HTMLElement>(enabled = true) {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState<ElementSize>({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;

    const measure = () => {
      // offset* = tamanho de layout (não muda com transform: scale())
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      if (w > 0 && h > 0) setSize({ w, h });
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);

    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("resize", measure);
      ro.disconnect();
    };
  }, [enabled]);

  return { ref, size } as const;
}

"use client";
import { useEffect } from "react";

export default function CursorTrail() {
  useEffect(() => {
    // limpa resíduos se hot reload
    document.querySelectorAll(".ct-circle").forEach((n) => n.remove());

    // >>> Seus parâmetros originais (INALTERADOS)
    const COUNT = 40, SIZE = 30, STIFFNESS = 0.20, BLUR = 8;

    const circles: HTMLElement[] = [];
    const coords = { x: innerWidth / 2, y: innerHeight / 2 };
    const pos = Array.from({ length: COUNT }, () => ({ x: coords.x, y: coords.y }));

    let huePhase = 0;
    let lastX = coords.x, lastY = coords.y;

    const frag = document.createDocumentFragment();
    for (let i = 0; i < COUNT; i++) {
      const c = document.createElement("div");
      c.className = "ct-circle";
      // garantimos estilo base aqui pra não depender de CSS:
      c.style.position = "fixed";
      c.style.top = "0";
      c.style.left = "0";
      c.style.width = `${SIZE}px`;
      c.style.height = `${SIZE}px`;
      c.style.borderRadius = "9999px";
      c.style.filter = `blur(${BLUR}px)`;
      c.style.pointerEvents = "none";
      c.style.willChange = "transform, opacity, background";
      c.style.mixBlendMode = "screen";
      c.style.zIndex = "60";
      c.style.opacity = String(0.85 * (1 - i / COUNT));
      frag.appendChild(c);
      circles.push(c);
    }
    document.body.appendChild(frag);

    // alimenta posição + avança fase de cor só quando move
    const feed = (x: number, y: number) => {
      coords.x = x;
      coords.y = y;
      const dx = x - lastX, dy = y - lastY;
      const dist = Math.hypot(dx, dy);
      huePhase += dist * 0.03;  // cor só muda quando há movimento
      lastX = x; lastY = y;
    };

    // Mouse (desktop)
    const onMouseMove = (e: MouseEvent) => feed(e.clientX, e.clientY);

    // Pointer (suporta caneta/dedos em browsers modernos)
    const onPointerMove = (e: PointerEvent) => feed(e.clientX, e.clientY);

    // Touch (iOS/Android; em alguns casos só dispara quando você arrasta o dedo)
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      feed(t.clientX, t.clientY);
    };

    // opcional: posiciona na batida inicial do dedo/clique
    const onPointerDown = (e: PointerEvent) => feed(e.clientX, e.clientY);
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      feed(t.clientX, t.clientY);
    };

    // listeners passivos: não travam scroll no mobile
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });

    function animate() {
      let x = coords.x, y = coords.y;

      // base de cor (vermelho↔azul) controlada pela distância percorrida
      const baseT = (Math.sin(huePhase) + 1) / 2; // 0..1
      const baseHue = 0 + (220 - 0) * baseT;

      circles.forEach((circle, index) => {
        // posicione
        const half = SIZE / 2;
        circle.style.left = x - half + "px";
        circle.style.top  = y - half + "px";

        // escala do rastro (igual ao seu)
        const scale = (circles.length - index) / circles.length;
        circle.style.transform = `translateZ(0) scale(${scale})`;

        // gradiente com cauda
        const p = index / (circles.length - 1);
        const hue = (baseHue + p * 35) % 360;
        circle.style.backgroundImage = `radial-gradient(circle,
          hsla(${hue},95%,60%,0.9) 10%,
          hsla(${hue},95%,60%,0) 70%)`;

        // física do rastro (mesmo STIFFNESS)
        pos[index].x = x; pos[index].y = y;
        const next = pos[index + 1] ?? pos[0];
        x += (next.x - x) * STIFFNESS;
        y += (next.y - y) * STIFFNESS;
      });

      requestAnimationFrame(animate);
    }
    animate();

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("touchstart", onTouchStart);
      circles.forEach((c) => c.remove());
    };
  }, []);

  return null;
}

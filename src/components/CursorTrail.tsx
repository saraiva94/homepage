import { useEffect } from "react";

export default function CursorTrail() {
  useEffect(() => {
    document.querySelectorAll(".ct-circle").forEach((n) => n.remove());

    const COUNT = 40, SIZE = 30, STIFFNESS = 0.20, BLUR = 8;

    const circles: HTMLElement[] = [];
    // Inicializa fora da tela para evitar posicionamento incorreto no carregamento
    const coords = { x: -100, y: -100 };
    const pos = Array.from({ length: COUNT }, () => ({ x: coords.x, y: coords.y }));
    let hasUserInteracted = false;

    let huePhase = 0;
    let lastX = coords.x, lastY = coords.y;

    const frag = document.createDocumentFragment();
    for (let i = 0; i < COUNT; i++) {
      const c = document.createElement("div");
      c.className = "ct-circle";
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

    const feed = (x: number, y: number) => {
      if (!hasUserInteracted) {
        hasUserInteracted = true;
        // Inicializa todas as posições para a primeira interação
        pos.forEach(p => { p.x = x; p.y = y; });
        lastX = x;
        lastY = y;
      }
      coords.x = x;
      coords.y = y;
      const dx = x - lastX, dy = y - lastY;
      const dist = Math.hypot(dx, dy);
      huePhase += dist * 0.03;
      lastX = x; lastY = y;
    };

    const onMouseMove = (e: MouseEvent) => feed(e.clientX, e.clientY);
    const onPointerMove = (e: PointerEvent) => feed(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      feed(t.clientX, t.clientY);
    };
    const onPointerDown = (e: PointerEvent) => feed(e.clientX, e.clientY);
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      feed(t.clientX, t.clientY);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });

    function animate() {
      // Só anima se o usuário interagiu
      if (!hasUserInteracted) {
        requestAnimationFrame(animate);
        return;
      }

      let x = coords.x, y = coords.y;

      const baseT = (Math.sin(huePhase) + 1) / 2;
      const baseHue = 0 + (220 - 0) * baseT;

      circles.forEach((circle, index) => {
        const half = SIZE / 2;
        circle.style.left = x - half + "px";
        circle.style.top  = y - half + "px";

        const scale = (circles.length - index) / circles.length;
        circle.style.transform = `translateZ(0) scale(${scale})`;

        const p = index / (circles.length - 1);
        const hue = (baseHue + p * 35) % 360;
        circle.style.backgroundImage = `radial-gradient(circle,
          hsla(${hue},95%,60%,0.9) 10%,
          hsla(${hue},95%,60%,0) 70%)`;

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
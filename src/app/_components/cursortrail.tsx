"use client";
import { useEffect } from "react";

export default function CursorTrail() {
  useEffect(() => {
    document.querySelectorAll(".ct-circle").forEach((n) => n.remove());

    const COUNT = 40, SIZE = 30, STIFFNESS = 0.20, BLUR = 8;
    const circles: HTMLDivElement[] = [];
    const coords = { x: innerWidth / 2, y: innerHeight / 2 };
    const pos = Array.from({ length: COUNT }, () => ({ x: coords.x, y: coords.y }));

    let huePhase = 0;
    let lastX = coords.x, lastY = coords.y;

    const frag = document.createDocumentFragment();
    for (let i = 0; i < COUNT; i++) {
      const c = document.createElement("div");
      c.className = "ct-circle";
      c.style.width = `${SIZE}px`;
      c.style.height = `${SIZE}px`;
      c.style.filter = `blur(${BLUR}px)`;
      c.style.opacity = String(0.85 * (1 - i / COUNT));
      frag.appendChild(c);
      circles.push(c);
    }
    document.body.appendChild(frag);

    const onMove = (e: MouseEvent) => {
      coords.x = e.clientX;
      coords.y = e.clientY;
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      const dist = Math.hypot(dx, dy);
      huePhase += dist * 0.03;      // cor só muda quando move
      lastX = e.clientX; lastY = e.clientY;
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    function animate() {
      let x = coords.x, y = coords.y;

      const baseT = (Math.sin(huePhase) + 1) / 2;     // 0..1
      const baseHue = 0 + (220 - 0) * baseT;          // vermelho↔azul

      circles.forEach((circle, index) => {
        circle.style.left = x - SIZE / 2 + "px";
        circle.style.top  = y - SIZE / 2 + "px";
        const scale = (circles.length - index) / circles.length;
        circle.style.transform = `scale(${scale})`;

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
      window.removeEventListener("mousemove", onMove);
      circles.forEach((c) => c.remove());
    };
  }, []);

  return null;
}

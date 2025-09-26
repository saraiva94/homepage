"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import AOS from "aos"; // ✅ único import
// ❌ NÃO importe "aos/dist/aos.css" aqui

gsap.registerPlugin(ScrollTrigger);

// ---------- CONFIG ----------
const FRAME_START = 1;
const FRAME_END   = 300;
const TOTAL_FRAMES = FRAME_END - FRAME_START + 1;

const FRAMES_DIR = "/background/sunset_timeline";
const FRAME_BASENAME = "Neon_sunset_timeline";
const FRAME_EXT = "jpg";

const frameURL = (idx0: number) => {
  const n = FRAME_START + idx0;
  const filename = `${FRAME_BASENAME}${String(n).padStart(3, "0")}.${FRAME_EXT}`;
  return encodeURI(`${FRAMES_DIR}/${filename}`);
};

const videos = [
  "adobe.mp4","adobe.mp4","adobe.mp4","adobe.mp4",
  "adobe.mp4","adobe.mp4","adobe.mp4","adobe.mp4",
];

export default function EditsPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const imagesRef = useRef<HTMLImageElement[]>([]);
  const stateRef  = useRef({ frame: 0, count: TOTAL_FRAMES });

  // ---- AOS ----
  useEffect(() => {
    AOS.init({ once: true, duration: 700, easing: "ease-out-cubic", offset: 100 });
  }, []);

  // ---- Lenis + sync ----
  useEffect(() => {
    const lenis = new Lenis({ smoothWheel: true, lerp: 0.12 });

    let rafId = 0;
    const raf = (t: number) => {
      lenis.raf(t);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    // tipagem do handler bate com o que o Lenis espera
    lenis.on('scroll', () => {
      ScrollTrigger.update();
    });

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy(); // ✅ sem any, método existe no tipo
    };
  }, []);

  // ---- Canvas DPR + cover ----
  const setupCanvas = () => {
    const canvas = canvasRef.current!;
    const ctx = (ctxRef.current ||= canvas.getContext("2d"));
    if (!ctx) return;

    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    canvas.width = Math.floor(vw * dpr);
    canvas.height = Math.floor(vh * dpr);
    canvas.style.width = `${vw}px`;
    canvas.style.height = `${vh}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const render = () => {
    const ctx = ctxRef.current!;
    const canvas = canvasRef.current!;
    if (!ctx || !canvas) return;

    const img = imagesRef.current[stateRef.current.frame];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    ctx.clearRect(0, 0, cw, ch);

    const canvasAspect = cw / ch;
    const imageAspect = img.naturalWidth / img.naturalHeight;

    let dw = cw, dh = ch, dx = 0, dy = 0;
    if (imageAspect > canvasAspect) {
      dh = ch; dw = dh * imageAspect; dx = (cw - dw) / 2;
    } else {
      dw = cw; dh = dw / imageAspect; dy = (ch - dh) / 2;
    }
    ctx.drawImage(img, dx, dy, dw, dh);
  };

  // ---- Preload a partir do /public ----
  useEffect(() => {
    const urls = Array.from({ length: TOTAL_FRAMES }, (_, i) => frameURL(i));
    imagesRef.current = new Array(urls.length);

    let remaining = urls.length;
    let first404Shown = false;

    for (let i = 0; i < urls.length; i++) {
      const img = new Image();
      img.decoding = "sync";
      img.src = urls[i];
      img.onload = img.onerror = () => {
        if (img.naturalWidth === 0 && !first404Shown) {
          first404Shown = true;
          console.warn("Algum frame retornou 404. Exemplo:", urls[i]);
        }
        remaining--;
        if (remaining === 0) {
          setupCanvas();
          stateRef.current.frame = 0;
          render();
          buildScroll();
        }
      };
      imagesRef.current[i] = img;
    }

    const onResize = () => { setupCanvas(); render(); ScrollTrigger.refresh(); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function buildScroll() {
    const durationPx = document.body.scrollHeight - window.innerHeight;
    ScrollTrigger.create({
      trigger: "body",
      start: "top top",
      end: `+=${durationPx}`,
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress;

        const targetFrame = Math.round(progress * (stateRef.current.count - 1));
        if (targetFrame !== stateRef.current.frame) {
          stateRef.current.frame = targetFrame;
          render();
        }

        if (headerRef.current) {
          if (progress <= 0.25) {
            const zProgress = progress / 0.25;
            const translateZ = -800 * zProgress;
            let opacity = 1;
            if (progress > 0.2) opacity = 1 - (progress - 0.2) / 0.05;
            gsap.set(headerRef.current, {
              transform: `translate(-50%,-50%) translateZ(${translateZ}px)`,
              opacity: Math.max(0, Math.min(1, opacity)),
            });
          } else {
            gsap.set(headerRef.current, { opacity: 0 });
          }
        }
      },
    });
  }

  return (
    <main className="relative bg-black text-white">
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full z-0"
        style={{ pointerEvents: "none" }}
      />
      <div
        ref={headerRef}
        className="absolute left-1/2 top-[12vh] -translate-x-1/2 -translate-y-1/2 text-center [transform-style:preserve-3d] z-10"
        style={{ opacity: 1 }}
      >
        <Link href="/" className="inline-block mb-6 rounded-md px-4 py-2 font-semibold
             border border-white bg-white text-black
             hover:bg-transparent hover:text-white transition">
          ← Voltar
        </Link>
        <h1 className="text-3xl md:text-5xl font-bold text-black">Edits</h1>
      </div>

      {[...videos].reverse().map((name, idx) => (
        <section key={idx} className="h-screen flex items-center justify-center">
          <div data-aos="zoom-in" className="w-[min(92vw,1000px)] px-6">
            <h3 className="text-xl font-semibold mb-3">Projeto {videos.length - idx}</h3>
            <video controls className="w-full rounded-2xl border border-white/10 shadow-2xl">
              <source src={`/videos/${name}`} type="video/mp4" />
            </video>
          </div>
        </section>
      ))}

      <section className="h-screen flex items-center justify-center">
        <div data-aos="zoom-in" className="w-[min(92vw,1000px)] px-6 text-center">
          <h3 className="text-xl font-semibold mb-3">Quer ver mais?</h3>
          <p className="opacity-80 mb-4">Faça contato</p>
          <div className="flex justify-center gap-4">
            <Link href="/" className="inline-block rounded-md bg-white text-black px-4 py-2 font-semibold hover:bg-gray-100 transition">
              Voltar à Home
            </Link>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="inline-block rounded-md bg-gray-700 text-white px-4 py-2 font-semibold hover:bg-gray-600 transition"
            >
              Início
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

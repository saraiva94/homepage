import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const FRAME_START = 1;
const FRAME_END = 300;
const TOTAL_FRAMES = FRAME_END - FRAME_START + 1;

const FRAMES_DIR = "/background/sunset_timeline";
const FRAME_BASENAME = "Neon_sunset_timeline";
const FRAME_EXT = "jpg";

const frameURL = (idx0: number) => {
  const n = FRAME_START + idx0;
  const filename = `${FRAME_BASENAME}${String(n).padStart(3, "0")}.${FRAME_EXT}`;
  return encodeURI(`${FRAMES_DIR}/${filename}`);
};

const videos = ["Dieta_animal.mp4", "Groppaverso.mp4", "Propagandas.mp4"];

export default function EditsPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const stateRef = useRef({ frame: 0, count: TOTAL_FRAMES });

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

  useEffect(() => {
    const urls = Array.from({ length: TOTAL_FRAMES }, (_, i) => frameURL(i));
    imagesRef.current = new Array(urls.length);

    let remaining = urls.length;

    for (let i = 0; i < urls.length; i++) {
      const img = new Image();
      img.decoding = "sync";
      img.src = urls[i];
      img.onload = img.onerror = () => {
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
    return () => {
      window.removeEventListener("resize", onResize);
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  function buildScroll() {
    const totalVideos = videos.length + 1; // videos + footer
    
    // Pin the container for the entire scroll duration
    const st = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: () => `+=${(totalVideos + 1) * window.innerHeight}`,
      pin: true,
      scrub: 0.6,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const progress = self.progress;

        // Frame animation - background only
        const targetFrame = Math.round(progress * (stateRef.current.count - 1));
        if (targetFrame !== stateRef.current.frame) {
          stateRef.current.frame = targetFrame;
          render();
        }

        // Video sections animation - each video takes equal portion of scroll
        const progressPerVideo = 1 / totalVideos;

        videoRefs.current.forEach((videoEl, idx) => {
          if (!videoEl) return;

          const videoStart = idx * progressPerVideo;
          const videoEnd = videoStart + progressPerVideo;
          const videoEnterEnd = videoStart + progressPerVideo * 0.3;
          const videoExitStart = videoEnd - progressPerVideo * 0.3;

          if (progress < videoStart) {
            // Before this video - below viewport with depth
            gsap.set(videoEl, {
              y: "120%",
              opacity: 0,
              scale: 0.7,
              rotateX: 15,
            });
          } else if (progress >= videoStart && progress < videoEnterEnd) {
            // Entering - animate from bottom to center with depth
            const enterProgress = (progress - videoStart) / (videoEnterEnd - videoStart);
            const eased = 1 - Math.pow(1 - enterProgress, 3); // ease out
            gsap.set(videoEl, {
              y: `${120 - eased * 120}%`,
              opacity: eased,
              scale: 0.7 + eased * 0.3,
              rotateX: 15 - eased * 15,
            });
          } else if (progress >= videoEnterEnd && progress < videoExitStart) {
            // Visible - centered
            gsap.set(videoEl, {
              y: "0%",
              opacity: 1,
              scale: 1,
              rotateX: 0,
            });
          } else if (progress >= videoExitStart && progress < videoEnd) {
            // Exiting - animate from center to top with depth
            const exitProgress = (progress - videoExitStart) / (videoEnd - videoExitStart);
            const eased = Math.pow(exitProgress, 3); // ease in
            gsap.set(videoEl, {
              y: `${-eased * 120}%`,
              opacity: 1 - eased,
              scale: 1 - eased * 0.3,
              rotateX: -eased * 15,
            });
          } else {
            // After this video - above viewport
            gsap.set(videoEl, {
              y: "-120%",
              opacity: 0,
              scale: 0.7,
              rotateX: -15,
            });
          }
        });
      },
    });

    // QA/Fix: force a refresh after layout is stable so progress maps to scroll correctly.
    requestAnimationFrame(() => {
      st.refresh();
      ScrollTrigger.refresh();
    });
  }

  return (
    <main className="relative bg-black text-white">
      {/* Pinned container - this gets pinned by ScrollTrigger */}
      <div 
        ref={containerRef}
        className="relative h-screen w-full overflow-hidden"
        style={{ perspective: "1000px" }}
      >
        {/* Background canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full z-0"
          style={{ pointerEvents: "none" }}
        />

        {/* Header - fixed at top */}
        <div
          ref={headerRef}
          className="absolute left-1/2 top-8 -translate-x-1/2 text-center z-30"
        >
          <Link 
            to="/" 
            className="inline-block rounded-md px-4 py-2 font-semibold
              border border-white bg-white text-black
              hover:bg-transparent hover:text-white transition"
          >
            ← Voltar
          </Link>
        </div>

        {/* Video sections */}
        {[...videos].reverse().map((name, idx) => (
          <div
            key={idx}
            ref={el => { videoRefs.current[idx] = el; }}
            className="absolute inset-0 flex items-center justify-center z-20"
            style={{ 
              transform: "translateY(120%)", 
              opacity: 0,
              transformStyle: "preserve-3d"
            }}
          >
            <div className="w-[min(92vw,1000px)] px-6">
              <video 
                controls 
                className="w-full rounded-2xl border border-white/10 shadow-2xl"
              >
                <source src={`/videos/${name}`} type="video/mp4" />
              </video>
            </div>
          </div>
        ))}

        {/* Footer section */}
        <div 
          className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
          style={{ 
            opacity: 0,
            transform: "translateY(120%)",
            transformStyle: "preserve-3d"
          }}
          ref={el => {
            if (el) {
              videoRefs.current[videos.length] = el;
            }
          }}
        >
          <div className="w-[min(92vw,1000px)] px-6 text-center pointer-events-auto">
            <h3 className="text-xl font-semibold mb-3">Quer ver mais?</h3>
            <p className="opacity-80 mb-4">Faça contato</p>
            <div className="flex justify-center gap-4">
              <Link 
                to="/" 
                className="inline-block rounded-md bg-white text-black px-4 py-2 font-semibold hover:bg-gray-100 transition"
              >
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
        </div>
      </div>
      
      {/* Scroll spacer - creates scrollable area for ScrollTrigger */}
      <div style={{ height: `${(videos.length + 2) * 100}vh` }} aria-hidden="true" />
    </main>
  );
}

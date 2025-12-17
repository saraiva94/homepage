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
    const totalVideos = videos.length;
    const totalSections = totalVideos + 2; // header + videos + footer
    
    // Pin the container for the entire scroll duration
    ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: `+=${totalSections * 100}vh`,
      pin: true,
      scrub: 0.5,
      onUpdate: (self) => {
        const progress = self.progress;

        // Frame animation
        const targetFrame = Math.round(progress * (stateRef.current.count - 1));
        if (targetFrame !== stateRef.current.frame) {
          stateRef.current.frame = targetFrame;
          render();
        }

        // Header animation (first 15% of scroll)
        if (headerRef.current) {
          if (progress <= 0.15) {
            const headerProgress = progress / 0.15;
            const translateZ = -500 * headerProgress;
            const opacity = progress > 0.1 ? 1 - (progress - 0.1) / 0.05 : 1;
            gsap.set(headerRef.current, {
              transform: `translate(-50%,-50%) translateZ(${translateZ}px)`,
              opacity: Math.max(0, Math.min(1, opacity)),
            });
          } else {
            gsap.set(headerRef.current, { opacity: 0 });
          }
        }

        // Video sections animation
        const videoStartProgress = 0.15;
        const videoEndProgress = 0.85;
        const videoTotalProgress = videoEndProgress - videoStartProgress;
        const progressPerVideo = videoTotalProgress / totalVideos;

        videoRefs.current.forEach((videoEl, idx) => {
          if (!videoEl) return;

          const videoStart = videoStartProgress + idx * progressPerVideo;
          const videoEnd = videoStart + progressPerVideo;
          const videoMid = videoStart + progressPerVideo * 0.5;

          if (progress < videoStart) {
            // Before this video - below viewport
            gsap.set(videoEl, { 
              y: "100vh", 
              opacity: 0,
              scale: 0.8
            });
          } else if (progress >= videoStart && progress < videoMid) {
            // Entering - animate from bottom to center
            const enterProgress = (progress - videoStart) / (videoMid - videoStart);
            gsap.set(videoEl, { 
              y: `${100 - enterProgress * 100}vh`, 
              opacity: enterProgress,
              scale: 0.8 + enterProgress * 0.2
            });
          } else if (progress >= videoMid && progress < videoEnd) {
            // Exiting - animate from center to top
            const exitProgress = (progress - videoMid) / (videoEnd - videoMid);
            gsap.set(videoEl, { 
              y: `${-exitProgress * 100}vh`, 
              opacity: 1 - exitProgress,
              scale: 1 - exitProgress * 0.2
            });
          } else {
            // After this video - above viewport
            gsap.set(videoEl, { 
              y: "-100vh", 
              opacity: 0,
              scale: 0.8
            });
          }
        });
      },
    });
  }

  return (
    <main className="relative bg-black text-white">
      {/* Scroll spacer */}
      <div style={{ height: `${(videos.length + 2) * 100}vh` }} />
      
      {/* Pinned container */}
      <div 
        ref={containerRef}
        className="fixed inset-0 w-full h-screen overflow-hidden"
        style={{ perspective: "1000px" }}
      >
        {/* Background canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full z-0"
          style={{ pointerEvents: "none" }}
        />

        {/* Header */}
        <div
          ref={headerRef}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10"
          style={{ transformStyle: "preserve-3d" }}
        >
          <Link 
            to="/" 
            className="inline-block mb-6 rounded-md px-4 py-2 font-semibold
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
            style={{ transform: "translateY(100vh)", opacity: 0 }}
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
            transform: "translateY(100vh)"
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
    </main>
  );
}

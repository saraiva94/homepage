/**
 * Dev Portfolio Page - Versão Otimizada
 * - Dynamic imports para GSAP/Lenis
 * - Progressive frame loading
 */

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useOptimizedPreload } from "@/hooks/useOptimizedPreload";

const loadGSAP = () => import('gsap');
const loadScrollTrigger = () => import('gsap/ScrollTrigger');
const loadScrollToPlugin = () => import('gsap/ScrollToPlugin');
const loadLenis = () => import('lenis');

const TOTAL_FRAMES = 261;
const MAX_VIDEOS = 8;

interface Video {
  id: string;
  video_url: string;
  display_order: number;
}

export default function DevPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);
  const [gsapLoaded, setGsapLoaded] = useState(false);
  const [scrollInitialized, setScrollInitialized] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const containerRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLDivElement | null)[]>([]);
  const endButtonRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({ frame: 0 });
  const scrollTriggerRef = useRef<any>(null);
  const lenisRef = useRef<any>(null);
  const gsapRef = useRef<any>(null);

  const { images, isLoading: isLoadingFrames, progress, loadedFrames, loadFrames } = useOptimizedPreload({
    totalFrames: TOTAL_FRAMES,
    portfolioType: 'dev',
    batchSize: 15,
    priority: 'high',
    enableCache: true,
  });

  useEffect(() => {
    supabase.from("portfolio_videos").select("*").eq("portfolio_type", "dev").order("display_order").limit(MAX_VIDEOS)
      .then(({ data }) => { setVideos(data || []); setIsLoadingVideos(false); });
  }, []);

  useEffect(() => {
    Promise.all([loadGSAP(), loadScrollTrigger(), loadScrollToPlugin(), loadLenis()]).then(([g, st, sp, l]) => {
      const gsap = g.gsap || g.default;
      gsap.registerPlugin(st.ScrollTrigger || st.default, sp.ScrollToPlugin || sp.default);
      gsapRef.current = gsap;
      const lenis = new (l.default)({ smoothWheel: true, lerp: 0.1 });
      lenis.on("scroll", (st.ScrollTrigger || st.default).update);
      gsap.ticker.add((t: number) => lenis.raf(t * 1000));
      lenisRef.current = lenis;
      setGsapLoaded(true);
    });
    return () => { lenisRef.current?.destroy(); };
  }, []);

  useEffect(() => { if (!isLoadingVideos && videos.length > 0) loadFrames(); }, [isLoadingVideos, videos.length, loadFrames]);

  useEffect(() => {
    if (!gsapLoaded || isLoadingFrames || images.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;
    ctxRef.current = ctx;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const render = () => {
      const img = images[stateRef.current.frame];
      if (!img?.complete) return;
      const cw = canvas.clientWidth, ch = canvas.clientHeight;
      ctx.clearRect(0, 0, cw, ch);
      const r = img.naturalWidth / img.naturalHeight, cr = cw / ch;
      const [dw, dh] = r > cr ? [ch * r, ch] : [cw, cw / r];
      ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    };

    stateRef.current.frame = 0;
    render();

    const gsap = gsapRef.current, ST = gsap.ScrollTrigger;
    const scrollEnd = window.innerHeight * (1 + videos.length + 0.5);
    scrollTriggerRef.current = ST.create({
      trigger: containerRef.current, start: "top top", end: `+=${scrollEnd}`, pin: true, scrub: 1,
      onUpdate: (self: any) => {
        const p = self.progress;
        const f = Math.round(p * (TOTAL_FRAMES - 1));
        if (f !== stateRef.current.frame && images[f]) { stateRef.current.frame = f; requestAnimationFrame(render); }
        if (headerRef.current) gsap.set(headerRef.current, { opacity: Math.max(0, 1 - p / 0.12), pointerEvents: p > 0.1 ? "none" : "auto" });
        if (scrollHintRef.current) gsap.set(scrollHintRef.current, { opacity: 1 - Math.min(1, p / 0.08), y: Math.min(1, p / 0.08) * 100 });
        const ppv = 0.95 / videos.length;
        videoRefs.current.forEach((el, i) => {
          if (!el) return;
          const vs = i * ppv, ve = vs + ppv, ee = vs + ppv * 0.4, es = ve - ppv * 0.35;
          if (p < vs) gsap.set(el, { y: "-60%", opacity: 0, scale: 0.3 });
          else if (p < ee) { const t = (p - vs) / (ee - vs); gsap.set(el, { y: `${-60 + t * 60}%`, opacity: t, scale: 0.3 + t * 0.7 }); }
          else if (p < es) gsap.set(el, { y: "0%", opacity: 1, scale: 1 });
          else if (p <= ve) { const t = (p - es) / (ve - es); gsap.set(el, { y: `${t * 60}%`, opacity: 1 - t, scale: 1 + t * 0.8 }); }
          else gsap.set(el, { opacity: 0 });
        });
        if (endButtonRef.current) gsap.set(endButtonRef.current, { opacity: p >= 0.95 ? (p - 0.95) / 0.05 : 0, pointerEvents: p > 0.97 ? "auto" : "none" });
      },
    });
    setScrollInitialized(true);
    return () => { scrollTriggerRef.current?.kill(); };
  }, [gsapLoaded, isLoadingFrames, images.length, videos.length]);

  if (isLoadingVideos || !gsapLoaded) return <div className="w-screen h-screen bg-black flex items-center justify-center"><div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin" /></div>;
  if (!videos.length) return <div className="w-screen h-screen bg-black flex flex-col items-center justify-center gap-6"><p className="text-white text-xl">Nenhum vídeo</p><Link to="/" className="px-6 py-3 bg-white text-black rounded-full">Homepage</Link></div>;

  return (
    <main className="relative w-screen min-h-[100dvh] bg-black text-white overflow-hidden">
      <section ref={containerRef} className="relative w-screen h-[100dvh] overflow-hidden" style={{ perspective: "1000px" }}>
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0 bg-black" />
        {isLoadingFrames && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 w-[80%] max-w-md bg-black/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20"><p className="text-white text-center mb-3">Carregando: {loadedFrames}/{TOTAL_FRAMES}</p><div className="w-full h-2 bg-white/10 rounded-full"><div className="h-full bg-sky-400 transition-all" style={{ width: `${progress}%` }} /></div></div>}
        <div ref={headerRef} className="absolute left-1/2 top-4 sm:top-8 z-30" style={{ transform: "translateX(-50%)" }}><Link to="/" className="px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base font-bold bg-white text-black rounded-full hover:bg-white/90 transition-all border border-sky-400/60">Homepage</Link></div>
        <div ref={scrollHintRef} className="absolute bottom-6 sm:bottom-12 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 pointer-events-none"><span className="text-white text-xs sm:text-base font-semibold px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">Role para ver</span><svg className="w-6 h-6 sm:w-8 sm:h-8 text-white animate-bounce" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg></div>
        {scrollInitialized && videos.map((v, i) => <div key={v.id} ref={el => { videoRefs.current[i] = el; }} className="absolute inset-0 flex items-center justify-center z-20 px-2 sm:px-4" style={{ opacity: 0 }}><div className="w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-[1000px]"><video controls playsInline preload="none" className="w-full aspect-video max-h-[70dvh] sm:max-h-[80dvh] rounded-xl sm:rounded-2xl border border-white/20 shadow-2xl"><source src={v.video_url} type="video/mp4" /></video></div></div>)}
        <div ref={endButtonRef} className="absolute inset-0 flex flex-col sm:flex-row items-center justify-center z-30 gap-3 sm:gap-4 px-4" style={{ opacity: 0, pointerEvents: "none" }}><Link to="/" className="px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-xl font-bold bg-white text-black rounded-full hover:bg-white/90 border border-sky-400/60 pointer-events-auto w-full sm:w-auto text-center">Homepage</Link><button onClick={() => gsapRef.current?.to(window, { scrollTo: { y: 0 }, duration: 2, ease: "power2.inOut" })} className="px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-xl font-bold bg-black/60 text-white rounded-full border border-white/40 backdrop-blur-sm pointer-events-auto w-full sm:w-auto text-center">Voltar ao início</button></div>
      </section>
    </main>
  );
}

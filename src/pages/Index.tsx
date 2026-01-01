import { useEffect } from "react";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import CursorTrail from "@/components/CursorTrail";
import homepageBg from "@/assets/homepage-bg.png";
import { preloadAllPortfolios } from "@/utils/preloadPortfolioFrames";

export default function Index() {
  // Pré-carrega os frames dos portfolios (não bloqueia render)
  useEffect(() => {
    const timer = setTimeout(() => {
      preloadAllPortfolios();
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="w-full min-h-[100dvh] overflow-x-hidden relative bg-cover bg-center bg-no-repeat flex flex-col"
      style={{
        backgroundImage: `url(${homepageBg})`,
      }}
    >
      <CursorTrail />

      <header className="w-full shrink-0">
        <Hero />
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div
          className="w-[80%] max-w-6xl"
          style={{ height: "clamp(520px, 78vh, 920px)" }}
        >
          <About />
        </div>
      </main>
    </div>
  );
}


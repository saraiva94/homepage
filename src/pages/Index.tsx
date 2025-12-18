import { lazy, Suspense, useEffect, useState } from "react";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { usePrefetchPortfolioFrames } from "@/hooks/usePrefetchPortfolioFrames";
import { PageTransition } from "@/components/PageTransition";
import homepageBg from "@/assets/homepage-bg.png";

// CursorTrail lazy loaded - não crítico para primeira pintura
const CursorTrail = lazy(() => import("@/components/CursorTrail"));

export default function Index() {
  const [showEffects, setShowEffects] = useState(false);

  // Prefetch frames dos portfolios em background após homepage carregar
  // Delay de 1.5s para garantir que homepage está totalmente renderizada
  usePrefetchPortfolioFrames(1500);

  // Defer visual effects until after first paint
  useEffect(() => {
    const timer = setTimeout(() => setShowEffects(true), 150);
    return () => clearTimeout(timer);
  }, []);

  return (
    <PageTransition>
      <div 
        className="min-h-screen relative bg-cover bg-center bg-fixed"
        style={{ backgroundImage: `url(${homepageBg})` }}
      >
        {showEffects && (
          <Suspense fallback={null}>
            <CursorTrail />
          </Suspense>
        )}
        <Hero />
        <About />
      </div>
    </PageTransition>
  );
}

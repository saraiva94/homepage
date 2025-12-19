import { lazy, Suspense, useEffect, useState } from "react";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import homepageBg from "@/assets/homepage-bg.png";

// CursorTrail lazy loaded - não crítico para primeira pintura
const CursorTrail = lazy(() => import("@/components/CursorTrail"));

export default function Index() {
  const [showEffects, setShowEffects] = useState(false);

  // Defer visual effects until after first paint
  useEffect(() => {
    const timer = setTimeout(() => setShowEffects(true), 150);
    return () => clearTimeout(timer);
  }, []);

  return (
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
  );
}

import { useEffect } from "react";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import CursorTrail from "@/components/CursorTrail";
import homepageBg from "@/assets/homepage-bg.png";
import { preloadAllPortfolios } from "@/utils/preloadPortfolioFrames";

export default function Index() {
  // Pré-carrega os frames dos portfolios enquanto o usuário está na homepage
  useEffect(() => {
    // Aguarda um pouco para não competir com o carregamento inicial da página
    const timer = setTimeout(() => {
      preloadAllPortfolios();
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className="min-h-screen relative bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${homepageBg})` }}
    >
      <CursorTrail />
      <Hero />
      <About />
    </div>
  );
}
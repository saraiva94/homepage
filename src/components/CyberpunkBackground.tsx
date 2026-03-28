/**
 * ========================================
 * CYBERPUNK BACKGROUND INTERATIVO
 * ========================================
 * 
 * Fundo cyberpunk com:
 * - Background original com opacidade
 * - Partículas flutuantes brilhantes com hover
 * - Cores cyberpunk (roxo, azul, ciano, rosa)
 */

import { memo, useMemo } from 'react';
import homepageBg from "@/assets/homepage-bg.png";

interface CyberpunkBackgroundProps {
  className?: string;
}

// Função para gerar número pseudo-aleatório determinístico baseado em seed
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

export const CyberpunkBackground = memo(function CyberpunkBackground({ 
  className = '' 
}: CyberpunkBackgroundProps) {
  
  // Gera partículas com posições estáveis (não mudam entre re-renders)
  const particles = useMemo(() => {
    const colors = [
      'rgba(59, 130, 246, 1)',   // Azul
      'rgba(236, 72, 153, 0.9)', // Rosa
      'rgba(6, 182, 212, 1)',    // Ciano
      'rgba(139, 92, 246, 0.9)', // Roxo
      'rgba(34, 197, 94, 0.8)',  // Verde
    ];
    
    return Array.from({ length: 400 }).map((_, i) => {
      const color = colors[i % 5];
      const size = i % 10 === 0 ? 5 : i % 7 === 0 ? 4 : i % 5 === 0 ? 3 : i % 3 === 0 ? 2 : 1;
      const hasGlow = i % 4 === 0;
      const hasIntenseGlow = i % 10 === 0;
      const floatDirection = (i % 6) + 1;
      
      // Posições determinísticas baseadas no índice
      const left = seededRandom(i * 1.1) * 100;
      const top = seededRandom(i * 2.2) * 100;
      const delay = seededRandom(i * 3.3) * 10;
      const duration = 4 + seededRandom(i * 4.4) * 6;
      
      return {
        id: i,
        color,
        size,
        hasGlow,
        hasIntenseGlow,
        floatDirection,
        left,
        top,
        delay,
        duration,
      };
    });
  }, []);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`} style={{ pointerEvents: 'none', zIndex: 0 }}>
      {/* Background original com 70% opacidade */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-70 pointer-events-none"
        style={{
          backgroundImage: `url(${homepageBg})`,
        }}
      />

      {/* Overlay escuro para contraste */}
      <div 
        className="absolute inset-0 bg-black/30 pointer-events-none"
      />

      {/* Partículas com animação de flutuação e ciclo de vida */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p) => (
          <div
            key={`p-${p.id}`}
            className={`absolute rounded-full transition-[transform,filter] duration-300 cursor-default hover:scale-[3] hover:brightness-[2] animate-float-${p.floatDirection}`}
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              boxShadow: p.hasIntenseGlow 
                ? `0 0 ${p.size * 3}px ${p.color}, 0 0 ${p.size * 6}px ${p.color}, 0 0 ${p.size * 10}px ${p.color}` 
                : p.hasGlow 
                  ? `0 0 ${p.size * 2}px ${p.color}, 0 0 ${p.size * 4}px ${p.color}` 
                  : `0 0 ${p.size}px ${p.color}`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Glow corners - Azul e Rosa */}
      <div 
        className="absolute top-0 left-0 w-[500px] h-[500px] opacity-40 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at top left, rgba(59, 130, 246, 0.5) 0%, transparent 50%)'
        }}
      />
      <div 
        className="absolute bottom-0 right-0 w-[500px] h-[500px] opacity-40 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at bottom right, rgba(236, 72, 153, 0.4) 0%, transparent 50%)'
        }}
      />
      <div 
        className="absolute top-0 right-0 w-80 h-80 opacity-30 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at top right, rgba(6, 182, 212, 0.4) 0%, transparent 50%)'
        }}
      />
      <div 
        className="absolute bottom-0 left-0 w-80 h-80 opacity-30 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at bottom left, rgba(139, 92, 246, 0.4) 0%, transparent 50%)'
        }}
      />

      {/* Vignette overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, transparent 50%, rgba(0, 0, 0, 0.6) 100%)'
        }}
      />
    </div>
  );
});

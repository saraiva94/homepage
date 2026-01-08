/**
 * ========================================
 * CYBERPUNK BACKGROUND INTERATIVO
 * ========================================
 * 
 * Fundo cyberpunk com:
 * - Background original com opacidade
 * - Partículas flutuantes brilhantes
 * - Cores cyberpunk (roxo, azul, ciano, rosa)
 */

import { memo } from 'react';
import homepageBg from "@/assets/homepage-bg.png";

interface CyberpunkBackgroundProps {
  className?: string;
}

export const CyberpunkBackground = memo(function CyberpunkBackground({ 
  className = '' 
}: CyberpunkBackgroundProps) {
  return (
    <div className={`fixed inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Background original com 40% opacidade */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
        style={{
          backgroundImage: `url(${homepageBg})`,
        }}
      />

      {/* Overlay escuro para contraste */}
      <div 
        className="absolute inset-0 bg-black/50"
      />

      {/* Partículas flutuantes - 400 partículas com brilho intenso */}
      <div className="absolute inset-0">
        {Array.from({ length: 400 }).map((_, i) => {
          const colors = [
            'rgba(59, 130, 246, 1)',   // Azul
            'rgba(236, 72, 153, 0.9)', // Rosa
            'rgba(6, 182, 212, 1)',    // Ciano
            'rgba(139, 92, 246, 0.9)', // Roxo
            'rgba(34, 197, 94, 0.8)',  // Verde
          ];
          const color = colors[i % 5];
          const size = i % 10 === 0 ? 5 : i % 7 === 0 ? 4 : i % 5 === 0 ? 3 : i % 3 === 0 ? 2 : 1;
          const hasGlow = i % 4 === 0;
          const hasIntenseGlow = i % 10 === 0;
          
          return (
            <div
              key={`p-${i}`}
              className="absolute rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor: color,
                boxShadow: hasIntenseGlow 
                  ? `0 0 ${size * 3}px ${color}, 0 0 ${size * 6}px ${color}, 0 0 ${size * 10}px ${color}` 
                  : hasGlow 
                    ? `0 0 ${size * 2}px ${color}, 0 0 ${size * 4}px ${color}` 
                    : `0 0 ${size}px ${color}`,
                animationDelay: `${Math.random() * 10}s`,
                animationDuration: `${2 + Math.random() * 6}s`,
              }}
            />
          );
        })}
      </div>

      {/* Glow corners - Azul e Rosa */}
      <div 
        className="absolute top-0 left-0 w-[500px] h-[500px] opacity-40"
        style={{
          background: 'radial-gradient(circle at top left, rgba(59, 130, 246, 0.5) 0%, transparent 50%)'
        }}
      />
      <div 
        className="absolute bottom-0 right-0 w-[500px] h-[500px] opacity-40"
        style={{
          background: 'radial-gradient(circle at bottom right, rgba(236, 72, 153, 0.4) 0%, transparent 50%)'
        }}
      />
      <div 
        className="absolute top-0 right-0 w-80 h-80 opacity-30"
        style={{
          background: 'radial-gradient(circle at top right, rgba(6, 182, 212, 0.4) 0%, transparent 50%)'
        }}
      />
      <div 
        className="absolute bottom-0 left-0 w-80 h-80 opacity-30"
        style={{
          background: 'radial-gradient(circle at bottom left, rgba(139, 92, 246, 0.4) 0%, transparent 50%)'
        }}
      />

      {/* Vignette overlay */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, transparent 50%, rgba(0, 0, 0, 0.6) 100%)'
        }}
      />
    </div>
  );
});

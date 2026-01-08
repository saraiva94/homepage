/**
 * ========================================
 * CYBERPUNK BACKGROUND INTERATIVO
 * ========================================
 * 
 * Fundo cyberpunk com:
 * - Grid animado (linhas verticais e horizontais)
 * - Partículas flutuantes
 * - Cores cyberpunk (roxo, azul, ciano, rosa)
 * - Efeitos sutis e não intrusivos
 */

import { memo } from 'react';

interface CyberpunkBackgroundProps {
  className?: string;
}

export const CyberpunkBackground = memo(function CyberpunkBackground({ 
  className = '' 
}: CyberpunkBackgroundProps) {
  return (
    <div className={`fixed inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Base gradient com azul e rosa */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.3) 0%, rgba(236, 72, 153, 0.2) 30%, rgba(139, 92, 246, 0.15) 50%, rgba(0, 0, 0, 0.98) 85%)'
        }}
      />

      {/* Grid de linhas verticais - MAIS LINHAS com cores azul/rosa/ciano */}
      <div className="absolute inset-0">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute top-0 bottom-0 w-px"
            style={{
              left: `${(i / 50) * 100}%`,
              background: i % 3 === 0 
                ? 'linear-gradient(to bottom, transparent, rgba(59, 130, 246, 0.5) 50%, transparent)'
                : i % 3 === 1
                  ? 'linear-gradient(to bottom, transparent, rgba(236, 72, 153, 0.4) 50%, transparent)'
                  : 'linear-gradient(to bottom, transparent, rgba(6, 182, 212, 0.45) 50%, transparent)',
              animation: `pulse 4s ease-in-out ${i * 0.1}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Grid de linhas horizontais com cores azul/rosa */}
      <div className="absolute inset-0">
        {Array.from({ length: 25 }).map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute left-0 right-0 h-px"
            style={{
              top: `${(i / 25) * 100}%`,
              background: i % 2 === 0
                ? 'linear-gradient(to right, transparent, rgba(59, 130, 246, 0.4) 50%, transparent)'
                : 'linear-gradient(to right, transparent, rgba(236, 72, 153, 0.35) 50%, transparent)',
              animation: `pulse 5s ease-in-out ${i * 0.15}s infinite`,
            }}
          />
        ))}
      </div>

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

      {/* Efeito de scan line */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(59, 130, 246, 0.8) 2px, rgba(59, 130, 246, 0.8) 4px)',
        }}
      />

      {/* Glow corners - Azul e Rosa */}
      <div 
        className="absolute top-0 left-0 w-[500px] h-[500px] opacity-60"
        style={{
          background: 'radial-gradient(circle at top left, rgba(59, 130, 246, 0.6) 0%, transparent 50%)'
        }}
      />
      <div 
        className="absolute bottom-0 right-0 w-[500px] h-[500px] opacity-60"
        style={{
          background: 'radial-gradient(circle at bottom right, rgba(236, 72, 153, 0.5) 0%, transparent 50%)'
        }}
      />
      <div 
        className="absolute top-0 right-0 w-80 h-80 opacity-40"
        style={{
          background: 'radial-gradient(circle at top right, rgba(6, 182, 212, 0.5) 0%, transparent 50%)'
        }}
      />
      <div 
        className="absolute bottom-0 left-0 w-80 h-80 opacity-40"
        style={{
          background: 'radial-gradient(circle at bottom left, rgba(139, 92, 246, 0.5) 0%, transparent 50%)'
        }}
      />

      {/* Central glow azul/rosa */}
      <div 
        className="absolute inset-0 opacity-25"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.2) 0%, rgba(236, 72, 153, 0.1) 30%, transparent 60%)'
        }}
      />

      {/* Vignette overlay */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, transparent 55%, rgba(0, 0, 0, 0.5) 100%)'
        }}
      />
    </div>
  );
});

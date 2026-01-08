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
      {/* Base gradient escuro */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.15) 0%, rgba(6, 182, 212, 0.1) 30%, rgba(0, 0, 0, 1) 70%)'
        }}
      />

      {/* Grid de linhas verticais */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent"
            style={{
              left: `${(i / 20) * 100}%`,
              animation: `pulse 4s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Grid de linhas horizontais */}
      <div className="absolute inset-0">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/10 to-transparent"
            style={{
              top: `${(i / 12) * 100}%`,
              animation: `pulse 5s ease-in-out ${i * 0.25}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Partículas flutuantes */}
      <div className="absolute inset-0">
        {Array.from({ length: 25 }).map((_, i) => (
          <div
            key={`p-${i}`}
            className="absolute w-1 h-1 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: i % 3 === 0 
                ? 'rgba(6, 182, 212, 0.4)' 
                : i % 3 === 1 
                  ? 'rgba(139, 92, 246, 0.4)' 
                  : 'rgba(236, 72, 153, 0.3)',
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${4 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Efeito de scan line sutil */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(6, 182, 212, 0.5) 2px, rgba(6, 182, 212, 0.5) 4px)',
        }}
      />

      {/* Vignette overlay */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, transparent 40%, rgba(0, 0, 0, 0.6) 100%)'
        }}
      />
    </div>
  );
});

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
      {/* Base gradient - MAIS BRILHANTE */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.35) 0%, rgba(6, 182, 212, 0.25) 40%, rgba(0, 0, 0, 0.95) 80%)'
        }}
      />

      {/* Grid de linhas verticais - MAIS BRILHANTE */}
      <div className="absolute inset-0">
        {Array.from({ length: 35 }).map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-cyan-400/40 to-transparent"
            style={{
              left: `${(i / 35) * 100}%`,
              animation: `pulse 4s ease-in-out ${i * 0.12}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Grid de linhas horizontais - MAIS BRILHANTE */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-400/35 to-transparent"
            style={{
              top: `${(i / 20) * 100}%`,
              animation: `pulse 5s ease-in-out ${i * 0.18}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Partículas flutuantes - 5X MAIS (200 partículas) */}
      <div className="absolute inset-0">
        {Array.from({ length: 200 }).map((_, i) => (
          <div
            key={`p-${i}`}
            className="absolute rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: i % 8 === 0 ? '4px' : i % 5 === 0 ? '3px' : i % 3 === 0 ? '2px' : '1px',
              height: i % 8 === 0 ? '4px' : i % 5 === 0 ? '3px' : i % 3 === 0 ? '2px' : '1px',
              backgroundColor: i % 4 === 0 
                ? 'rgba(6, 182, 212, 0.8)' 
                : i % 4 === 1 
                  ? 'rgba(139, 92, 246, 0.7)' 
                  : i % 4 === 2
                    ? 'rgba(236, 72, 153, 0.6)'
                    : 'rgba(34, 197, 94, 0.6)',
              boxShadow: i % 8 === 0 
                ? '0 0 10px currentColor, 0 0 20px currentColor' 
                : i % 5 === 0 
                  ? '0 0 8px currentColor' 
                  : 'none',
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${3 + Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Efeito de scan line - MAIS VISÍVEL */}
      <div 
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(6, 182, 212, 1) 2px, rgba(6, 182, 212, 1) 4px)',
        }}
      />

      {/* Glow corners - MAIORES E MAIS BRILHANTES */}
      <div 
        className="absolute top-0 left-0 w-96 h-96 opacity-50"
        style={{
          background: 'radial-gradient(circle at top left, rgba(6, 182, 212, 0.5) 0%, transparent 60%)'
        }}
      />
      <div 
        className="absolute bottom-0 right-0 w-96 h-96 opacity-50"
        style={{
          background: 'radial-gradient(circle at bottom right, rgba(139, 92, 246, 0.5) 0%, transparent 60%)'
        }}
      />
      <div 
        className="absolute top-0 right-0 w-64 h-64 opacity-30"
        style={{
          background: 'radial-gradient(circle at top right, rgba(236, 72, 153, 0.4) 0%, transparent 60%)'
        }}
      />
      <div 
        className="absolute bottom-0 left-0 w-64 h-64 opacity-30"
        style={{
          background: 'radial-gradient(circle at bottom left, rgba(34, 197, 94, 0.3) 0%, transparent 60%)'
        }}
      />

      {/* Central glow */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)'
        }}
      />

      {/* Vignette overlay - mais suave */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, transparent 60%, rgba(0, 0, 0, 0.4) 100%)'
        }}
      />
    </div>
  );
});

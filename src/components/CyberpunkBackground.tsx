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
      {/* Base gradient escuro com mais cor */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.25) 0%, rgba(6, 182, 212, 0.15) 35%, rgba(0, 0, 0, 1) 75%)'
        }}
      />

      {/* Grid de linhas verticais - MAIS VISÍVEL */}
      <div className="absolute inset-0">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent"
            style={{
              left: `${(i / 30) * 100}%`,
              animation: `pulse 4s ease-in-out ${i * 0.15}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Grid de linhas horizontais - MAIS VISÍVEL */}
      <div className="absolute inset-0">
        {Array.from({ length: 18 }).map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/25 to-transparent"
            style={{
              top: `${(i / 18) * 100}%`,
              animation: `pulse 5s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Partículas flutuantes - MAIS E MAIORES */}
      <div className="absolute inset-0">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={`p-${i}`}
            className="absolute rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: i % 5 === 0 ? '3px' : i % 3 === 0 ? '2px' : '1px',
              height: i % 5 === 0 ? '3px' : i % 3 === 0 ? '2px' : '1px',
              backgroundColor: i % 4 === 0 
                ? 'rgba(6, 182, 212, 0.7)' 
                : i % 4 === 1 
                  ? 'rgba(139, 92, 246, 0.6)' 
                  : i % 4 === 2
                    ? 'rgba(236, 72, 153, 0.5)'
                    : 'rgba(34, 197, 94, 0.5)',
              boxShadow: i % 5 === 0 ? '0 0 6px currentColor' : 'none',
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Efeito de scan line - MAIS VISÍVEL */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(6, 182, 212, 0.8) 2px, rgba(6, 182, 212, 0.8) 4px)',
        }}
      />

      {/* Glow corners */}
      <div 
        className="absolute top-0 left-0 w-64 h-64 opacity-30"
        style={{
          background: 'radial-gradient(circle at top left, rgba(6, 182, 212, 0.4) 0%, transparent 70%)'
        }}
      />
      <div 
        className="absolute bottom-0 right-0 w-64 h-64 opacity-30"
        style={{
          background: 'radial-gradient(circle at bottom right, rgba(139, 92, 246, 0.4) 0%, transparent 70%)'
        }}
      />

      {/* Vignette overlay - mais suave */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, transparent 50%, rgba(0, 0, 0, 0.5) 100%)'
        }}
      />
    </div>
  );
});

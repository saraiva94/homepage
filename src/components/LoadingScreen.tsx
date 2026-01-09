/**
 * ========================================
 * LOADING SCREEN CYBERPUNK
 * ========================================
 * 
 * Tela de carregamento com tema cyberpunk
 * Cores da identidade visual (roxo, azul, ciano)
 * Aparece ANTES do site carregar
 * Barra de progresso estilo hacker/matrix
 */

import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  onComplete?: () => void;
  minDuration?: number;
  progress?: number; // Se fornecido, usa progresso externo
  title?: string; // Título customizado (ex: "PORTFOLIO DEV")
  subtitle?: string; // Subtítulo customizado
}

export function LoadingScreen({ 
  onComplete, 
  minDuration = 2000,
  progress: externalProgress,
  title = 'SWAMIY',
  subtitle = 'PORTFOLIO'
}: LoadingScreenProps) {
  const [internalProgress, setInternalProgress] = useState(0);
  const [displayText, setDisplayText] = useState('INITIALIZING SYSTEM...');
  const [isComplete, setIsComplete] = useState(false);

  // Usa progresso externo se fornecido, senão usa interno
  const progress = externalProgress !== undefined ? externalProgress : internalProgress;

  useEffect(() => {
    // Se progresso externo, não anima internamente
    if (externalProgress !== undefined) {
      if (externalProgress >= 100 && !isComplete) {
        setIsComplete(true);
        setTimeout(() => {
          onComplete?.();
        }, 500);
      }
      return;
    }

    const startTime = Date.now();
    let animationFrame: number;
    let textInterval: ReturnType<typeof setInterval>;

    const loadingTexts = [
      'INITIALIZING SYSTEM...',
      'LOADING NEURAL NETWORK...',
      'CONNECTING TO MAINFRAME...',
      'DECRYPTING DATA...',
      'COMPILING MATRICES...',
      'SYNCHRONIZING PROTOCOLS...',
      'ESTABLISHING LINK...',
      'SYSTEM READY',
    ];

    let textIndex = 0;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const naturalProgress = Math.min((elapsed / minDuration) * 100, 100);
      const variance = Math.random() * 2;
      const newProgress = Math.min(naturalProgress + variance, 100);
      
      setInternalProgress(newProgress);

      const progressTextIndex = Math.floor((newProgress / 100) * (loadingTexts.length - 1));
      if (progressTextIndex !== textIndex && progressTextIndex < loadingTexts.length) {
        textIndex = progressTextIndex;
        setDisplayText(loadingTexts[textIndex]);
      }

      if (newProgress < 100) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setIsComplete(true);
        setTimeout(() => {
          onComplete?.();
        }, 500);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    textInterval = setInterval(() => {
      if (Math.random() > 0.9) {
        const glitchChars = '!@#$%^&*()_+{}|:<>?~';
        const randomGlitch = glitchChars[Math.floor(Math.random() * glitchChars.length)];
        setDisplayText(prev => {
          const chars = prev.split('');
          const randomIndex = Math.floor(Math.random() * chars.length);
          chars[randomIndex] = randomGlitch;
          return chars.join('');
        });
        
        setTimeout(() => {
          setDisplayText(loadingTexts[textIndex]);
        }, 50);
      }
    }, 200);

    return () => {
      cancelAnimationFrame(animationFrame);
      clearInterval(textInterval);
    };
  }, [onComplete, minDuration, externalProgress, isComplete]);

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black transition-opacity duration-500 ${
        isComplete ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Grid de fundo cyberpunk */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Linhas verticais */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent"
            style={{
              left: `${(i / 20) * 100}%`,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
        
        {/* Linhas horizontais */}
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent"
            style={{
              top: `${(i / 15) * 100}%`,
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>

      {/* Logo/Título */}
      <div className="relative z-10 mb-12">
        <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 animate-pulse-slow tracking-wider font-mono">
          {title}
        </h1>
        <div className="flex items-center justify-center gap-2 mt-2">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-cyan-400" />
          <p className="text-cyan-400 text-sm font-mono tracking-[0.3em]">{subtitle}</p>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-cyan-400" />
        </div>
      </div>

      {/* Container principal */}
      <div className="relative z-10 w-full max-w-2xl px-8">
        
        {/* Texto de status com efeito matrix */}
        <div className="mb-8 text-center">
          <p className="text-green-400 font-mono text-lg md:text-xl tracking-wider glitch-text">
            {displayText}
          </p>
          <div className="flex justify-center gap-1 mt-2">
            {[...Array(3)].map((_, i) => (
              <span
                key={i}
                className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>

        {/* Barra de progresso cyberpunk */}
        <div className="relative w-full">
          {/* Container da barra */}
          <div className="relative w-full h-6 bg-black border-2 border-cyan-500 rounded overflow-hidden shadow-[0_0_20px_rgba(6,182,212,0.5)]">
            
            {/* Grid overlay (fundo) */}
            <div className="absolute inset-0 w-full h-full grid grid-cols-[repeat(20,1fr)] pointer-events-none">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="border-r border-cyan-900/50 last:border-r-0 h-full" />
              ))}
            </div>

            {/* Barra de progresso animada */}
            <div
              className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-purple-600 via-cyan-500 to-pink-500 transition-all duration-300 ease-out"
              style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
            >
              {/* Efeito de scan line */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-scan-line" />
              
              {/* Brilho superior */}
              <div className="absolute inset-x-0 top-0 h-1 bg-white/50" />
            </div>
          </div>

          {/* Porcentagem */}
          <div className="flex justify-between items-center mt-3">
            <span className="text-cyan-400 font-mono text-sm">
              [{Math.floor(progress)}%]
            </span>
            <span className="text-purple-400 font-mono text-sm animate-pulse">
              ▓▓▓▓▓▓▓▓▓▓
            </span>
          </div>
        </div>

        {/* Detalhes técnicos (estilo hacker) */}
        <div className="mt-8 space-y-1 text-xs font-mono text-green-500/60">
          <div className="flex justify-between">
            <span>&gt; CPU: 100%</span>
            <span>RAM: {Math.floor(progress)}MB/100MB</span>
          </div>
          <div className="flex justify-between">
            <span>&gt; GPU: RENDERING</span>
            <span>NET: {progress > 50 ? 'STABLE' : 'CONNECTING'}</span>
          </div>
          <div>
            <span>&gt; STATUS: </span>
            <span className="text-cyan-400 animate-pulse">LOADING...</span>
          </div>
        </div>
      </div>

      {/* Partículas flutuantes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Canto inferior: versão do sistema */}
      <div className="absolute bottom-4 right-4 text-xs font-mono text-cyan-500/40">
        v4.2.1 | BUILD 2026.01.08
      </div>
    </div>
  );
}

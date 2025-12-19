interface SkeletonLoaderProps {
  progress: number;
  variant?: 'dev' | 'editor';
}

export function SkeletonLoader({ progress, variant = 'dev' }: SkeletonLoaderProps) {
  // Gradientes diferentes para cada portfolio
  const gradients = {
    dev: {
      primary: 'from-cyan-900/30 via-blue-900/20 to-purple-900/30',
      accent: 'bg-cyan-500/20',
      glow: 'rgba(6, 182, 212, 0.3)',
    },
    editor: {
      primary: 'from-orange-900/30 via-pink-900/20 to-purple-900/30',
      accent: 'bg-orange-500/20',
      glow: 'rgba(249, 115, 22, 0.3)',
    },
  };

  const theme = gradients[variant];

  return (
    <div className="fixed inset-0 w-full h-full min-h-screen bg-black flex flex-col items-center justify-center overflow-hidden z-50">
      {/* Background blur/gradient skeleton */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br ${theme.primary} animate-pulse`}
        style={{ animationDuration: '2s' }}
      />
      
      {/* Efeito de blur circular pulsante */}
      <div 
        className="absolute w-[600px] h-[600px] rounded-full blur-3xl opacity-30 animate-pulse"
        style={{ 
          background: `radial-gradient(circle, ${theme.glow} 0%, transparent 70%)`,
          animationDuration: '3s',
        }}
      />
      
      {/* Linhas de scan effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent animate-scan"
          style={{ 
            top: '30%',
            animationDuration: '2s',
          }}
        />
        <div 
          className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-white/5 to-transparent animate-scan"
          style={{ 
            top: '60%',
            animationDuration: '2.5s',
            animationDelay: '0.5s',
          }}
        />
      </div>

      {/* Skeleton do video player */}
      <div className="relative z-10 w-full max-w-[800px] px-8">
        <div 
          className={`aspect-video rounded-2xl ${theme.accent} backdrop-blur-sm border border-white/10 animate-pulse overflow-hidden`}
          style={{ animationDuration: '1.5s' }}
        >
          {/* Play button skeleton */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white/10 animate-pulse" />
          </div>
          
          {/* Bottom controls skeleton */}
          <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-white/10" />
            <div className="flex-1 h-1 rounded-full bg-white/10" />
            <div className="w-16 h-4 rounded bg-white/10" />
          </div>
        </div>
      </div>

      {/* Progress bar com design melhorado */}
      <div className="relative z-10 mt-8 flex flex-col items-center gap-3">
        <div className="relative w-56 h-1.5 bg-white/10 rounded-full overflow-hidden">
          {/* Glow effect */}
          <div 
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-300 ease-out"
            style={{ 
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${theme.glow}, white)`,
              boxShadow: `0 0 20px ${theme.glow}`,
            }}
          />
          {/* Shimmer effect */}
          <div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
            style={{ animationDuration: '1.5s' }}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-white/40 animate-pulse" />
          <span className="text-white/50 text-sm font-medium tracking-wider">
            {progress < 100 ? `${progress}%` : 'Iniciando...'}
          </span>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100vh); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
        .animate-shimmer {
          animation: shimmer 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

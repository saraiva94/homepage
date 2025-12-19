import { useMemo } from "react";

interface FrameFallbackProps {
  theme?: "sunset" | "tubular";
  loadProgress?: number;
  isVisible?: boolean;
}

/**
 * Fallback visual animado exibido enquanto os frames não carregaram
 * Mostra um gradiente animado que simula a estética do portfolio
 */
export function FrameFallback({ 
  theme = "sunset", 
  loadProgress = 0,
  isVisible = true 
}: FrameFallbackProps) {
  const gradientClasses = useMemo(() => {
    if (theme === "sunset") {
      return "from-orange-900/60 via-pink-800/40 to-purple-900/50";
    }
    return "from-cyan-900/60 via-blue-800/40 to-indigo-900/50";
  }, [theme]);

  if (!isVisible) return null;

  return (
    <div 
      className="absolute inset-0 z-10 pointer-events-none transition-opacity duration-500"
      style={{ opacity: loadProgress < 100 ? 1 : 0 }}
    >
      {/* Animated gradient background */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br ${gradientClasses} animate-pulse`}
        style={{ animationDuration: "2s" }}
      />
      
      {/* Animated shimmer overlay */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer"
          style={{ 
            animation: "shimmer 2s infinite",
          }}
        />
      </div>

      {/* Loading indicator in corner */}
      {loadProgress > 0 && loadProgress < 100 && (
        <div className="absolute bottom-6 right-6 flex items-center gap-3 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
          <div className="w-24 h-1 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white/70 rounded-full transition-all duration-300"
              style={{ width: `${loadProgress}%` }}
            />
          </div>
          <span className="text-white/60 text-xs font-mono">{loadProgress}%</span>
        </div>
      )}

      {/* Pulse circles for visual interest */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <div 
            className="w-32 h-32 rounded-full border border-white/10 animate-ping"
            style={{ animationDuration: "3s" }}
          />
          <div 
            className="absolute inset-0 w-32 h-32 rounded-full border border-white/5 animate-ping"
            style={{ animationDuration: "3s", animationDelay: "1s" }}
          />
        </div>
      </div>
    </div>
  );
}

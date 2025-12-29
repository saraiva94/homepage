import { useState, useEffect, useCallback } from "react";

export function useVideoPreloader(videoSrc: string, videoCount: number = 4) {
  const [allLoaded, setAllLoaded] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);

  const handleVideoLoaded = useCallback(() => {
    setLoadedCount((prev) => {
      const next = prev + 1;
      if (next >= videoCount) {
        setAllLoaded(true);
      }
      return next;
    });
  }, [videoCount]);

  return { allLoaded, loadedCount, handleVideoLoaded };
}

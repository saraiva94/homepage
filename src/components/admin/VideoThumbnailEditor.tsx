import { useState, useRef, useEffect } from "react";
import { Play, Pause, Camera, Save, Loader2, Film, X } from "lucide-react";
import { supabase } from "@/integrations/backend/client";

interface Video {
  id: string;
  video_url: string;
  display_order: number;
  portfolio_type: string;
  thumbnail_url: string | null;
  thumbnail_time: number | null;
}

interface Props {
  video: Video;
  onUpdate: (video: Video) => void;
  onClose: () => void;
}

export function VideoThumbnailEditor({ video, onUpdate, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentTime, setCurrentTime] = useState(video.thumbnail_time || 0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(video.thumbnail_url);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    const handleLoaded = () => {
      setDuration(vid.duration);
      vid.currentTime = video.thumbnail_time || 0;
    };

    const handleTimeUpdate = () => {
      setCurrentTime(vid.currentTime);
    };

    vid.addEventListener("loadedmetadata", handleLoaded);
    vid.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      vid.removeEventListener("loadedmetadata", handleLoaded);
      vid.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [video.thumbnail_time]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const captureFrame = () => {
    const vid = videoRef.current;
    const canvas = canvasRef.current;
    if (!vid || !canvas) return;

    // Pause video for clean capture
    vid.pause();
    setIsPlaying(false);

    canvas.width = vid.videoWidth;
    canvas.height = vid.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setPreviewUrl(dataUrl);
  };

  const saveThumb = async () => {
    if (!previewUrl) return;
    setIsSaving(true);

    try {
      let finalUrl = previewUrl;

      // If it's base64, upload to storage
      if (previewUrl.startsWith("data:")) {
        const res = await fetch(previewUrl);
        const blob = await res.blob();
        const filename = `thumb_${video.id}_${Date.now()}.jpg`;

        const { error: uploadError } = await supabase.storage
          .from("portfolio-videos")
          .upload(filename, blob, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("portfolio-videos")
          .getPublicUrl(filename);

        finalUrl = urlData.publicUrl;
      }

      const { error: dbError } = await supabase
        .from("portfolio_videos")
        .update({
          thumbnail_url: finalUrl,
          thumbnail_time: currentTime,
        })
        .eq("id", video.id);

      if (dbError) throw dbError;

      onUpdate({ ...video, thumbnail_url: finalUrl, thumbnail_time: currentTime });
      onClose();
    } catch (err: any) {
      alert("Erro ao salvar thumbnail: " + (err.message || "erro desconhecido"));
    } finally {
      setIsSaving(false);
    }
  };

  const formatTime = (t: number) => {
    const mins = Math.floor(t / 60);
    const secs = Math.floor(t % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const videoLabel = `${video.portfolio_type === "dev" ? "Dev" : "Editor"} — Vídeo ${video.display_order + 1}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-white/20 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Film className="w-5 h-5 text-purple-400" />
            Thumbnail: {videoLabel}
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition">
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Body - scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Video Player */}
          <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
            <video
              ref={videoRef}
              src={video.video_url}
              className="w-full h-full object-contain"
              crossOrigin="anonymous"
              preload="metadata"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="p-2.5 bg-white/10 hover:bg-white/20 rounded-lg transition shrink-0"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-white" />
              ) : (
                <Play className="w-5 h-5 text-white" />
              )}
            </button>

            <div className="flex-1">
              <input
                type="range"
                min={0}
                max={duration || 1}
                step={0.1}
                value={currentTime}
                onChange={handleSeek}
                className="w-full accent-purple-500"
              />
            </div>

            <span className="text-white/60 text-sm font-mono shrink-0">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Capture Button */}
          <button
            onClick={captureFrame}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition flex items-center justify-center gap-2 font-medium"
          >
            <Camera className="w-5 h-5" />
            Capturar Este Frame
          </button>

          {/* Preview */}
          {previewUrl && (
            <div className="space-y-2">
              <p className="text-white/60 text-sm">Preview da thumbnail:</p>
              <div className="aspect-video bg-black rounded-xl overflow-hidden max-w-xs border border-white/10">
                <img src={previewUrl} alt="Thumbnail preview" className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          {/* Hidden canvas */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex gap-3 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
          >
            Cancelar
          </button>
          <button
            onClick={saveThumb}
            disabled={!previewUrl || isSaving}
            className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition flex items-center justify-center gap-2"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar Thumbnail
          </button>
        </div>
      </div>
    </div>
  );
}

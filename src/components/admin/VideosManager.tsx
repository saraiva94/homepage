import { useState, useEffect } from "react";
import { Film, Image, Pencil, Check } from "lucide-react";
import { supabase } from "@/integrations/backend/client";
import { VideoThumbnailEditor } from "./VideoThumbnailEditor";

interface Video {
  id: string;
  video_url: string;
  display_order: number;
  portfolio_type: string;
  thumbnail_url: string | null;
  thumbnail_time: number | null;
}

export function VideosManager() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    const { data, error } = await supabase
      .from("portfolio_videos")
      .select("*")
      .order("portfolio_type")
      .order("display_order");

    if (error) {
      // fetch failed
    }
    setVideos((data as Video[]) || []);
    setIsLoading(false);
  };

  const handleUpdate = (updated: Video) => {
    setVideos((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
  };

  const devVideos = videos.filter((v) => v.portfolio_type === "dev");
  const editorVideos = videos.filter((v) => v.portfolio_type === "editor");

  if (isLoading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
        <div className="text-white/60 text-center py-8">Carregando vídeos...</div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Film className="w-5 h-5 text-purple-400" />
            Thumbnails dos Vídeos
          </h2>
        </div>

        {videos.length === 0 ? (
          <div className="text-white/40 text-center py-8">
            Nenhum vídeo cadastrado. Adicione vídeos nas abas "Editor" ou "Dev".
          </div>
        ) : (
          <div className="space-y-6">
            {/* Dev Videos */}
            {devVideos.length > 0 && (
              <div>
                <h3 className="text-white/80 font-medium mb-3 flex items-center gap-2">
                  <span className="w-3 h-3 bg-cyan-500 rounded-full" />
                  Portfolio Dev ({devVideos.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {devVideos.map((video) => (
                    <VideoCard
                      key={video.id}
                      video={video}
                      onEdit={() => setEditingVideo(video)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Editor Videos */}
            {editorVideos.length > 0 && (
              <div>
                <h3 className="text-white/80 font-medium mb-3 flex items-center gap-2">
                  <span className="w-3 h-3 bg-pink-500 rounded-full" />
                  Portfolio Editor ({editorVideos.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {editorVideos.map((video) => (
                    <VideoCard
                      key={video.id}
                      video={video}
                      onEdit={() => setEditingVideo(video)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Thumbnail Editor Modal */}
      {editingVideo && (
        <VideoThumbnailEditor
          video={editingVideo}
          onUpdate={handleUpdate}
          onClose={() => setEditingVideo(null)}
        />
      )}
    </>
  );
}

// ─── Video Card (visual grid card) ───────────────────
function VideoCard({ video, onEdit }: { video: Video; onEdit: () => void }) {
  return (
    <div
      className="bg-black/30 rounded-xl overflow-hidden border border-white/10 hover:border-white/20 transition cursor-pointer group"
      onClick={onEdit}
    >
      {/* Thumbnail / Preview */}
      <div className="aspect-video relative bg-black">
        {video.thumbnail_url ? (
          <>
            <img src={video.thumbnail_url} alt="" className="w-full h-full object-cover" />
            <div className="absolute top-2 right-2 bg-green-500/80 rounded-full p-1">
              <Check className="w-3 h-3 text-white" />
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-white/20 gap-2">
            <Image className="w-8 h-8" />
            <span className="text-xs">Sem thumbnail</span>
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
          <div className="flex items-center gap-2 bg-purple-600 text-white rounded-full px-3 py-1.5 text-sm font-medium">
            <Pencil className="w-4 h-4" />
            Editar
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-2.5">
        <p className="text-white font-medium text-sm">
          Vídeo {video.display_order + 1}
        </p>
        <p className="text-white/30 text-xs truncate">{video.video_url}</p>
      </div>
    </div>
  );
}

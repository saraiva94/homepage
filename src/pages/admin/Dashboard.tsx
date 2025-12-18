import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/backend/client";
import { Trash2, Film, Code2, LogOut, Plus, X, Check, Home } from "lucide-react";
import { Link } from "react-router-dom";

type PortfolioType = "editor" | "dev";

interface Video {
  id: string;
  video_url: string;
  display_order: number;
}

const TOTAL_SLOTS = 8;

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<PortfolioType>("editor");
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isAdminLoggedIn");
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    fetchVideos();
  }, [activeTab, navigate]);

  const fetchVideos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("portfolio_videos")
      .select("*")
      .eq("portfolio_type", activeTab)
      .order("display_order");

    if (error) {
      console.error("Error fetching videos:", error);
    } else {
      setVideos(data || []);
    }
    setLoading(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, slotIndex: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(slotIndex);
    const fileName = `${activeTab}/${Date.now()}_${file.name}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from("portfolio-videos")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("portfolio-videos")
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase.from("portfolio_videos").insert({
        portfolio_type: activeTab,
        video_url: urlData.publicUrl,
        display_order: slotIndex,
      });

      if (dbError) throw dbError;

      await fetchVideos();
    } catch (err) {
      console.error("Upload error:", err);
      alert("Erro ao fazer upload do vídeo");
    } finally {
      setUploading(null);
    }
  };

  const handleDelete = async (video: Video) => {
    try {
      // Only try to delete from storage if it's a Supabase storage URL
      if (video.video_url.includes('supabase.co/storage')) {
        try {
          const url = new URL(video.video_url);
          const pathParts = url.pathname.split("/portfolio-videos/");
          const filePath = pathParts[1];

          if (filePath) {
            await supabase.storage.from("portfolio-videos").remove([decodeURIComponent(filePath)]);
          }
        } catch (storageErr) {
          console.warn("Could not delete from storage:", storageErr);
          // Continue to delete from database even if storage delete fails
        }
      }

      const { error: dbError } = await supabase.from("portfolio_videos").delete().eq("id", video.id);
      if (dbError) throw dbError;
      
      setConfirmDelete(null);
      await fetchVideos();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Erro ao excluir vídeo");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isAdminLoggedIn");
    navigate("/login");
  };

  const getVideoForSlot = (slotIndex: number) => {
    return videos.find((v) => v.display_order === slotIndex);
  };

  const renderSlots = () => {
    const slots = [];
    
    for (let i = 0; i < TOTAL_SLOTS; i++) {
      const video = getVideoForSlot(i);
      
      slots.push(
        <div
          key={i}
          className="bg-black/30 rounded-xl overflow-hidden border border-white/10 aspect-video relative"
        >
          {video ? (
            <>
              <video
                src={video.video_url}
                className="w-full h-full object-cover"
                controls
              />
              <div className="absolute top-2 right-2">
                {confirmDelete === video.id ? (
                  <div className="flex gap-1 bg-black/70 rounded-lg p-1">
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="p-2 hover:bg-white/10 text-white/60 hover:text-white rounded transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(video)}
                      className="p-2 hover:bg-red-500/30 text-red-400 hover:text-red-300 rounded transition"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(video.id)}
                    className="p-2 bg-black/70 hover:bg-red-500/30 text-white/60 hover:text-red-400 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded text-white/60 text-xs">
                Vídeo {i + 1}
              </div>
            </>
          ) : (
            <label className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-white/5 transition group">
              <input
                type="file"
                accept="video/*"
                onChange={(e) => handleUpload(e, i)}
                disabled={uploading !== null}
                className="hidden"
              />
              {uploading === i ? (
                <div className="text-white/60 text-sm">Enviando...</div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-white/10 group-hover:bg-purple-600/50 flex items-center justify-center transition">
                    <Plus className="w-6 h-6 text-white/60 group-hover:text-white transition" />
                  </div>
                  <span className="text-white/40 text-xs">Slot {i + 1}</span>
                </div>
              )}
            </label>
          )}
        </div>
      );
    }
    
    return slots;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 py-4 grid grid-cols-3 items-center">
          <h1 className="text-2xl font-bold text-white">Painel Administrativo</h1>
          <div className="flex justify-center">
            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
            >
              <Home className="w-4 h-4" />
              Homepage
            </Link>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab("editor")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === "editor"
                ? "bg-blue-600 text-white"
                : "bg-white/10 text-white/60 hover:bg-white/20"
            }`}
          >
            <Film className="w-5 h-5" />
            Portfólio Editor
          </button>
          <button
            onClick={() => setActiveTab("dev")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === "dev"
                ? "bg-purple-600 text-white"
                : "bg-white/10 text-white/60 hover:bg-white/20"
            }`}
          >
            <Code2 className="w-5 h-5" />
            Portfólio Dev
          </button>
        </div>

        {/* Video Grid */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">
              {activeTab === "editor" ? "Portfólio Editor" : "Portfólio Dev"} ({videos.length}/{TOTAL_SLOTS})
            </h2>
          </div>

          {loading ? (
            <div className="text-white/60 text-center py-12">Carregando...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {renderSlots()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

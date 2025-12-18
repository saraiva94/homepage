import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Trash2, Film, Code2, LogOut } from "lucide-react";

type PortfolioType = "editor" | "dev";

interface Video {
  id: string;
  video_url: string;
  display_order: number;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<PortfolioType>("editor");
  const [videos] = useState<Video[]>([]);
  const [loading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isAdminLoggedIn");
    if (!isLoggedIn) {
      navigate("/admin/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("isAdminLoggedIn");
    navigate("/admin/login");
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (videos.length >= 8) {
      alert("Máximo de 8 vídeos por portfolio");
      return;
    }

    // Placeholder for upload - will implement with Supabase later
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      alert("Upload temporariamente desabilitado. Configure o backend primeiro.");
    }, 500);
  };

  const handleDelete = (_video: Video) => {
    if (!confirm("Tem certeza que deseja excluir este vídeo?")) return;
    // Placeholder for delete
    alert("Exclusão temporariamente desabilitada. Configure o backend primeiro.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Painel Administrativo</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
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

        {/* Upload Area */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">
              Vídeos ({videos.length}/8)
            </h2>
            <label
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition cursor-pointer ${
                videos.length >= 8 || uploading
                  ? "bg-gray-500/50 text-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              <Upload className="w-4 h-4" />
              {uploading ? "Enviando..." : "Upload Vídeo"}
              <input
                type="file"
                accept="video/*"
                onChange={handleUpload}
                disabled={videos.length >= 8 || uploading}
                className="hidden"
              />
            </label>
          </div>

          {loading ? (
            <div className="text-white/60 text-center py-12">Carregando...</div>
          ) : videos.length === 0 ? (
            <div className="text-white/60 text-center py-12">
              Nenhum vídeo adicionado ainda
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {videos.map((video, index) => (
                <div
                  key={video.id}
                  className="bg-black/30 rounded-xl overflow-hidden border border-white/10"
                >
                  <div className="aspect-video">
                    <video
                      src={video.video_url}
                      className="w-full h-full object-cover"
                      controls
                    />
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <span className="text-white/60 text-sm">
                      Vídeo {index + 1}
                    </span>
                    <button
                      onClick={() => handleDelete(video)}
                      className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

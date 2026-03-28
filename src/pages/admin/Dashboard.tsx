import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/backend/client";
import { Trash2, Film, Code2, LogOut, Plus, X, Check, Home, FileText, Download, ImageIcon, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { ResumeManager } from "@/components/admin/ResumeManager";

type PortfolioType = "editor" | "dev";
type AdminSection = "editor" | "dev" | "images" | "resume";

interface Video {
  id: string;
  video_url: string;
  display_order: number;
}

const TOTAL_SLOTS = 8;

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<AdminSection>("editor");
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | null>(null);
  const [profilePos, setProfilePos] = useState("50% 50%");
  const [backgroundPos, setBackgroundPos] = useState("50% 68%");
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const [savingPos, setSavingPos] = useState(false);
  const navigate = useNavigate();

  const fetchImages = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("profile_image_url, background_image_url, profile_image_position, background_image_position")
      .eq("id", "main")
      .single();
    if (data) {
      setProfileImageUrl(data.profile_image_url);
      setBackgroundImageUrl(data.background_image_url);
      setProfilePos(data.profile_image_position || "50% 50%");
      setBackgroundPos(data.background_image_position || "50% 68%");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "profile" | "background") => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(type);
    try {
      const fileName = `card-images/${type}_${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from("portfolio-videos").upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("portfolio-videos").getPublicUrl(fileName);
      const field = type === "profile" ? "profile_image_url" : "background_image_url";
      const { error: dbError } = await supabase.from("site_settings").update({ [field]: urlData.publicUrl }).eq("id", "main");
      if (dbError) throw dbError;
      await fetchImages();
    } catch (err) {
      console.error("Image upload error:", err);
      alert("Erro ao fazer upload da imagem");
    } finally {
      setUploadingImage(null);
    }
  };

  const handleSavePosition = async (type: "profile" | "background") => {
    setSavingPos(true);
    const field = type === "profile" ? "profile_image_position" : "background_image_position";
    const value = type === "profile" ? profilePos : backgroundPos;
    await supabase.from("site_settings").update({ [field]: value }).eq("id", "main");
    setSavingPos(false);
  };

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isAdminLoggedIn");
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    if (activeSection === "editor" || activeSection === "dev") {
      fetchVideos();
    }
    if (activeSection === "images") {
      fetchImages();
    }
  }, [activeSection, navigate]);

  const activeTab: PortfolioType = activeSection === "dev" ? "dev" : "editor";

  const fetchVideos = async () => {
    setLoading(true);
    const currentTab: PortfolioType = activeSection === "dev" ? "dev" : "editor";
    const { data, error } = await supabase
      .from("portfolio_videos")
      .select("*")
      .eq("portfolio_type", currentTab)
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
              <div className="absolute top-2 right-2 flex gap-1">
                <a
                  href={video.video_url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-black/70 hover:bg-blue-500/30 text-white/60 hover:text-blue-400 rounded-lg transition"
                  title="Download vídeo"
                >
                  <Download className="w-4 h-4" />
                </a>
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
        <div
          className="w-full mx-auto grid items-center"
          style={{ gridTemplateColumns: '1fr auto 1fr', padding: '1rem 2rem' }}
        >
          <div className="flex justify-start">
            <h1 className="text-2xl font-bold text-white whitespace-nowrap">Painel Administrativo</h1>
          </div>
          <div className="flex justify-center">
            <Link
              to="/"
              className="flex items-center gap-2 font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-full transition hover:scale-105"
              style={{ padding: '1rem 3rem' }}
            >
              <Home className="w-5 h-5" />
              Homepage
            </Link>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 font-bold bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-full transition hover:scale-105"
              style={{ padding: '1rem 2.5rem' }}
            >
              <LogOut className="w-5 h-5" />
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Content - centralizado, mesma largura do card da homepage */}
      <div style={{ width: '80%', maxWidth: '72rem', margin: '0 auto', padding: '1.5rem 0' }}>
        {/* Tabs: Editor | Dev | Currículo */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <button
            onClick={() => setActiveSection("editor")}
            className={`flex items-center gap-2 rounded-full font-semibold transition hover:scale-105 ${
              activeSection === "editor"
                ? "bg-blue-600 text-white"
                : "bg-white/10 text-white/60 hover:bg-white/20"
            }`}
            style={{ padding: '0.875rem 2rem' }}
          >
            <Film className="w-5 h-5" />
            Portfólio Editor
          </button>
          <button
            onClick={() => setActiveSection("dev")}
            className={`flex items-center gap-2 rounded-full font-semibold transition hover:scale-105 ${
              activeSection === "dev"
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                : "bg-white/10 text-white/60 hover:bg-white/20"
            }`}
            style={{ padding: '0.875rem 2rem' }}
          >
            <Code2 className="w-5 h-5" />
            Portfólio Dev
          </button>
          <button
            onClick={() => setActiveSection("images")}
            className={`flex items-center gap-2 rounded-full font-semibold transition hover:scale-105 ${
              activeSection === "images"
                ? "bg-gradient-to-r from-green-600 to-teal-600 text-white"
                : "bg-white/10 text-white/60 hover:bg-white/20"
            }`}
            style={{ padding: '0.875rem 2rem' }}
          >
            <ImageIcon className="w-5 h-5" />
            Imagens do Card
          </button>
          <button
            onClick={() => setActiveSection("resume")}
            className={`flex items-center gap-2 rounded-full font-semibold transition hover:scale-105 ${
              activeSection === "resume"
                ? "bg-gradient-to-r from-red-600 to-orange-600 text-white"
                : "bg-white/10 text-white/60 hover:bg-white/20"
            }`}
            style={{ padding: '0.875rem 2rem' }}
          >
            <FileText className="w-5 h-5" />
            Currículo
          </button>
        </div>

        {/* Videos Section */}
        {(activeSection === "editor" || activeSection === "dev") && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20" style={{ width: '100%', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <h2 className="text-xl font-semibold text-white">
                {activeSection === "editor" ? "Portfólio Editor" : "Portfólio Dev"} ({videos.length}/{TOTAL_SLOTS})
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
        )}

        {/* Images Section */}
        {activeSection === "images" && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20" style={{ width: '100%', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <h2 className="text-xl font-semibold text-white">Imagens do Card</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Foto de Perfil */}
              <div className="flex flex-col gap-4 bg-black/20 rounded-xl border border-white/10" style={{ padding: '1.25rem' }}>
                <h3 className="text-white font-semibold text-center">Foto de Perfil</h3>
                <div className="w-full rounded-lg overflow-hidden border-2 border-white/20 bg-black/30" style={{ aspectRatio: '1', maxWidth: '240px', margin: '0 auto' }}>
                  {profileImageUrl ? (
                    <img src={profileImageUrl} alt="Perfil" className="w-full h-full object-cover" style={{ objectPosition: profilePos }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/30 text-sm">Sem foto</div>
                  )}
                </div>

                {/* Controles de posição */}
                {profileImageUrl && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-white/60 text-xs block mb-1">Posição horizontal: {profilePos.split(' ')[0]}</label>
                      <input
                        type="range" min="0" max="100" value={parseInt(profilePos.split(' ')[0]) || 50}
                        onChange={(e) => setProfilePos(`${e.target.value}% ${profilePos.split(' ')[1] || '50%'}`)}
                        className="w-full accent-purple-500"
                      />
                    </div>
                    <div>
                      <label className="text-white/60 text-xs block mb-1">Posição vertical: {profilePos.split(' ')[1] || '50%'}</label>
                      <input
                        type="range" min="0" max="100" value={parseInt(profilePos.split(' ')[1]) || 50}
                        onChange={(e) => setProfilePos(`${profilePos.split(' ')[0] || '50%'} ${e.target.value}%`)}
                        className="w-full accent-purple-500"
                      />
                    </div>
                    <button
                      onClick={() => handleSavePosition("profile")}
                      disabled={savingPos}
                      className="w-full rounded-full font-semibold bg-green-600 hover:bg-green-700 text-white transition text-sm"
                      style={{ padding: '0.5rem 1rem' }}
                    >
                      {savingPos ? "Salvando..." : "Salvar posição"}
                    </button>
                  </div>
                )}

                {/* Botões */}
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                  <label className="flex items-center gap-2 rounded-full font-semibold bg-purple-600 hover:bg-purple-700 text-white transition hover:scale-105 cursor-pointer text-sm" style={{ padding: '0.625rem 1.25rem' }}>
                    <Upload className="w-4 h-4" />
                    {uploadingImage === "profile" ? "Enviando..." : "Trocar"}
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "profile")} disabled={uploadingImage !== null} className="hidden" />
                  </label>
                  {profileImageUrl && (
                    <a href={profileImageUrl} download target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-full font-semibold bg-blue-600 hover:bg-blue-700 text-white transition hover:scale-105 text-sm"
                      style={{ padding: '0.625rem 1.25rem' }}>
                      <Download className="w-4 h-4" /> Download
                    </a>
                  )}
                </div>
              </div>

              {/* Background do Card */}
              <div className="flex flex-col gap-4 bg-black/20 rounded-xl border border-white/10" style={{ padding: '1.25rem' }}>
                <h3 className="text-white font-semibold text-center">Background do Card</h3>
                <div className="w-full rounded-lg overflow-hidden border-2 border-white/20 bg-black/30" style={{ aspectRatio: '16/9' }}>
                  {backgroundImageUrl ? (
                    <img src={backgroundImageUrl} alt="Background" className="w-full h-full object-cover" style={{ objectPosition: backgroundPos }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/30 text-sm">Sem background</div>
                  )}
                </div>

                {/* Controles de posição */}
                {backgroundImageUrl && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-white/60 text-xs block mb-1">Posição horizontal: {backgroundPos.split(' ')[0]}</label>
                      <input
                        type="range" min="0" max="100" value={parseInt(backgroundPos.split(' ')[0]) || 50}
                        onChange={(e) => setBackgroundPos(`${e.target.value}% ${backgroundPos.split(' ')[1] || '68%'}`)}
                        className="w-full accent-purple-500"
                      />
                    </div>
                    <div>
                      <label className="text-white/60 text-xs block mb-1">Posição vertical: {backgroundPos.split(' ')[1] || '68%'}</label>
                      <input
                        type="range" min="0" max="100" value={parseInt(backgroundPos.split(' ')[1]) || 68}
                        onChange={(e) => setBackgroundPos(`${backgroundPos.split(' ')[0] || '50%'} ${e.target.value}%`)}
                        className="w-full accent-purple-500"
                      />
                    </div>
                    <button
                      onClick={() => handleSavePosition("background")}
                      disabled={savingPos}
                      className="w-full rounded-full font-semibold bg-green-600 hover:bg-green-700 text-white transition text-sm"
                      style={{ padding: '0.5rem 1rem' }}
                    >
                      {savingPos ? "Salvando..." : "Salvar posição"}
                    </button>
                  </div>
                )}

                {/* Botões */}
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                  <label className="flex items-center gap-2 rounded-full font-semibold bg-purple-600 hover:bg-purple-700 text-white transition hover:scale-105 cursor-pointer text-sm" style={{ padding: '0.625rem 1.25rem' }}>
                    <Upload className="w-4 h-4" />
                    {uploadingImage === "background" ? "Enviando..." : "Trocar"}
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "background")} disabled={uploadingImage !== null} className="hidden" />
                  </label>
                  {backgroundImageUrl && (
                    <a href={backgroundImageUrl} download target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-full font-semibold bg-blue-600 hover:bg-blue-700 text-white transition hover:scale-105 text-sm"
                      style={{ padding: '0.625rem 1.25rem' }}>
                      <Download className="w-4 h-4" /> Download
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Resume Section */}
        {activeSection === "resume" && <ResumeManager />}
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/backend/client";
import { Trash2, Film, Code2, LogOut, Plus, X, Check, Home, FileText, Download, ImageIcon, Sparkles, Camera, GripVertical } from "lucide-react";
import { Link } from "react-router-dom";
import { ResumeManager } from "@/components/admin/ResumeManager";
import { SkillsAdminManager } from "@/components/admin/SkillsAdminManager";
import { ImageManager } from "@/components/admin/ImageManager";
import { VideosManager } from "@/components/admin/VideosManager";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type PortfolioType = "editor" | "dev";
type AdminSection = "editor" | "dev" | "images" | "resume" | "skills" | "thumbnails";

interface Video {
  id: string;
  video_url: string;
  display_order: number;
}

// ─── Sortable Video Card ─────────────────────────────
function SortableVideoCard({
  video,
  index,
  confirmDelete,
  onConfirmDelete,
  onCancelDelete,
  onDelete,
}: {
  video: Video;
  index: number;
  confirmDelete: string | null;
  onConfirmDelete: (id: string) => void;
  onCancelDelete: () => void;
  onDelete: (video: Video) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: video.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : "auto" as const,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-black/30 rounded-xl overflow-hidden border border-white/10 aspect-video relative"
    >
      <video
        src={video.video_url}
        className="w-full h-full object-cover"
        controls
      />

      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 p-1.5 bg-black/70 hover:bg-white/20 text-white/60 hover:text-white rounded-lg transition cursor-grab active:cursor-grabbing"
        title="Arrastar para reordenar"
      >
        <GripVertical className="w-4 h-4" />
      </div>

      {/* Actions */}
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
              onClick={onCancelDelete}
              className="p-2 hover:bg-white/10 text-white/60 hover:text-white rounded transition"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(video)}
              className="p-2 hover:bg-red-500/30 text-red-400 hover:text-red-300 rounded transition"
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => onConfirmDelete(video.id)}
            className="p-2 bg-black/70 hover:bg-red-500/30 text-white/60 hover:text-red-400 rounded-lg transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded text-white/60 text-xs">
        Vídeo {index + 1}
      </div>
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────
export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<AdminSection>("editor");
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const navigate = useNavigate();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isAdminLoggedIn");
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    if (activeSection === "editor" || activeSection === "dev") {
      fetchVideos();
    }
  }, [activeSection, navigate]);

  const activeTab: PortfolioType = activeSection === "dev" ? "dev" : "editor";

  const fetchVideos = useCallback(async () => {
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
  }, [activeSection]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
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
        display_order: videos.length,
      });

      if (dbError) throw dbError;

      await fetchVideos();
    } catch (err) {
      console.error("Upload error:", err);
      alert("Erro ao fazer upload do vídeo");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (video: Video) => {
    try {
      if (video.video_url.includes("supabase.co/storage")) {
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
      // Re-order remaining videos
      const remaining = videos.filter((v) => v.id !== video.id);
      for (let i = 0; i < remaining.length; i++) {
        if (remaining[i].display_order !== i) {
          await supabase
            .from("portfolio_videos")
            .update({ display_order: i })
            .eq("id", remaining[i].id);
        }
      }
      await fetchVideos();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Erro ao excluir vídeo");
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = videos.findIndex((v) => v.id === active.id);
    const newIndex = videos.findIndex((v) => v.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(videos, oldIndex, newIndex);
    setVideos(reordered);

    // Persist new order
    for (let i = 0; i < reordered.length; i++) {
      if (reordered[i].display_order !== i) {
        await supabase
          .from("portfolio_videos")
          .update({ display_order: i })
          .eq("id", reordered[i].id);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isAdminLoggedIn");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-lg border-b border-white/10">
        <div
          className="w-full mx-auto grid items-center"
          style={{ gridTemplateColumns: "1fr auto 1fr", padding: "1rem 2rem" }}
        >
          <div className="flex justify-start">
            <h1 className="text-2xl font-bold text-white whitespace-nowrap">Painel Administrativo</h1>
          </div>
          <div className="flex justify-center">
            <Link
              to="/"
              className="flex items-center gap-2 font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-full transition hover:scale-105"
              style={{ padding: "1rem 3rem" }}
            >
              <Home className="w-5 h-5" />
              Homepage
            </Link>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 font-bold bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-full transition hover:scale-105"
              style={{ padding: "1rem 2.5rem" }}
            >
              <LogOut className="w-5 h-5" />
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div style={{ width: "80%", maxWidth: "72rem", margin: "0 auto", padding: "1.5rem 0" }}>
        {/* Tabs */}
        <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem", marginBottom: "2rem", flexWrap: "wrap" }}>
          {([
            { key: "editor" as const, icon: Film, label: "Editor", active: "bg-blue-600 text-white" },
            { key: "dev" as const, icon: Code2, label: "Dev", active: "bg-gradient-to-r from-blue-600 to-purple-600 text-white" },
            { key: "thumbnails" as const, icon: Camera, label: "Thumbnails", active: "bg-gradient-to-r from-purple-600 to-pink-600 text-white" },
            { key: "images" as const, icon: ImageIcon, label: "Imagens", active: "bg-gradient-to-r from-green-600 to-teal-600 text-white" },
            { key: "skills" as const, icon: Sparkles, label: "Skills", active: "bg-gradient-to-r from-cyan-600 to-purple-600 text-white" },
            { key: "resume" as const, icon: FileText, label: "Currículo", active: "bg-gradient-to-r from-red-600 to-orange-600 text-white" },
          ]).map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveSection(tab.key)}
                className={`flex items-center gap-2 rounded-full font-semibold transition hover:scale-105 ${
                  activeSection === tab.key ? tab.active : "bg-white/10 text-white/60 hover:bg-white/20"
                }`}
                style={{ padding: "0.875rem 2rem" }}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Videos Section (drag & drop + dynamic slots) */}
        {(activeSection === "editor" || activeSection === "dev") && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20" style={{ width: "100%", padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
              <h2 className="text-xl font-semibold text-white">
                {activeSection === "editor" ? "Portfólio Editor" : "Portfólio Dev"} ({videos.length} vídeos)
              </h2>
            </div>

            {loading ? (
              <div className="text-white/60 text-center py-12">Carregando...</div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={videos.map((v) => v.id)} strategy={rectSortingStrategy}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Existing videos (draggable) */}
                    {videos.map((video, idx) => (
                      <SortableVideoCard
                        key={video.id}
                        video={video}
                        index={idx}
                        confirmDelete={confirmDelete}
                        onConfirmDelete={setConfirmDelete}
                        onCancelDelete={() => setConfirmDelete(null)}
                        onDelete={handleDelete}
                      />
                    ))}

                    {/* Add slot */}
                    <div className="bg-black/30 rounded-xl overflow-hidden border border-white/10 aspect-video relative">
                      <label className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-white/5 transition group">
                        <input
                          type="file"
                          accept="video/*"
                          onChange={handleUpload}
                          disabled={uploading}
                          className="hidden"
                        />
                        {uploading ? (
                          <div className="text-white/60 text-sm">Enviando...</div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 rounded-full bg-white/10 group-hover:bg-purple-600/50 flex items-center justify-center transition">
                              <Plus className="w-6 h-6 text-white/60 group-hover:text-white transition" />
                            </div>
                            <span className="text-white/40 text-xs">Adicionar vídeo</span>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        )}

        {/* Thumbnails Section */}
        {activeSection === "thumbnails" && <VideosManager />}

        {/* Images Section */}
        {activeSection === "images" && <ImageManager />}

        {/* Skills Section */}
        {activeSection === "skills" && <SkillsAdminManager />}

        {/* Resume Section */}
        {activeSection === "resume" && <ResumeManager />}
      </div>
    </div>
  );
}

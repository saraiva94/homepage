import { useState, useRef, useEffect } from "react";
import { Upload, Move, Save, Loader2, Image as ImageIcon, User, Wallpaper, Download } from "lucide-react";
import { supabase } from "@/integrations/backend/client";
import profileFallbackRaw from "@/assets/optimized/eu.webp";
import backgroundFallbackRaw from "@/assets/optimized/background.webp";

const profileFallback = profileFallbackRaw as unknown as string;
const backgroundFallback = backgroundFallbackRaw as unknown as string;

interface ImageData {
  url: string | null;
  position: string;
}

export function ImageManager() {
  const [profile, setProfile] = useState<ImageData>({ url: null, position: "50% 50%" });
  const [background, setBackground] = useState<ImageData>({ url: null, position: "50% 68%" });
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeEditor, setActiveEditor] = useState<"profile" | "background" | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("profile_image_url, background_image_url, profile_image_position, background_image_position")
        .eq("id", "main")
        .single();

      if (error) {
        console.warn("[ImageManager] fetch error (using fallbacks):", error.message);
      }

      setProfile({
        url: data?.profile_image_url || null,
        position: data?.profile_image_position || "50% 50%",
      });
      setBackground({
        url: data?.background_image_url || null,
        position: data?.background_image_position || "50% 68%",
      });
      setIsLoading(false);
    };
    fetchImages();
  }, []);

  const handleUpload = async (file: File, type: "profile" | "background") => {
    setUploadingType(type);
    try {
      const fileName = `card-images/${type}_${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from("portfolio-videos").upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("portfolio-videos").getPublicUrl(fileName);
      const url = urlData.publicUrl;

      const column = type === "profile" ? "profile_image_url" : "background_image_url";
      const { error: dbError } = await supabase.from("site_settings").update({ [column]: url }).eq("id", "main");
      if (dbError) throw dbError;

      if (type === "profile") {
        setProfile((prev) => ({ ...prev, url }));
      } else {
        setBackground((prev) => ({ ...prev, url }));
      }
    } catch (err: any) {
      console.error("Image upload error:", err);
      alert("Erro ao fazer upload: " + (err.message || "erro desconhecido"));
    } finally {
      setUploadingType(null);
    }
  };

  const savePosition = async (type: "profile" | "background", position: string) => {
    setIsSaving(true);
    const column = type === "profile" ? "profile_image_position" : "background_image_position";
    await supabase.from("site_settings").update({ [column]: position }).eq("id", "main");

    if (type === "profile") {
      setProfile((prev) => ({ ...prev, position }));
    } else {
      setBackground((prev) => ({ ...prev, position }));
    }
    setIsSaving(false);
    setActiveEditor(null);
  };

  if (isLoading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
        <div className="text-white/60 text-center py-8">Carregando...</div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-cyan-400" />
          Imagens do Card
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Image */}
          <ImageUploadCard
            title="Foto de Perfil"
            icon={<User className="w-4 h-4" />}
            imageUrl={profile.url}
            fallbackUrl={profileFallback}
            position={profile.position}
            aspectRatio="square"
            uploading={uploadingType === "profile"}
            onUpload={(file) => handleUpload(file, "profile")}
            onEditPosition={() => setActiveEditor("profile")}
          />

          {/* Background Image */}
          <ImageUploadCard
            title="Background do Card"
            icon={<Wallpaper className="w-4 h-4" />}
            imageUrl={background.url}
            fallbackUrl={backgroundFallback}
            position={background.position}
            aspectRatio="wide"
            uploading={uploadingType === "background"}
            onUpload={(file) => handleUpload(file, "background")}
            onEditPosition={() => setActiveEditor("background")}
          />
        </div>
      </div>

      {/* Position Editor Modal */}
      {activeEditor && (
        <PositionEditorModal
          title={activeEditor === "profile" ? "Foto de Perfil" : "Background"}
          imageUrl={activeEditor === "profile" ? (profile.url || profileFallback) : (background.url || backgroundFallback)}
          currentPosition={activeEditor === "profile" ? profile.position : background.position}
          aspectRatio={activeEditor === "profile" ? "square" : "wide"}
          onSave={(pos) => savePosition(activeEditor, pos)}
          onClose={() => setActiveEditor(null)}
          isSaving={isSaving}
        />
      )}
    </>
  );
}

// ─── Image Upload Card ───────────────────────────────
interface ImageUploadCardProps {
  title: string;
  icon: React.ReactNode;
  imageUrl: string | null;
  fallbackUrl: string;
  position: string;
  aspectRatio: "square" | "wide";
  uploading: boolean;
  onUpload: (file: File) => void;
  onEditPosition: () => void;
}

function ImageUploadCard({
  title,
  icon,
  imageUrl,
  fallbackUrl,
  position,
  aspectRatio,
  uploading,
  onUpload,
  onEditPosition,
}: ImageUploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const displayUrl = imageUrl || fallbackUrl;
  const isFromDb = !!imageUrl;

  return (
    <div className="flex flex-col items-center gap-4 bg-black/20 rounded-xl border border-white/10 p-5">
      <h3 className="text-white font-semibold text-center flex items-center justify-center gap-2">
        {icon} {title}
      </h3>

      {/* Preview */}
      <div
        className={`relative overflow-hidden rounded-lg border-2 border-white/20 bg-black/30 ${
          aspectRatio === "square" ? "aspect-square max-w-[240px] w-full" : "aspect-video w-full"
        }`}
      >
        <img
          src={displayUrl}
          alt={title}
          className="w-full h-full object-cover"
          style={{ objectPosition: position }}
        />
        {!isFromDb && (
          <div className="absolute bottom-1.5 left-1.5 bg-black/70 text-white/50 text-[10px] px-1.5 py-0.5 rounded">
            Fallback local
          </div>
        )}
      </div>

      {/* Position info */}
      <div className="text-center text-white/40 text-xs">
        Posição: <code className="bg-white/10 px-1.5 py-0.5 rounded">{position}</code>
      </div>

      {/* Buttons */}
      <div className="flex gap-2 justify-center flex-wrap">
        <label className="flex items-center gap-2 rounded-full font-semibold bg-purple-600 hover:bg-purple-700 text-white transition hover:scale-105 cursor-pointer text-sm px-4 py-2.5">
          <Upload className="w-4 h-4" />
          {uploading ? "Enviando..." : isFromDb ? "Trocar" : "Enviar"}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
            disabled={uploading}
            className="hidden"
          />
        </label>

        <button
          onClick={onEditPosition}
          className="flex items-center gap-2 rounded-full font-semibold bg-cyan-600 hover:bg-cyan-700 text-white transition hover:scale-105 text-sm px-4 py-2.5"
        >
          <Move className="w-4 h-4" />
          Posição
        </button>

        <a
          href={displayUrl}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-full font-semibold bg-blue-600 hover:bg-blue-700 text-white transition hover:scale-105 text-sm px-4 py-2.5"
        >
          <Download className="w-4 h-4" />
          Download
        </a>
      </div>
    </div>
  );
}

// ─── Position Editor Modal ───────────────────────────
interface PositionEditorModalProps {
  title: string;
  imageUrl: string | null;
  currentPosition: string;
  aspectRatio: "square" | "wide";
  onSave: (position: string) => void;
  onClose: () => void;
  isSaving: boolean;
}

function PositionEditorModal({
  title,
  imageUrl,
  currentPosition,
  aspectRatio,
  onSave,
  onClose,
  isSaving,
}: PositionEditorModalProps) {
  const [posX, setPosX] = useState(() => parseInt(currentPosition.split(" ")[0]) || 50);
  const [posY, setPosY] = useState(() => parseInt(currentPosition.split(" ")[1]) || 50);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const position = `${posX}% ${posY}%`;

  const updateFromPointer = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.round(((clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((clientY - rect.top) / rect.height) * 100);
    setPosX(Math.max(0, Math.min(100, x)));
    setPosY(Math.max(0, Math.min(100, y)));
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updateFromPointer(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    updateFromPointer(e.clientX, e.clientY);
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-white/20 rounded-2xl p-6 w-full max-w-2xl">
        <h3 className="text-white font-semibold mb-1">Ajustar Posição — {title}</h3>
        <p className="text-white/50 text-sm mb-5">Arraste sobre a imagem para definir o ponto focal</p>

        {/* Drag area — image with object-position preview */}
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`relative overflow-hidden rounded-xl border-2 border-white/20 cursor-move select-none touch-none mb-5 mx-auto ${
            aspectRatio === "square" ? "aspect-square max-w-[340px]" : "aspect-video"
          }`}
        >
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Preview"
              draggable={false}
              className="w-full h-full object-cover pointer-events-none"
              style={{ objectPosition: position }}
            />
          )}

          {/* Cross-hair guides */}
          <div
            className="absolute w-px bg-cyan-400/40 pointer-events-none"
            style={{ left: `${posX}%`, top: 0, bottom: 0 }}
          />
          <div
            className="absolute h-px bg-cyan-400/40 pointer-events-none"
            style={{ top: `${posY}%`, left: 0, right: 0 }}
          />

          {/* Focal point dot */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: `${posX}%`,
              top: `${posY}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div className="w-7 h-7 border-2 border-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.6)]">
              <div className="absolute inset-[3px] rounded-full bg-cyan-400/25" />
            </div>
          </div>

          {/* Drag hint */}
          {!isDragging.current && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white/60 text-[10px] px-2 py-0.5 rounded-full pointer-events-none">
              Arraste para mover
            </div>
          )}
        </div>

        {/* Position readout */}
        <div className="text-center text-white/50 text-sm mb-5">
          Ponto focal: <code className="bg-white/10 px-2 py-1 rounded font-mono">{position}</code>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
          >
            Cancelar
          </button>
          <button
            onClick={() => onSave(position)}
            disabled={isSaving}
            className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition flex items-center justify-center gap-2"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

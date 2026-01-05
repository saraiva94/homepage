import { useState, useEffect } from "react";
import { supabase } from "@/integrations/backend/client";
import { FileText, Upload, Trash2, Check, X, ExternalLink } from "lucide-react";

export function ResumeManager() {
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    fetchResumeUrl();
  }, []);

  const fetchResumeUrl = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("site_settings")
      .select("resume_url")
      .eq("id", "main")
      .single();

    if (error) {
      console.error("Error fetching resume URL:", error);
    } else {
      setResumeUrl(data?.resume_url || null);
    }
    setLoading(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Por favor, selecione um arquivo PDF.");
      return;
    }

    setUploading(true);
    const fileName = `curriculo_${Date.now()}.pdf`;

    try {
      // Delete old file if exists
      if (resumeUrl && resumeUrl.includes("supabase.co/storage")) {
        try {
          const url = new URL(resumeUrl);
          const pathParts = url.pathname.split("/resume/");
          const filePath = pathParts[1];
          if (filePath) {
            await supabase.storage.from("resume").remove([decodeURIComponent(filePath)]);
          }
        } catch (err) {
          console.warn("Could not delete old resume:", err);
        }
      }

      // Upload new file
      const { error: uploadError } = await supabase.storage
        .from("resume")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("resume")
        .getPublicUrl(fileName);

      // Update database
      const { error: dbError } = await supabase
        .from("site_settings")
        .upsert({ id: "main", resume_url: urlData.publicUrl });

      if (dbError) throw dbError;

      setResumeUrl(urlData.publicUrl);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Erro ao fazer upload do currículo");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    try {
      if (resumeUrl && resumeUrl.includes("supabase.co/storage")) {
        try {
          const url = new URL(resumeUrl);
          const pathParts = url.pathname.split("/resume/");
          const filePath = pathParts[1];
          if (filePath) {
            await supabase.storage.from("resume").remove([decodeURIComponent(filePath)]);
          }
        } catch (err) {
          console.warn("Could not delete from storage:", err);
        }
      }

      const { error: dbError } = await supabase
        .from("site_settings")
        .update({ resume_url: null })
        .eq("id", "main");

      if (dbError) throw dbError;

      setResumeUrl(null);
      setConfirmDelete(false);
    } catch (err) {
      console.error("Delete error:", err);
      alert("Erro ao excluir currículo");
    }
  };

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <div className="text-white/60 text-center py-8">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-6 h-6 text-red-400" />
        <h2 className="text-xl font-semibold text-white">Currículo para Download</h2>
      </div>

      {resumeUrl ? (
        <div className="bg-black/30 rounded-xl p-4 border border-white/10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6 text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">Currículo atual</p>
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <span className="truncate">Visualizar PDF</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <label className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition flex items-center gap-2">
                <Upload className="w-4 h-4" />
                <span>Substituir</span>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>

              {confirmDelete ? (
                <div className="flex gap-1 bg-black/70 rounded-lg p-1">
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="p-2 hover:bg-white/10 text-white/60 hover:text-white rounded transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-2 hover:bg-red-500/30 text-red-400 hover:text-red-300 rounded transition"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {uploading && (
            <div className="mt-3 text-center text-white/60 text-sm">
              Enviando novo currículo...
            </div>
          )}
        </div>
      ) : (
        <label className="block bg-black/30 rounded-xl p-8 border-2 border-dashed border-white/20 hover:border-white/40 cursor-pointer transition group">
          <input
            type="file"
            accept=".pdf"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-white/10 group-hover:bg-red-500/30 flex items-center justify-center transition">
              <Upload className="w-8 h-8 text-white/60 group-hover:text-white transition" />
            </div>
            <div className="text-center">
              <p className="text-white font-medium">
                {uploading ? "Enviando..." : "Clique para fazer upload do currículo"}
              </p>
              <p className="text-white/40 text-sm mt-1">Apenas arquivos PDF</p>
            </div>
          </div>
        </label>
      )}
    </div>
  );
}

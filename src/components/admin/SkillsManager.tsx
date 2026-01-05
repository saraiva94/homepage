import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/backend/client";
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  X, 
  Check, 
  ChevronUp, 
  ChevronDown,
  Search,
  Palette
} from "lucide-react";
import { 
  hardSkillsCatalog, 
  softSkillsCatalog, 
  searchSkillsByName,
  getIconByKey,
  type IconCatalogItem 
} from "@/lib/skillIconsCatalog";

interface Skill {
  id: string;
  name: string;
  icon_key: string;
  icon_color: string;
  display_order: number;
}

type SkillType = "hard" | "soft";

interface SkillsManagerProps {
  type: SkillType;
}

export function SkillsManager({ type }: SkillsManagerProps) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  
  // Form states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<IconCatalogItem | null>(null);
  const [customName, setCustomName] = useState("");
  const [customColor, setCustomColor] = useState("#FFFFFF");
  const [insertPosition, setInsertPosition] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  const tableName = type === "hard" ? "hard_skills" : "soft_skills";
  const catalog = type === "hard" ? hardSkillsCatalog : softSkillsCatalog;

  useEffect(() => {
    fetchSkills();
  }, [type]);

  const fetchSkills = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from(tableName)
      .select("*")
      .order("display_order");

    if (error) {
      console.error("Error fetching skills:", error);
    } else {
      setSkills(data || []);
    }
    setLoading(false);
  };

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchSkillsByName(searchQuery, type).slice(0, 8);
  }, [searchQuery, type]);

  const handleSelectFromCatalog = (item: IconCatalogItem) => {
    setSelectedIcon(item);
    setCustomName(item.name);
    setCustomColor(item.color);
    setSearchQuery("");
  };

  const handleAddSkill = async () => {
    if (!selectedIcon || !customName.trim()) return;

    setSaving(true);
    try {
      // Reordenar skills existentes para abrir espaço
      const skillsToUpdate = skills.filter(s => s.display_order >= insertPosition);
      
      for (const skill of skillsToUpdate) {
        await supabase
          .from(tableName)
          .update({ display_order: skill.display_order + 1 })
          .eq("id", skill.id);
      }

      // Inserir nova skill
      const { error } = await supabase.from(tableName).insert({
        name: customName.trim(),
        icon_key: selectedIcon.key,
        icon_color: customColor,
        display_order: insertPosition,
      });

      if (error) throw error;

      // Reset form
      setShowAddForm(false);
      setSelectedIcon(null);
      setCustomName("");
      setCustomColor("#FFFFFF");
      setSearchQuery("");
      setInsertPosition(0);
      
      await fetchSkills();
    } catch (err) {
      console.error("Error adding skill:", err);
      alert("Erro ao adicionar skill");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSkill = async (skill: Skill) => {
    try {
      const { error } = await supabase.from(tableName).delete().eq("id", skill.id);
      if (error) throw error;

      // Reordenar skills restantes
      const remainingSkills = skills
        .filter(s => s.id !== skill.id)
        .sort((a, b) => a.display_order - b.display_order);

      for (let i = 0; i < remainingSkills.length; i++) {
        if (remainingSkills[i].display_order !== i) {
          await supabase
            .from(tableName)
            .update({ display_order: i })
            .eq("id", remainingSkills[i].id);
        }
      }

      setConfirmDelete(null);
      await fetchSkills();
    } catch (err) {
      console.error("Error deleting skill:", err);
      alert("Erro ao excluir skill");
    }
  };

  const handleMoveSkill = async (skill: Skill, direction: "up" | "down") => {
    const currentIndex = skills.findIndex(s => s.id === skill.id);
    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= skills.length) return;

    const otherSkill = skills[newIndex];

    try {
      // Swap display_order
      await supabase
        .from(tableName)
        .update({ display_order: otherSkill.display_order })
        .eq("id", skill.id);

      await supabase
        .from(tableName)
        .update({ display_order: skill.display_order })
        .eq("id", otherSkill.id);

      await fetchSkills();
    } catch (err) {
      console.error("Error moving skill:", err);
    }
  };

  const renderSkillIcon = (iconKey: string, color: string) => {
    const catalogItem = getIconByKey(iconKey, type);
    if (!catalogItem) return null;

    const IconComponent = catalogItem.icon;
    return <IconComponent style={{ color, width: 20, height: 20 }} />;
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">
          {type === "hard" ? "Hard Skills" : "Soft Skills"} ({skills.length})
        </h2>
        <button
          onClick={() => {
            setShowAddForm(true);
            setInsertPosition(skills.length);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          Adicionar
        </button>
      </div>

      {/* Form de adicionar */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-black/30 rounded-xl border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-medium">Nova {type === "hard" ? "Hard" : "Soft"} Skill</h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="p-1 hover:bg-white/10 rounded transition"
            >
              <X className="w-5 h-5 text-white/60" />
            </button>
          </div>

          {/* Busca de ícone */}
          <div className="mb-4">
            <label className="block text-white/70 text-sm mb-2">Buscar ícone</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Buscar ${type === "hard" ? "tecnologia" : "habilidade"}...`}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Resultados da busca */}
            {searchResults.length > 0 && (
              <div className="mt-2 p-2 bg-black/40 rounded-lg border border-white/10 max-h-48 overflow-y-auto">
                {searchResults.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.key}
                      onClick={() => handleSelectFromCatalog(item)}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-lg transition text-left"
                    >
                      <Icon style={{ color: item.color, width: 20, height: 20 }} />
                      <span className="text-white">{item.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Catálogo completo para Soft Skills */}
          {type === "soft" && !searchQuery && (
            <div className="mb-4">
              <label className="block text-white/70 text-sm mb-2">Ou selecione do catálogo</label>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-48 overflow-y-auto p-2 bg-black/20 rounded-lg">
                {catalog.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.key}
                      onClick={() => handleSelectFromCatalog(item)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-lg transition ${
                        selectedIcon?.key === item.key
                          ? "bg-purple-600/50 border border-purple-400"
                          : "hover:bg-white/10 border border-transparent"
                      }`}
                      title={item.name}
                    >
                      <Icon style={{ color: item.color, width: 24, height: 24 }} />
                      <span className="text-[10px] text-white/60 truncate w-full text-center">
                        {item.name.split(" ")[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Ícone selecionado */}
          {selectedIcon && (
            <div className="mb-4 p-3 bg-purple-600/20 rounded-lg border border-purple-400/30 flex items-center gap-3">
              {(() => {
                const Icon = selectedIcon.icon;
                return <Icon style={{ color: customColor, width: 28, height: 28 }} />;
              })()}
              <div className="flex-1">
                <p className="text-white font-medium">{selectedIcon.name}</p>
                <p className="text-white/50 text-xs">{selectedIcon.key}</p>
              </div>
              <button
                onClick={() => setSelectedIcon(null)}
                className="p-1 hover:bg-white/10 rounded"
              >
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>
          )}

          {/* Nome personalizado */}
          <div className="mb-4">
            <label className="block text-white/70 text-sm mb-2">Nome (pode personalizar)</label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Nome da skill"
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Cor */}
          <div className="mb-4">
            <label className="block text-white/70 text-sm mb-2 flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Cor do ícone
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border-0"
              />
              <input
                type="text"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white font-mono focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Posição */}
          <div className="mb-4">
            <label className="block text-white/70 text-sm mb-2">Posição na lista</label>
            <select
              value={insertPosition}
              onChange={(e) => setInsertPosition(Number(e.target.value))}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              {[...Array(skills.length + 1)].map((_, idx) => (
                <option key={idx} value={idx} className="bg-gray-900">
                  {idx === 0 ? "Primeira posição" : idx === skills.length ? "Última posição" : `Posição ${idx + 1}`}
                </option>
              ))}
            </select>
          </div>

          {/* Botão salvar */}
          <button
            onClick={handleAddSkill}
            disabled={!selectedIcon || !customName.trim() || saving}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition font-medium"
          >
            {saving ? "Salvando..." : "Adicionar Skill"}
          </button>
        </div>
      )}

      {/* Lista de skills */}
      {loading ? (
        <div className="text-white/60 text-center py-8">Carregando...</div>
      ) : skills.length === 0 ? (
        <div className="text-white/40 text-center py-8">
          Nenhuma skill cadastrada. Clique em "Adicionar" para começar.
        </div>
      ) : (
        <div className="space-y-2">
          {skills.map((skill, index) => (
            <div
              key={skill.id}
              className="flex items-center gap-3 p-3 bg-black/20 rounded-lg border border-white/10 hover:border-white/20 transition"
            >
              <GripVertical className="w-4 h-4 text-white/30 cursor-grab" />
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleMoveSkill(skill, "up")}
                  disabled={index === 0}
                  className="p-1 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed rounded transition"
                >
                  <ChevronUp className="w-4 h-4 text-white/60" />
                </button>
                <button
                  onClick={() => handleMoveSkill(skill, "down")}
                  disabled={index === skills.length - 1}
                  className="p-1 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed rounded transition"
                >
                  <ChevronDown className="w-4 h-4 text-white/60" />
                </button>
              </div>

              <div className="flex items-center gap-3 flex-1">
                {renderSkillIcon(skill.icon_key, skill.icon_color)}
                <span className="text-white">{skill.name}</span>
                <span className="text-white/30 text-xs">#{skill.display_order + 1}</span>
              </div>

              <div
                className="w-5 h-5 rounded-full border border-white/30"
                style={{ backgroundColor: skill.icon_color }}
                title={skill.icon_color}
              />

              {confirmDelete === skill.id ? (
                <div className="flex gap-1">
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="p-2 hover:bg-white/10 text-white/60 rounded transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteSkill(skill)}
                    className="p-2 hover:bg-red-500/30 text-red-400 rounded transition"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(skill.id)}
                  className="p-2 hover:bg-red-500/20 text-white/40 hover:text-red-400 rounded transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

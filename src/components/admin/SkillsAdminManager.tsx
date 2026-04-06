import { useState, useMemo } from "react";
import {
  Plus,
  Trash2,
  X,
  Check,
  ChevronUp,
  ChevronDown,
  Search,
  Palette,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  hardSkillsCatalog,
  softSkillsCatalog,
  getIconByKey,
  type IconCatalogItem,
} from "@/lib/skillIconsCatalog";
import { useSkillsAdmin, type Skill, type NewSkill } from "@/hooks/useSkillsAdmin";

type SkillType = "hard" | "soft";

// Category maps (same as About.tsx)
const HARD_CATEGORY_MAP: Record<string, string> = {
  "adobe-cc": "Edição",
  "after-effects": "Edição",
  "premiere-pro": "Edição",
  "photoshop": "Edição",
  "illustrator": "Edição",
  "adobe-xd": "Edição",
  "figma": "Edição",
  "sketch": "Edição",
  "blender": "Edição",
  "davinci": "Edição",
  "javascript": "Frontend",
  "typescript": "Frontend",
  "react": "Frontend",
  "react-native": "Frontend",
  "nextjs": "Frontend",
  "vuejs": "Frontend",
  "angular": "Frontend",
  "svelte": "Frontend",
  "html5": "Frontend",
  "css3": "Frontend",
  "tailwindcss": "Frontend",
  "bootstrap": "Frontend",
  "sass": "Frontend",
  "threejs": "Frontend",
  "webgl": "Frontend",
  "nodejs": "Backend",
  "bunjs": "Backend",
  "python": "Backend",
  "java": "Backend",
  "csharp": "Backend",
  "go": "Backend",
  "rust": "Backend",
  "php": "Backend",
  "ruby": "Backend",
  "django": "Backend",
  "fastapi": "Backend",
  "express": "Backend",
  "nestjs": "Backend",
  "kotlin": "Backend",
  "swift": "Backend",
  "cpp": "Backend",
  "c": "Backend",
  "dart": "Backend",
  "laravel": "Backend",
  "flutter": "Backend",
  "graphql": "Backend",
  "spring": "Backend",
  "dotnet": "Backend",
  "scala": "Backend",
  "azure": "Cloud & DB",
  "aws": "Cloud & DB",
  "gcp": "Cloud & DB",
  "mysql": "Cloud & DB",
  "postgresql": "Cloud & DB",
  "mongodb": "Cloud & DB",
  "sqlite": "Cloud & DB",
  "redis": "Cloud & DB",
  "supabase": "Cloud & DB",
  "firebase": "Cloud & DB",
  "docker": "Cloud & DB",
  "kubernetes": "Cloud & DB",
  "terraform": "Cloud & DB",
  "elasticsearch": "Cloud & DB",
  "git": "Ferramentas",
  "github": "Ferramentas",
  "gitlab": "Ferramentas",
  "vscode": "Ferramentas",
  "jira": "Ferramentas",
  "notion": "Ferramentas",
  "excel": "Ferramentas",
  "postman": "Ferramentas",
  "linux": "Ferramentas",
  "vercel": "Ferramentas",
  "netlify": "Ferramentas",
  "jenkins": "Ferramentas",
  "nginx": "Ferramentas",
  "apache": "Ferramentas",
  "rabbitmq": "Ferramentas",
  "ubuntu": "Ferramentas",
  "confluence": "Ferramentas",
  "slack": "Ferramentas",
  "discord": "Ferramentas",
  "unity": "Ferramentas",
  "unreal": "Ferramentas",
  "jest": "Ferramentas",
  "cypress": "Ferramentas",
  "selenium": "Ferramentas",
  "insomnia": "Ferramentas",
  "vitest": "Ferramentas",
  "claude": "Ferramentas",
  "chatgpt": "Ferramentas",
  "cursor": "Ferramentas",
  "copilot": "Ferramentas",
  "midjourney": "Ferramentas",
  "stablediffusion": "Ferramentas",
};

const SOFT_CATEGORY_MAP: Record<string, string> = {
  "communication": "Interpessoal",
  "teamwork": "Interpessoal",
  "empathy": "Interpessoal",
  "networking": "Interpessoal",
  "collaboration": "Interpessoal",
  "feedback": "Interpessoal",
  "listening": "Interpessoal",
  "negotiation": "Interpessoal",
  "positivity": "Interpessoal",
  "proactivity": "Mentalidade",
  "creativity": "Mentalidade",
  "resilience": "Mentalidade",
  "adaptability": "Mentalidade",
  "critical-thinking": "Mentalidade",
  "curiosity": "Mentalidade",
  "learning": "Mentalidade",
  "innovation": "Mentalidade",
  "passion": "Mentalidade",
  "growth-mindset": "Mentalidade",
  "analytical": "Mentalidade",
  "organization": "Gestão",
  "leadership": "Gestão",
  "time-management": "Gestão",
  "decision-making": "Gestão",
  "problem-solving": "Gestão",
  "planning": "Gestão",
  "delegation": "Gestão",
  "attention-detail": "Gestão",
  "commitment": "Gestão",
  "patience": "Gestão",
  "ethics": "Gestão",
};

const HARD_CATEGORIES = [
  { name: "Edição", color: "#f472b6" },
  { name: "Frontend", color: "#60a5fa" },
  { name: "Backend", color: "#4ade80" },
  { name: "Cloud & DB", color: "#c084fc" },
  { name: "Ferramentas", color: "#fb923c" },
];

const SOFT_CATEGORIES = [
  { name: "Interpessoal", color: "#c084fc" },
  { name: "Mentalidade", color: "#facc15" },
  { name: "Gestão", color: "#4ade80" },
];

function getCategoryForSkill(iconKey: string, type: SkillType): string {
  const map = type === "hard" ? HARD_CATEGORY_MAP : SOFT_CATEGORY_MAP;
  return map[iconKey] || (type === "hard" ? "Ferramentas" : "Interpessoal");
}

// ─── Skill Toggle Item ───────────────────────────────
interface SkillToggleItemProps {
  skill: Skill;
  type: SkillType;
  onToggle: (id: string, visible: boolean) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, dir: "up" | "down") => void;
  isFirst: boolean;
  isLast: boolean;
  confirmDeleteId: string | null;
  setConfirmDeleteId: (id: string | null) => void;
}

function SkillToggleItem({
  skill,
  type,
  onToggle,
  onDelete,
  onMove,
  isFirst,
  isLast,
  confirmDeleteId,
  setConfirmDeleteId,
}: SkillToggleItemProps) {
  const catalogItem = getIconByKey(skill.icon_key, type);

  return (
    <div
      className={`flex items-center gap-2 p-2.5 rounded-lg border transition ${
        skill.is_visible
          ? "bg-white/5 border-white/15 hover:border-white/25"
          : "bg-black/20 border-white/5 opacity-50"
      }`}
    >
      {/* Reorder */}
      <div className="flex flex-col">
        <button
          onClick={() => onMove(skill.id, "up")}
          disabled={isFirst}
          className="p-0.5 hover:bg-white/10 disabled:opacity-20 rounded transition"
        >
          <ChevronUp className="w-3.5 h-3.5 text-white/60" />
        </button>
        <button
          onClick={() => onMove(skill.id, "down")}
          disabled={isLast}
          className="p-0.5 hover:bg-white/10 disabled:opacity-20 rounded transition"
        >
          <ChevronDown className="w-3.5 h-3.5 text-white/60" />
        </button>
      </div>

      {/* Icon + Name */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {catalogItem && (() => {
          const Icon = catalogItem.icon;
          return <Icon style={{ color: skill.icon_color, width: 18, height: 18, flexShrink: 0 }} />;
        })()}
        <span className="text-white text-sm truncate">{skill.name}</span>
      </div>

      {/* Toggle visibility */}
      <button
        onClick={() => onToggle(skill.id, !skill.is_visible)}
        className={`p-1.5 rounded-lg transition ${
          skill.is_visible
            ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
            : "bg-white/5 text-white/30 hover:bg-white/10"
        }`}
        title={skill.is_visible ? "Visível na homepage" : "Oculto da homepage"}
      >
        {skill.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
      </button>

      {/* Delete */}
      {confirmDeleteId === skill.id ? (
        <div className="flex gap-0.5">
          <button
            onClick={() => setConfirmDeleteId(null)}
            className="p-1.5 hover:bg-white/10 text-white/60 rounded transition"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(skill.id)}
            className="p-1.5 hover:bg-red-500/30 text-red-400 rounded transition"
          >
            <Check className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirmDeleteId(skill.id)}
          className="p-1.5 hover:bg-red-500/20 text-white/30 hover:text-red-400 rounded transition"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// ─── Add Skill Modal ─────────────────────────────────
interface AddSkillModalProps {
  type: SkillType;
  category: string;
  existingKeys: Set<string>;
  onAdd: (skill: NewSkill) => Promise<void>;
  onClose: () => void;
  nextOrder: number;
}

function AddSkillModal({ type, category, existingKeys, onAdd, onClose, nextOrder }: AddSkillModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<IconCatalogItem | null>(null);
  const [customName, setCustomName] = useState("");
  const [customColor, setCustomColor] = useState("#FFFFFF");
  const [saving, setSaving] = useState(false);

  const catalog = type === "hard" ? hardSkillsCatalog : softSkillsCatalog;

  // Filter catalog by category and exclude already added skills
  const categoryItems = useMemo(() => {
    return catalog.filter((item) => {
      if (existingKeys.has(item.key)) return false;
      return getCategoryForSkill(item.key, type) === category;
    });
  }, [catalog, category, existingKeys, type]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return categoryItems;
    const q = searchQuery.toLowerCase();
    return categoryItems.filter(
      (item) => item.name.toLowerCase().includes(q) || item.key.toLowerCase().includes(q)
    );
  }, [searchQuery, categoryItems]);

  const handleSelect = (item: IconCatalogItem) => {
    setSelectedIcon(item);
    setCustomName(item.name);
    setCustomColor(item.color);
  };

  const handleSave = async () => {
    if (!selectedIcon || !customName.trim()) return;
    setSaving(true);
    try {
      await onAdd({
        name: customName.trim(),
        icon_key: selectedIcon.key,
        icon_color: customColor,
        display_order: nextOrder,
      });
      onClose();
    } catch {
      alert("Erro ao adicionar skill");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        className="bg-gray-900 border border-white/20 rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-white font-semibold">
            Adicionar {type === "hard" ? "Hard" : "Soft"} Skill — {category}
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition">
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar no catálogo..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Catalog grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-52 overflow-y-auto p-1">
            {searchResults.map((item) => {
              const Icon = item.icon;
              const isSelected = selectedIcon?.key === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => handleSelect(item)}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-lg transition border ${
                    isSelected
                      ? "bg-purple-600/40 border-purple-400"
                      : "hover:bg-white/10 border-transparent"
                  }`}
                  title={item.name}
                >
                  <Icon style={{ color: item.color, width: 22, height: 22 }} />
                  <span className="text-[10px] text-white/60 truncate w-full text-center">
                    {item.name}
                  </span>
                </button>
              );
            })}
            {searchResults.length === 0 && (
              <div className="col-span-full text-white/40 text-sm text-center py-4">
                Nenhuma skill disponível nesta categoria
              </div>
            )}
          </div>

          {/* Selected preview */}
          {selectedIcon && (
            <div className="p-3 bg-purple-600/20 rounded-lg border border-purple-400/30 flex items-center gap-3">
              {(() => {
                const Icon = selectedIcon.icon;
                return <Icon style={{ color: customColor, width: 26, height: 26 }} />;
              })()}
              <div className="flex-1">
                <p className="text-white font-medium text-sm">{selectedIcon.name}</p>
                <p className="text-white/40 text-xs">{selectedIcon.key}</p>
              </div>
              <button onClick={() => setSelectedIcon(null)} className="p-1 hover:bg-white/10 rounded">
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>
          )}

          {/* Custom name */}
          {selectedIcon && (
            <>
              <div>
                <label className="block text-white/70 text-xs mb-1.5">Nome</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500 text-sm"
                />
              </div>

              <div>
                <label className="text-white/70 text-xs mb-1.5 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5" /> Cor do ícone
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    className="w-9 h-9 rounded cursor-pointer border-0"
                  />
                  <input
                    type="text"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleSave}
            disabled={!selectedIcon || !customName.trim() || saving}
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition font-medium text-sm"
          >
            {saving ? "Salvando..." : "Adicionar Skill"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Category Card ───────────────────────────────────
interface CategoryCardProps {
  name: string;
  color: string;
  skills: Skill[];
  type: SkillType;
  existingKeys: Set<string>;
  onToggle: (id: string, visible: boolean) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, dir: "up" | "down") => void;
  onAddClick: () => void;
  onQuickAdd: (item: IconCatalogItem) => void;
  confirmDeleteId: string | null;
  setConfirmDeleteId: (id: string | null) => void;
}

function CategoryCard({
  name,
  color,
  skills,
  type,
  existingKeys,
  onToggle,
  onDelete,
  onMove,
  onAddClick,
  onQuickAdd,
  confirmDeleteId,
  setConfirmDeleteId,
}: CategoryCardProps) {
  const visibleCount = skills.filter((s) => s.is_visible).length;

  const catalog = type === "hard" ? hardSkillsCatalog : softSkillsCatalog;
  const availableItems = useMemo(() => {
    return catalog.filter((item) => {
      if (existingKeys.has(item.key)) return false;
      return getCategoryForSkill(item.key, type) === name;
    });
  }, [catalog, existingKeys, type, name]);

  return (
    <div className="bg-black/20 rounded-xl border border-white/10 overflow-hidden">
      {/* Category header */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ borderBottom: `2px solid ${color}30` }}
      >
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
          <h4 className="text-white font-semibold text-sm">{name}</h4>
          <span className="text-white/40 text-xs">
            {visibleCount}/{skills.length} visíveis
          </span>
        </div>
        <button
          onClick={onAddClick}
          className="flex items-center gap-1 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white rounded-lg transition text-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          Buscar
        </button>
      </div>

      {/* Skills list */}
      <div className="p-2 space-y-1.5">
        {skills.length === 0 ? (
          <div className="text-white/30 text-xs text-center py-3">
            Nenhuma skill nesta categoria
          </div>
        ) : (
          skills.map((skill, idx) => (
            <SkillToggleItem
              key={skill.id}
              skill={skill}
              type={type}
              onToggle={onToggle}
              onDelete={onDelete}
              onMove={onMove}
              isFirst={idx === 0}
              isLast={idx === skills.length - 1}
              confirmDeleteId={confirmDeleteId}
              setConfirmDeleteId={setConfirmDeleteId}
            />
          ))
        )}
      </div>

      {/* Quick-add from catalog */}
      {availableItems.length > 0 && (
        <div className="px-2 pb-2">
          <div className="border-t border-white/5 pt-2">
            <p className="text-white/30 text-[10px] uppercase tracking-wider mb-1.5 px-1">Adicionar</p>
            <div className="flex flex-wrap gap-1">
              {availableItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    onClick={() => onQuickAdd(item)}
                    className="flex items-center gap-1 px-2 py-1 bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/25 rounded-md transition text-xs text-white/60 hover:text-white"
                    title={`Adicionar ${item.name}`}
                  >
                    <Icon style={{ color: item.color, width: 13, height: 13 }} />
                    <span className="truncate max-w-[80px]">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────
export function SkillsAdminManager() {
  const {
    hardSkills,
    softSkills,
    isLoading,
    error,
    toggleSkill,
    addSkill,
    deleteSkill,
    moveSkill,
  } = useSkillsAdmin();

  const [activeTab, setActiveTab] = useState<SkillType>("hard");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [addModal, setAddModal] = useState<{ type: SkillType; category: string } | null>(null);

  const skills = activeTab === "hard" ? hardSkills : softSkills;
  const categories = activeTab === "hard" ? HARD_CATEGORIES : SOFT_CATEGORIES;

  const groupedSkills = useMemo(() => {
    const groups: Record<string, Skill[]> = {};
    for (const cat of categories) {
      groups[cat.name] = [];
    }
    for (const skill of skills) {
      const cat = getCategoryForSkill(skill.icon_key, activeTab);
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(skill);
    }
    return groups;
  }, [skills, categories, activeTab]);

  const existingKeys = useMemo(() => new Set(skills.map((s) => s.icon_key)), [skills]);

  const handleToggle = async (id: string, visible: boolean) => {
    try {
      await toggleSkill(activeTab, id, visible);
    } catch {
      alert("Erro ao alterar visibilidade");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSkill(activeTab, id);
      setConfirmDeleteId(null);
    } catch {
      alert("Erro ao excluir skill");
    }
  };

  const handleMove = async (id: string, dir: "up" | "down") => {
    try {
      await moveSkill(activeTab, id, dir);
    } catch {
      alert("Erro ao mover skill");
    }
  };

  const handleAdd = async (skill: NewSkill) => {
    await addSkill(activeTab, skill);
  };

  const totalVisible = skills.filter((s) => s.is_visible).length;

  return (
    <>
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20" style={{ padding: "1.5rem" }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold text-white">
            Gerenciador de Skills
          </h2>
          <span className="text-white/50 text-sm">
            {totalVisible} visíveis / {skills.length} total
          </span>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setActiveTab("hard")}
            className={`flex-1 py-2.5 rounded-lg font-semibold transition text-sm ${
              activeTab === "hard"
                ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
                : "bg-white/10 text-white/60 hover:bg-white/20"
            }`}
          >
            Hard Skills ({hardSkills.filter((s) => s.is_visible).length}/{hardSkills.length})
          </button>
          <button
            onClick={() => setActiveTab("soft")}
            className={`flex-1 py-2.5 rounded-lg font-semibold transition text-sm ${
              activeTab === "soft"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                : "bg-white/10 text-white/60 hover:bg-white/20"
            }`}
          >
            Soft Skills ({softSkills.filter((s) => s.is_visible).length}/{softSkills.length})
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Loading */}
        {isLoading ? (
          <div className="text-white/60 text-center py-12">Carregando skills...</div>
        ) : (
          /* Category cards */
          <div className="space-y-4">
            {categories.map((cat) => (
              <CategoryCard
                key={cat.name}
                name={cat.name}
                color={cat.color}
                skills={groupedSkills[cat.name] || []}
                type={activeTab}
                existingKeys={existingKeys}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onMove={handleMove}
                onAddClick={() => setAddModal({ type: activeTab, category: cat.name })}
                onQuickAdd={async (item) => {
                  try {
                    await addSkill(activeTab, {
                      name: item.name,
                      icon_key: item.key,
                      icon_color: item.color,
                      display_order: skills.length,
                    });
                  } catch {
                    alert("Erro ao adicionar skill");
                  }
                }}
                confirmDeleteId={confirmDeleteId}
                setConfirmDeleteId={setConfirmDeleteId}
              />
            ))}
          </div>
        )}

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-6 text-xs text-white/40">
          <span className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-green-400" /> Visível na homepage
          </span>
          <span className="flex items-center gap-1.5">
            <EyeOff className="w-3.5 h-3.5 text-white/30" /> Oculto
          </span>
        </div>
      </div>

      {/* Add Skill Modal */}
      {addModal && (
        <AddSkillModal
          type={addModal.type}
          category={addModal.category}
          existingKeys={existingKeys}
          onAdd={handleAdd}
          onClose={() => setAddModal(null)}
          nextOrder={skills.length}
        />
      )}
    </>
  );
}

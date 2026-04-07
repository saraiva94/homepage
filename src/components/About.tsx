import { Link } from "react-router-dom";
import { useMemo, useEffect, useState, useCallback, useRef, memo } from "react";
import {
  Clapperboard,
  ChevronDown,
  ChevronUp,
  Code2,
  FileText,
  Github,
  Linkedin,
  MessageCircle,
} from "lucide-react";
import { supabase } from "@/integrations/backend/client";
import { getIconByKey } from "@/lib/skillIconsCatalog";
import about1ImgRaw from "@/assets/optimized/eu.webp";
import about2ImgRaw from "@/assets/optimized/background.webp";

const about1Img = about1ImgRaw as unknown as string;
const about2Img = about2ImgRaw as unknown as string;

interface Skill {
  id: string;
  name: string;
  icon_key: string;
  icon_color: string;
  display_order: number;
}

interface AboutProps {
  isVisible?: boolean;
}

// Cache para skills (evita re-fetch)
const SKILLS_CACHE = {
  hard: null as Skill[] | null,
  soft: null as Skill[] | null,
  resumeUrl: null as string | null,
  timestamp: 0,
};

const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

// Default skills (fallback)
const DEFAULT_HARD_SKILLS = [
  { icon_key: "adobe-cc", icon_color: "#DA1F26", name: "Creative Cloud" },
  { icon_key: "after-effects", icon_color: "#9999FF", name: "After Effects" },
  { icon_key: "premiere-pro", icon_color: "#9999FF", name: "Premiere Pro" },
  { icon_key: "javascript", icon_color: "#F7DF1E", name: "JavaScript" },
  { icon_key: "typescript", icon_color: "#3178C6", name: "TypeScript" },
  { icon_key: "react", icon_color: "#61DAFB", name: "React" },
  { icon_key: "react-native", icon_color: "#61DAFB", name: "React Native" },
  { icon_key: "nextjs", icon_color: "#FFFFFF", name: "Next.js" },
  { icon_key: "tailwindcss", icon_color: "#06B6D4", name: "Tailwind CSS" },
  { icon_key: "nodejs", icon_color: "#339933", name: "Node.js" },
  { icon_key: "bunjs", icon_color: "#FBF0DF", name: "Bun.js" },
  { icon_key: "python", icon_color: "#3776AB", name: "Python" },
  { icon_key: "azure", icon_color: "#0078D4", name: "Azure" },
  { icon_key: "mysql", icon_color: "#4479A1", name: "MySQL" },
  { icon_key: "postgresql", icon_color: "#4169E1", name: "PostgreSQL" },
  { icon_key: "sqlite", icon_color: "#003B57", name: "SQLite" },
  { icon_key: "supabase", icon_color: "#3ECF8E", name: "Supabase" },
  { icon_key: "git", icon_color: "#F05032", name: "Git" },
  { icon_key: "github", icon_color: "#FFFFFF", name: "GitHub" },
  { icon_key: "excel", icon_color: "#217346", name: "Excel" },
];

const DEFAULT_SOFT_SKILLS = [
  { icon_key: "communication", icon_color: "#60A5FA", name: "Comunicação" },
  { icon_key: "organization", icon_color: "#4ADE80", name: "Organização" },
  { icon_key: "teamwork", icon_color: "#C084FC", name: "Trabalho em equipe" },
  { icon_key: "proactivity", icon_color: "#FACC15", name: "Proatividade" },
  { icon_key: "creativity", icon_color: "#FB923C", name: "Criatividade" },
];

// Mapa de categorização hard skills por icon_key
const HARD_CATEGORY_MAP: Record<string, string> = {
  // Edição
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
  // Frontend
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
  // Backend
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
  // Cloud & DB
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
  // Ferramentas
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
  // Novas skills
  "electron": "Frontend",
  "gsap": "Frontend",
  "playwright": "Ferramentas",
  "mapbox": "Cloud & DB",
  "stripe": "Ferramentas",
  "zod": "Ferramentas",
  "livekit": "Backend",
};

const HARD_CATEGORY_COLORS: Record<string, string> = {
  "Edição": "#f472b6",
  "Frontend": "#60a5fa",
  "Backend": "#4ade80",
  "Cloud & DB": "#c084fc",
  "Ferramentas": "#fb923c",
};

const HARD_CATEGORY_ORDER = ["Edição", "Frontend", "Backend", "Cloud & DB", "Ferramentas"];

// Mapa de categorização soft skills por icon_key
const SOFT_CATEGORY_MAP: Record<string, string> = {
  // Interpessoal
  "communication": "Interpessoal",
  "teamwork": "Interpessoal",
  "collaboration": "Interpessoal",
  "negotiation": "Interpessoal",
  "empathy": "Interpessoal",
  "networking": "Interpessoal",
  "listening": "Interpessoal",
  "feedback": "Interpessoal",
  "positivity": "Interpessoal",
  // Mentalidade
  "proactivity": "Mentalidade",
  "creativity": "Mentalidade",
  "adaptability": "Mentalidade",
  "resilience": "Mentalidade",
  "growth-mindset": "Mentalidade",
  "curiosity": "Mentalidade",
  "learning": "Mentalidade",
  "innovation": "Mentalidade",
  "critical-thinking": "Mentalidade",
  "passion": "Mentalidade",
  "analytical": "Mentalidade",
  // Gestão
  "organization": "Gestão",
  "problem-solving": "Gestão",
  "commitment": "Gestão",
  "patience": "Gestão",
  "ethics": "Gestão",
  "leadership": "Gestão",
  "time-management": "Gestão",
  "planning": "Gestão",
  "decision-making": "Gestão",
  "attention-detail": "Gestão",
};

const SOFT_CATEGORY_COLORS: Record<string, string> = {
  "Interpessoal": "#c084fc",
  "Mentalidade": "#facc15",
  "Gestão": "#4ade80",
};

const SOFT_CATEGORY_ORDER = ["Interpessoal", "Mentalidade", "Gestão"];

// Skill Icon Component (memoizado)
interface SkillIconProps {
  iconKey: string;
  color: string;
  category: "hard" | "soft";
}

const SkillIcon = memo(({ iconKey, color, category }: SkillIconProps) => {
  const catalogItem = getIconByKey(iconKey, category);
  
  if (!catalogItem) return null;

  const IconComponent = catalogItem.icon;
  
  return (
    <IconComponent
      className="shrink-0"
      style={{
        width: "var(--icon-size)",
        height: "var(--icon-size)",
        color,
      }}
    />
  );
});

SkillIcon.displayName = 'SkillIcon';

// Skill Card Component (memoizado)
interface SkillCardProps {
  skill: Skill;
  category: "hard" | "soft";
}

const SkillCard = memo(({ skill, category }: SkillCardProps) => {
  return (
    <div
      className="flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 transition-colors duration-300 hover:bg-white/20 hover:shadow-[0_0_18px_rgba(255,255,255,0.22)] overflow-hidden shrink-0"
      style={{
        height: "var(--skill-h)",
        gap: "var(--skill-gap)",
        padding: "var(--skill-gap)",
        minWidth: 0,
      }}
    >
      <SkillIcon 
        iconKey={skill.icon_key} 
        color={skill.icon_color} 
        category={category} 
      />
      <span
        className="leading-tight truncate flex-shrink min-w-0"
        style={{
          fontSize: "var(--text-size)",
        }}
      >
        {skill.name}
      </span>
    </div>
  );
});

SkillCard.displayName = 'SkillCard';

// Coluna com scroll individual, título fixo e seta indicadora
interface ScrollableColumnProps {
  title: string;
  color: string;
  skills: Skill[];
  category: "hard" | "soft";
}

const ScrollableColumn = memo(({ title, color, skills, category }: ScrollableColumnProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState(false);
  const [atBottom, setAtBottom] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const checkCanScroll = () => {
      setCanScroll(el.scrollHeight > el.clientHeight + 2);
    };

    const checkScrollPos = () => {
      const threshold = 4;
      const isAtBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - threshold;
      const isAtTop = el.scrollTop <= threshold;
      if (isAtBottom) setAtBottom(true);
      else if (isAtTop) setAtBottom(false);
    };

    checkCanScroll();
    checkScrollPos();

    const ro = new ResizeObserver(checkCanScroll);
    ro.observe(el);
    el.addEventListener('scroll', checkScrollPos, { passive: true });

    return () => {
      ro.disconnect();
      el.removeEventListener('scroll', checkScrollPos);
    };
  }, [skills.length]);

  const ArrowIcon = atBottom ? ChevronUp : ChevronDown;

  return (
    <div className="flex flex-col min-h-0 skill-column" style={{ position: 'relative' }}>
      {/* Título fixo */}
      <span
        className="font-semibold shrink-0 text-center truncate"
        style={{
          fontSize: "var(--text-size)",
          color,
          marginBottom: "var(--skill-gap)",
        }}
      >
        {title}
      </span>

      {/* Wrapper relativo para posicionar a seta dentro da área de scroll */}
      <div className="flex-1 min-h-0" style={{ position: 'relative' }}>
        {/* Coluna com scroll invisível */}
        <div
          ref={scrollRef}
          className="flex flex-col hide-scrollbar"
          style={{
            gap: "var(--skill-gap)",
            overflowY: 'auto',
            height: '100%',
          }}
        >
          {skills.map((skill) => (
            <SkillCard key={skill.id} skill={skill} category={category} />
          ))}
        </div>

        {/* Seta pulsante indicando direção de scroll disponível */}
        {canScroll && (
          <div
            style={{
              position: 'absolute',
              ...(atBottom ? { top: 0 } : { bottom: 0 }),
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <ArrowIcon
              style={{
                width: 'var(--icon-size)',
                height: 'var(--icon-size)',
                color,
                opacity: 0.7,
                animation: 'pulse-slow 1s ease-in-out infinite',
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
});

ScrollableColumn.displayName = 'ScrollableColumn';

// Componente Principal
export const About = memo(({ isVisible = true }: AboutProps) => {
  const [hardSkills, setHardSkills] = useState<Skill[]>([]);
  const [softSkills, setSoftSkills] = useState<Skill[]>([]);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [profileImg, setProfileImg] = useState<string | null>(null);
  const [backgroundImg, setBackgroundImg] = useState<string | null>(null);
  const [profilePos, setProfilePos] = useState("50% 50%");
  const [backgroundPos, setBackgroundPos] = useState("50% 68%");
  const [isLoading, setIsLoading] = useState(true);


  /**
   * Fetch otimizado com cache
   */
  const fetchSkillsData = useCallback(async () => {
    const now = Date.now();
    const isCacheValid = SKILLS_CACHE.timestamp && (now - SKILLS_CACHE.timestamp < CACHE_TTL);

    if (isCacheValid && SKILLS_CACHE.hard && SKILLS_CACHE.soft) {
      setHardSkills(SKILLS_CACHE.hard);
      setSoftSkills(SKILLS_CACHE.soft);
      setResumeUrl(SKILLS_CACHE.resumeUrl);
      setIsLoading(false);
      return;
    }

    try {
      const [hardResult, softResult, settingsResult] = await Promise.all([
        supabase.from("hard_skills").select("*").eq("is_visible", true).order("display_order"),
        supabase.from("soft_skills").select("*").eq("is_visible", true).order("display_order"),
        supabase.from("site_settings").select("resume_url, profile_image_url, background_image_url, profile_image_position, background_image_position").eq("id", "main").single(),
      ]);

      const hardData = hardResult.data || [];
      const softData = softResult.data || [];
      const resumeData = settingsResult.data?.resume_url || null;
      const profileData = settingsResult.data?.profile_image_url || null;
      const bgData = settingsResult.data?.background_image_url || null;

      SKILLS_CACHE.hard = hardData;
      SKILLS_CACHE.soft = softData;
      SKILLS_CACHE.resumeUrl = resumeData;
      SKILLS_CACHE.timestamp = now;

      setHardSkills(hardData);
      setSoftSkills(softData);
      setResumeUrl(resumeData);
      setProfileImg(profileData);
      setBackgroundImg(bgData);
      setProfilePos(settingsResult.data?.profile_image_position || "50% 50%");
      setBackgroundPos(settingsResult.data?.background_image_position || "50% 68%");
    } catch {
      // fetch failed — fallback skills will be used
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSkillsData();
  }, [fetchSkillsData]);

  /**
   * Skills renderizadas (memoizadas)
   */
  const displayHardSkills = useMemo(() => {
    if (hardSkills.length > 0) return hardSkills;
    return DEFAULT_HARD_SKILLS.map((s, i) => ({
      ...s,
      id: `default-hard-${i}`,
      display_order: i
    }));
  }, [hardSkills]);

  const groupedHardSkills = useMemo(() => {
    const groups: Record<string, Skill[]> = {};
    for (const cat of HARD_CATEGORY_ORDER) {
      groups[cat] = [];
    }
    for (const skill of displayHardSkills) {
      const cat = HARD_CATEGORY_MAP[skill.icon_key] || "Ferramentas";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(skill);
    }
    return HARD_CATEGORY_ORDER.filter(cat => groups[cat].length > 0).map(cat => ({
      name: cat,
      color: HARD_CATEGORY_COLORS[cat] || "#60a5fa",
      skills: groups[cat],
    }));
  }, [displayHardSkills]);

  const displaySoftSkills = useMemo(() => {
    if (softSkills.length > 0) return softSkills;
    return DEFAULT_SOFT_SKILLS.map((s, i) => ({
      ...s,
      id: `default-soft-${i}`,
      display_order: i
    }));
  }, [softSkills]);

  const groupedSoftSkills = useMemo(() => {
    const groups: Record<string, Skill[]> = {};
    for (const cat of SOFT_CATEGORY_ORDER) {
      groups[cat] = [];
    }
    for (const skill of displaySoftSkills) {
      const cat = SOFT_CATEGORY_MAP[skill.icon_key] || "Interpessoal";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(skill);
    }
    return SOFT_CATEGORY_ORDER.filter(cat => groups[cat].length > 0).map(cat => ({
      name: cat,
      color: SOFT_CATEGORY_COLORS[cat] || "#c084fc",
      skills: groups[cat],
    }));
  }, [displaySoftSkills]);

  /**
   * Button base styles (memoizado)
   */
  const btnBase = useMemo(() => 
    "w-full inline-flex items-center justify-center " +
    "rounded-md font-medium text-white shadow-sm " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 " +
    "transition-colors duration-300 ease-in-out " +
    "hover:shadow-md"
  , []);

  /**
   * CSS Variables (memoizadas)
   */
  const cardStyle = useMemo<React.CSSProperties>(() => ({
    "--skill-min": "clamp(80px, 7.6vw, 150px)",
    "--skill-h": "clamp(32px, 3.2vh, 70px)",
    "--skill-gap": "clamp(3px, 0.35vw, 10px)",
    "--icon-size": "clamp(12px, 1.2vw, 22px)",
    "--text-size": "clamp(8px, 0.75vw, 13px)",
    "--padding": "clamp(8px, 1vw, 18px)",
    "--section-gap": "clamp(8px, 1.2vw, 18px)",
    "--title-size": "clamp(12px, 1.35vw, 26px)",
    "--subtitle-size": "clamp(10px, 1vw, 16px)",
    "--btn-size": "clamp(9px, 0.85vw, 14px)",
    "--btn-icon": "clamp(12px, 1.05vw, 18px)",
    "--btn-py": "clamp(8px, 0.9vh, 16px)",
    "--btn-px": "clamp(12px, 1.4vw, 28px)",
    "--avatar": "clamp(60px, 9vw, 170px)",
  } as React.CSSProperties), []);

  /**
   * Sem scale — colunas de skills usam scroll invisível
   */

  /**
   * Loading State
   */
  if (isLoading) {
    return (
      <section
        className="w-full h-full bg-transparent flex items-center justify-center"
        style={cardStyle}
      >
        <div className="relative z-[1] w-full h-full rounded-2xl bg-black/25 backdrop-blur-sm border border-white/10 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            <p className="text-white/70 text-sm">Carregando perfil...</p>
          </div>
        </div>
      </section>
    );
  }

  /**
   * Render Principal
   */
  return (
    <section
      className={`w-full h-full bg-transparent transition-opacity duration-1000 ease-out ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      style={cardStyle}
    >
      <div className="w-full h-full relative rounded-2xl overflow-hidden">
        {/* Overlay glass */}
        <div
          aria-hidden
          className="absolute inset-0 z-0 rounded-2xl
                     bg-black/25 backdrop-blur-sm backdrop-saturate-150
                     border border-white/10
                     shadow-[0_8px_30px_rgba(0,0,0,0.25)]
                     pointer-events-none"
        />

        {/* Conteúdo principal */}
        <div className="relative z-[1] h-full flex flex-col p-[var(--padding)] gap-[var(--section-gap)]">
          
          {/* Topo: Background + Avatar */}
          <div
            className="relative shrink-0 rounded-2xl overflow-hidden"
            style={{ height: "clamp(220px, 34vh, 420px)" }}
          >
            <img
              src={backgroundImg || about2Img}
              alt="Background workspace"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                e.currentTarget.style.opacity = "0";
                (e.currentTarget.parentElement as HTMLElement | null)?.classList.add(
                  "bg-white/5"
                );
              }}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-[1.08]"
              style={{ objectPosition: backgroundPos }}
            />

            {/* Avatar */}
            <div className="absolute right-[var(--padding)] bottom-[var(--padding)] z-20 flex flex-col items-center pointer-events-auto">
              <div
                className="relative border-[3px] border-white/40 overflow-hidden rounded-lg shadow-lg avatar-size"
              >
                <img
                  src={profileImg || about1Img}
                  alt="Foto de Swamiy Saraiva"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    (e.currentTarget.parentElement as HTMLElement | null)?.classList.add(
                      "bg-white/10"
                    );
                  }}
                  className="w-full h-full object-cover"
                  style={{ objectPosition: profilePos }}
                />
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div
            className="grid grid-cols-2 sm:grid-cols-3 md:flex w-full shrink-0"
            style={{ gap: 'var(--skill-gap)' }}
          >
            <Link
              to="/portfolio/edits"
              onMouseEnter={() => import("@/pages/portfolio/Edits")}
              className={`${btnBase} bg-blue-800 hover:bg-blue-900 active:bg-blue-950 focus-visible:outline-blue-400 md:flex-1`}
              style={{ fontSize: 'var(--btn-size)', padding: 'var(--btn-py) var(--btn-px)', gap: 'var(--skill-gap)' }}
            >
              <Clapperboard style={{ width: 'var(--btn-icon)', height: 'var(--btn-icon)', flexShrink: 0 }} />
              <span className="truncate">Portfólio Editor</span>
            </Link>

            <Link
              to="/portfolio/dev"
              onMouseEnter={() => import("@/pages/portfolio/Dev")}
              className={`${btnBase} bg-purple-600 hover:bg-purple-700 active:bg-purple-800 focus-visible:outline-purple-400 md:flex-1`}
              style={{ fontSize: 'var(--btn-size)', padding: 'var(--btn-py) var(--btn-px)', gap: 'var(--skill-gap)' }}
            >
              <Code2 style={{ width: 'var(--btn-icon)', height: 'var(--btn-icon)', flexShrink: 0 }} />
              <span className="truncate">Portfólio Dev</span>
            </Link>

            <a
              href="https://wa.me/5521969381944"
              target="_blank"
              rel="noopener noreferrer"
              className={`${btnBase} bg-green-500 hover:bg-green-600 active:bg-green-700 focus-visible:outline-green-300 md:flex-1`}
              style={{ fontSize: 'var(--btn-size)', padding: 'var(--btn-py) var(--btn-px)', gap: 'var(--skill-gap)' }}
            >
              <MessageCircle style={{ width: 'var(--btn-icon)', height: 'var(--btn-icon)', flexShrink: 0 }} />
              <span className="truncate">Whatsapp</span>
            </a>

            <a
              href="https://www.linkedin.com/in/swami-saraiva/"
              target="_blank"
              rel="noopener noreferrer"
              className={`${btnBase} md:flex-1`}
              style={{ fontSize: 'var(--btn-size)', padding: 'var(--btn-py) var(--btn-px)', gap: 'var(--skill-gap)', backgroundColor: '#0A66C2' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#004182'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0A66C2'}
            >
              <Linkedin style={{ width: 'var(--btn-icon)', height: 'var(--btn-icon)', flexShrink: 0 }} />
              <span className="truncate">LinkedIn</span>
            </a>

            <a
              href={resumeUrl || "/Curriculo_Swamiy_Saraiva.pdf"}
              target="_blank"
              rel="noopener noreferrer"
              className={`${btnBase} bg-red-500 hover:bg-red-600 active:bg-red-700 focus-visible:outline-red-400 md:flex-1`}
              style={{ fontSize: 'var(--btn-size)', padding: 'var(--btn-py) var(--btn-px)', gap: 'var(--skill-gap)' }}
            >
              <FileText style={{ width: 'var(--btn-icon)', height: 'var(--btn-icon)', flexShrink: 0 }} />
              <span className="truncate">Currículo</span>
            </a>

            <a
              href="https://github.com/Saraiva94"
              target="_blank"
              rel="noopener noreferrer"
              className={`${btnBase} bg-black hover:bg-gray-900 active:bg-gray-800 !text-white focus-visible:outline-gray-700 md:flex-1`}
              style={{ fontSize: 'var(--btn-size)', padding: 'var(--btn-py) var(--btn-px)', gap: 'var(--skill-gap)' }}
            >
              <Github style={{ width: 'var(--btn-icon)', height: 'var(--btn-icon)', flexShrink: 0 }} className="text-white" />
              <span className="text-white truncate">Github</span>
            </a>
          </div>

          {/* Educação + Skills */}
          <div className="relative z-0 flex-1 min-h-0 text-white overflow-hidden flex flex-col">
            
            {/* Educação */}
            <div className="text-white/90 text-center shrink-0" style={{ marginBottom: 'var(--skill-gap)' }}>
              <span className="block font-bold whitespace-nowrap" style={{ fontSize: 'var(--title-size)' }}>
                Análise e Desenvolvimento de Sistemas (ADS)
              </span>
              <span className="block" style={{ fontSize: 'var(--subtitle-size)' }}>Faculdade Unigranrio</span>
            </div>

            {/* Skills Container — scroll invisível nas colunas */}
            <div
              className="flex flex-1 min-h-0 hide-scrollbar skills-container"
              style={{ gap: "var(--section-gap)", overflow: 'hidden' }}
            >
              <div className="flex h-full skills-inner" style={{ gap: "var(--section-gap)", minWidth: '100%' }}>
                  
                  {/* Hard Skills - Categorizado */}
                  <section className="flex-[2] flex flex-col min-h-0">
                    <h3
                      className="font-bold text-sky-400 shrink-0 text-center"
                      style={{
                        fontSize: "var(--title-size)",
                        marginBottom: "var(--skill-gap)",
                      }}
                    >
                      Hard skills
                    </h3>
                    <div
                      className="grid flex-1 min-h-0 skills-grid"
                      style={{
                        gridTemplateColumns: `repeat(${groupedHardSkills.length}, 1fr)`,
                        gridTemplateRows: '1fr',
                        gap: "var(--skill-gap)",
                      }}
                    >
                      {groupedHardSkills.map((group) => (
                        <ScrollableColumn
                          key={group.name}
                          title={group.name}
                          color={group.color}
                          skills={group.skills}
                          category="hard"
                        />
                      ))}
                    </div>
                  </section>

                  {/* Soft Skills - Categorizado */}
                  <section className="flex-1 flex flex-col min-h-0">
                    <h3
                      className="font-bold text-sky-400 shrink-0 text-center"
                      style={{
                        fontSize: "var(--title-size)",
                        marginBottom: "var(--skill-gap)",
                      }}
                    >
                      Soft skills
                    </h3>
                    <div
                      className="grid flex-1 min-h-0 skills-grid"
                      style={{
                        gridTemplateColumns: `repeat(${groupedSoftSkills.length}, 1fr)`,
                        gridTemplateRows: '1fr',
                        gap: "var(--skill-gap)",
                      }}
                    >
                      {groupedSoftSkills.map((group) => (
                        <ScrollableColumn
                          key={group.name}
                          title={group.name}
                          color={group.color}
                          skills={group.skills}
                          category="soft"
                        />
                      ))}
                    </div>
                  </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

About.displayName = 'About';

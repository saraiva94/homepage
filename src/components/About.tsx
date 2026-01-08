/**
 * About Component - Versão Otimizada
 * 
 * Otimizações:
 * - React.memo para evitar re-renders
 * - useMemo para skills renderizadas
 * - useCallback para funções estáveis
 * - Cache strategy para fetch
 */

import { Link } from "react-router-dom";
import { useMemo, useRef, useEffect, useState, useCallback, memo } from "react";
import {
  Clapperboard,
  Code2,
  FileText,
  Github,
  MessageCircle,
} from "lucide-react";
import { useFitScale } from "@/hooks/useFitScale";
import { supabase } from "@/integrations/backend/client";
import { getIconByKey } from "@/lib/skillIconsCatalog";
import about1ImgRaw from "@/assets/eu.png";
import about2ImgRaw from "@/assets/background.jpg";

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
  { icon_key: "html5", icon_color: "#E34F26", name: "HTML5 & CSS3" },
  { icon_key: "javascript", icon_color: "#F7DF1E", name: "JavaScript" },
  { icon_key: "typescript", icon_color: "#3178C6", name: "TypeScript" },
  { icon_key: "react", icon_color: "#61DAFB", name: "React" },
  { icon_key: "react-native", icon_color: "#61DAFB", name: "React Native" },
  { icon_key: "nextjs", icon_color: "#FFFFFF", name: "Next.js" },
  { icon_key: "nodejs", icon_color: "#339933", name: "Node.js" },
  { icon_key: "bunjs", icon_color: "#FBF0DF", name: "Bun.js" },
  { icon_key: "python", icon_color: "#3776AB", name: "Python" },
  { icon_key: "azure", icon_color: "#0078D4", name: "Azure" },
  { icon_key: "mysql", icon_color: "#4479A1", name: "MySQL" },
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
      className="flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 transition-all duration-300 hover:bg-white/20 hover:-translate-y-0.5 hover:shadow-[0_0_18px_rgba(255,255,255,0.22)] overflow-hidden"
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

// Componente Principal
export const About = memo(({ isVisible = true }: AboutProps) => {
  const [hardSkills, setHardSkills] = useState<Skill[]>([]);
  const [softSkills, setSoftSkills] = useState<Skill[]>([]);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const skillsViewportRef = useRef<HTMLDivElement | null>(null);
  const skillsContentRef = useRef<HTMLDivElement | null>(null);

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
        supabase.from("hard_skills").select("*").order("display_order"),
        supabase.from("soft_skills").select("*").order("display_order"),
        supabase.from("site_settings").select("resume_url").eq("id", "main").single(),
      ]);

      const hardData = hardResult.data || [];
      const softData = softResult.data || [];
      const resumeData = settingsResult.data?.resume_url || null;

      // Atualiza cache
      SKILLS_CACHE.hard = hardData;
      SKILLS_CACHE.soft = softData;
      SKILLS_CACHE.resumeUrl = resumeData;
      SKILLS_CACHE.timestamp = now;

      setHardSkills(hardData);
      setSoftSkills(softData);
      setResumeUrl(resumeData);
    } catch (error) {
      console.error('[About] Error fetching skills:', error);
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

  const displaySoftSkills = useMemo(() => {
    if (softSkills.length > 0) return softSkills;
    return DEFAULT_SOFT_SKILLS.map((s, i) => ({ 
      ...s, 
      id: `default-soft-${i}`, 
      display_order: i 
    }));
  }, [softSkills]);

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
    "--avatar": "clamp(60px, 9vw, 170px)",
  } as React.CSSProperties), []);

  /**
   * Fit Scale Hook
   */
  const scale = useFitScale(skillsViewportRef.current, skillsContentRef.current, {
    minScale: 0.82,
    maxScale: 1,
  });

  const scaledStyle = useMemo<React.CSSProperties>(
    () => ({
      transform: `scale(${scale})`,
      transformOrigin: "top center",
      willChange: scale < 1 ? "transform" : "auto",
    }),
    [scale]
  );

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
        <div className="relative z-[1] h-full flex flex-col p-[var(--padding)] gap-[var(--skill-gap)]">
          
          {/* Topo: Background + Avatar */}
          <div
            className="relative shrink-0 rounded-2xl overflow-hidden"
            style={{ height: "clamp(220px, 34vh, 420px)" }}
          >
            <img
              src={about2Img}
              alt="Background workspace"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                console.error("[About] Falha ao carregar background.jpg");
                e.currentTarget.style.opacity = "0";
                (e.currentTarget.parentElement as HTMLElement | null)?.classList.add(
                  "bg-white/5"
                );
              }}
              className="absolute inset-0 w-full h-full object-cover object-[50%_68%] 
                         transition-transform duration-500 hover:scale-[1.08]"
            />

            {/* Avatar */}
            <div className="absolute right-[var(--padding)] bottom-[var(--padding)] z-20 flex flex-col items-center pointer-events-auto">
              <div
                className="relative border-[3px] border-white/40 overflow-hidden rounded-lg shadow-lg"
                style={{ width: "var(--avatar)", height: "var(--avatar)" }}
              >
                <img
                  src={about1Img}
                  alt="Foto de Swamiy Saraiva"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    console.error("[About] Falha ao carregar eu.png");
                    e.currentTarget.style.display = "none";
                    (e.currentTarget.parentElement as HTMLElement | null)?.classList.add(
                      "bg-white/10"
                    );
                  }}
                  className="w-full h-full object-cover"
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
              className={`${btnBase} bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus-visible:outline-blue-400 md:flex-1`}
              style={{ fontSize: 'var(--btn-size)', padding: 'var(--skill-gap) var(--padding)', gap: 'var(--skill-gap)' }}
            >
              <Clapperboard style={{ width: 'var(--btn-icon)', height: 'var(--btn-icon)', flexShrink: 0 }} />
              <span className="truncate">Portfólio Editor</span>
            </Link>

            <Link
              to="/portfolio/dev"
              className={`${btnBase} bg-purple-600 hover:bg-purple-700 active:bg-purple-800 focus-visible:outline-purple-400 md:flex-1`}
              style={{ fontSize: 'var(--btn-size)', padding: 'var(--skill-gap) var(--padding)', gap: 'var(--skill-gap)' }}
            >
              <Code2 style={{ width: 'var(--btn-icon)', height: 'var(--btn-icon)', flexShrink: 0 }} />
              <span className="truncate">Portfólio Dev</span>
            </Link>

            <a
              href="https://wa.me/5521969381944"
              target="_blank"
              rel="noopener noreferrer"
              className={`${btnBase} bg-green-500 hover:bg-green-600 active:bg-green-700 focus-visible:outline-green-300 md:flex-1`}
              style={{ fontSize: 'var(--btn-size)', padding: 'var(--skill-gap) var(--padding)', gap: 'var(--skill-gap)' }}
            >
              <MessageCircle style={{ width: 'var(--btn-icon)', height: 'var(--btn-icon)', flexShrink: 0 }} />
              <span className="truncate">Whatsapp</span>
            </a>

            <a
              href={resumeUrl || "/Curriculo_Swamiy_Saraiva.pdf"}
              download="Curriculo_Swamiy_Saraiva.pdf"
              className={`${btnBase} bg-red-500 hover:bg-red-600 active:bg-red-700 focus-visible:outline-red-400 md:flex-1`}
              style={{ fontSize: 'var(--btn-size)', padding: 'var(--skill-gap) var(--padding)', gap: 'var(--skill-gap)' }}
            >
              <FileText style={{ width: 'var(--btn-icon)', height: 'var(--btn-icon)', flexShrink: 0 }} />
              <span className="truncate">Currículo</span>
            </a>

            <a
              href="https://github.com/Saraiva94"
              target="_blank"
              rel="noopener noreferrer"
              className={`${btnBase} col-span-2 sm:col-span-1 bg-black hover:bg-gray-900 active:bg-gray-800 !text-white focus-visible:outline-gray-700 md:flex-1`}
              style={{ fontSize: 'var(--btn-size)', padding: 'var(--skill-gap) var(--padding)', gap: 'var(--skill-gap)' }}
            >
              <Github style={{ width: 'var(--btn-icon)', height: 'var(--btn-icon)', flexShrink: 0 }} className="text-white" />
              <span className="text-white truncate">Github</span>
            </a>
          </div>

          {/* Educação + Skills */}
          <div className="relative z-0 flex-1 min-h-0 text-white overflow-hidden flex flex-col">
            
            {/* Educação */}
            <div className="text-white/90 leading-snug text-center shrink-0" style={{ marginBottom: 'var(--skill-gap)' }}>
              <span className="block font-bold leading-tight md:hidden" style={{ fontSize: 'var(--title-size)' }}>
                Análise e<br />
                desenvolvimento<br />
                de sistemas (ADS)
              </span>
              <span className="hidden md:block font-bold" style={{ fontSize: 'var(--title-size)' }}>
                Análise e Desenvolvimento de Sistemas (ADS)
              </span>
              <span className="block" style={{ fontSize: 'var(--subtitle-size)' }}>Faculdade Unigranrio</span>
            </div>

            {/* Skills Container */}
            <div
              ref={skillsViewportRef}
              className="flex flex-1 min-h-0 overflow-hidden"
              style={{ gap: "var(--section-gap)" }}
            >
              <div ref={skillsContentRef} className="w-full" style={scaledStyle}>
                <div className="flex w-full" style={{ gap: "var(--section-gap)" }}>
                  
                  {/* Hard Skills */}
                  <section className="flex-[2] flex flex-col min-h-0">
                    <h3
                      className="font-bold text-sky-400 shrink-0"
                      style={{
                        fontSize: "var(--title-size)",
                        marginBottom: "var(--skill-gap)",
                      }}
                    >
                      Hard skills
                    </h3>
                    <div
                      className="grid flex-1 min-h-0 overflow-hidden content-start"
                      style={{
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(var(--skill-min), 1fr))",
                        gap: "var(--skill-gap)",
                      }}
                    >
                      {displayHardSkills.map((skill) => (
                        <SkillCard key={skill.id} skill={skill} category="hard" />
                      ))}
                    </div>
                  </section>

                  {/* Soft Skills */}
                  <section className="flex-1 flex flex-col min-h-0">
                    <h3
                      className="font-bold text-sky-400 shrink-0"
                      style={{
                        fontSize: "var(--title-size)",
                        marginBottom: "var(--skill-gap)",
                      }}
                    >
                      Soft skills
                    </h3>
                    <div
                      className="grid flex-1 min-h-0 overflow-hidden content-start"
                      style={{
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(var(--skill-min), 1fr))",
                        gap: "var(--skill-gap)",
                      }}
                    >
                      {displaySoftSkills.map((skill) => (
                        <SkillCard key={skill.id} skill={skill} category="soft" />
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

About.displayName = 'About';

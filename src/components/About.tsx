import { Link } from "react-router-dom";
import { useMemo, useRef, useEffect, useState } from "react";
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

// Default skills (fallback se não houver no banco)
const defaultHardSkills = [
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

const defaultSoftSkills = [
  { icon_key: "communication", icon_color: "#60A5FA", name: "Comunicação" },
  { icon_key: "organization", icon_color: "#4ADE80", name: "Organização" },
  { icon_key: "teamwork", icon_color: "#C084FC", name: "Trabalho em equipe" },
  { icon_key: "proactivity", icon_color: "#FACC15", name: "Proatividade" },
  { icon_key: "creativity", icon_color: "#FB923C", name: "Criatividade" },
];

export function About({ isVisible = true }: AboutProps) {
  const [hardSkills, setHardSkills] = useState<Skill[]>([]);
  const [softSkills, setSoftSkills] = useState<Skill[]>([]);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [, setLoaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [hardResult, softResult, settingsResult] = await Promise.all([
        supabase.from("hard_skills").select("*").order("display_order"),
        supabase.from("soft_skills").select("*").order("display_order"),
        supabase.from("site_settings").select("resume_url").eq("id", "main").single(),
      ]);

      if (hardResult.data && hardResult.data.length > 0) {
        setHardSkills(hardResult.data);
      }
      if (softResult.data && softResult.data.length > 0) {
        setSoftSkills(softResult.data);
      }
      if (settingsResult.data?.resume_url) {
        setResumeUrl(settingsResult.data.resume_url);
      }
      setLoaded(true);
    };

    fetchData();
  }, []);

  // Use skills do banco ou fallback para defaults
  const displayHardSkills = hardSkills.length > 0 ? hardSkills : defaultHardSkills.map((s, i) => ({ ...s, id: `default-hard-${i}`, display_order: i }));
  const displaySoftSkills = softSkills.length > 0 ? softSkills : defaultSoftSkills.map((s, i) => ({ ...s, id: `default-soft-${i}`, display_order: i }));

  const btnBase =
    "w-full inline-flex items-center justify-center " +
    "rounded-md font-medium text-white shadow-sm " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 " +
    "transition-colors duration-300 ease-in-out " +
    "hover:shadow-md";

  const cardStyle = {
    "--skill-min": "clamp(92px, 7.6vw, 150px)",
    "--skill-h": "clamp(34px, 3.2vh, 70px)",
    "--skill-gap": "clamp(4px, 0.35vw, 10px)",
    "--icon-size": "clamp(14px, 1.2vw, 22px)",
    "--text-size": "clamp(9px, 0.75vw, 13px)",
    "--padding": "clamp(10px, 1vw, 18px)",
    "--section-gap": "clamp(10px, 1.2vw, 18px)",
    "--title-size": "clamp(14px, 1.35vw, 26px)",
    "--subtitle-size": "clamp(12px, 1vw, 16px)",
    "--btn-size": "clamp(10px, 0.85vw, 14px)",
    "--btn-icon": "clamp(13px, 1.05vw, 18px)",
    "--avatar": "clamp(76px, 9vw, 170px)",
  } as React.CSSProperties;

  const skillsViewportRef = useRef<HTMLDivElement | null>(null);
  const skillsContentRef = useRef<HTMLDivElement | null>(null);

  const scale = useFitScale(skillsViewportRef.current, skillsContentRef.current, {
    minScale: 0.82,
    maxScale: 1,
  });

  const scaledStyle = useMemo<React.CSSProperties>(
    () => ({
      transform: `scale(${scale})`,
      transformOrigin: "top center",
      willChange: "transform",
    }),
    [scale]
  );

  const renderSkillIcon = (iconKey: string, color: string, category: "hard" | "soft") => {
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
  };

  return (
    <section
      className={`w-full h-full bg-transparent transition-opacity duration-1000 ease-out ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      style={cardStyle}
    >
      <div className="w-full h-full relative rounded-2xl overflow-hidden">
        {/* overlay glass */}
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
          {/* Topo: imagem de background com avatar */}
          <div
            className="relative shrink-0 rounded-2xl overflow-hidden"
            style={{ height: "clamp(220px, 34vh, 420px)" }}
          >
            <img
              src={about2Img}
              alt="background"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                console.error("[About] Falha ao carregar background.jpg", about2Img);
                e.currentTarget.style.opacity = "0";
                (e.currentTarget.parentElement as HTMLElement | null)?.classList.add(
                  "bg-white/5"
                );
              }}
              className="absolute inset-0 w-full h-full object-cover object-[50%_68%] origin-[50%_68%]
                         transition-transform duration-500 will-change-transform hover:scale-[1.08]"
            />

            {/* avatar (direita) */}
            <div className="absolute right-[var(--padding)] bottom-[var(--padding)] z-20 flex flex-col items-center pointer-events-auto">
              <div
                className="relative border-[3px] border-white/40 overflow-hidden rounded-lg shadow-lg"
                style={{ width: "var(--avatar)", height: "var(--avatar)" }}
              >
                <img
                  src={about1Img}
                  alt="foto do Swamiy"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    console.error("[About] Falha ao carregar eu.png", about1Img);
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

          {/* Botões horizontais abaixo da imagem */}
          <div className="flex w-full shrink-0" style={{ gap: 'var(--skill-gap)' }}>
            <Link
              to="/portfolio/edits"
              className={`${btnBase} flex-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus-visible:outline-blue-400`}
              style={{ fontSize: 'var(--btn-size)', padding: 'var(--skill-gap) var(--padding)', gap: 'var(--skill-gap)' }}
            >
              <Clapperboard style={{ width: 'var(--btn-icon)', height: 'var(--btn-icon)', flexShrink: 0 }} />
              <span className="truncate">Portfólio Editor</span>
            </Link>

            <Link
              to="/portfolio/dev"
              className={`${btnBase} flex-1 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 focus-visible:outline-purple-400`}
              style={{ fontSize: 'var(--btn-size)', padding: 'var(--skill-gap) var(--padding)', gap: 'var(--skill-gap)' }}
            >
              <Code2 style={{ width: 'var(--btn-icon)', height: 'var(--btn-icon)', flexShrink: 0 }} />
              <span className="truncate">Portfólio Dev</span>
            </Link>

            <a
              href="https://wa.me/5521969381944"
              className={`${btnBase} flex-1 bg-green-500 hover:bg-green-600 active:bg-green-700 focus-visible:outline-green-300`}
              style={{ fontSize: 'var(--btn-size)', padding: 'var(--skill-gap) var(--padding)', gap: 'var(--skill-gap)' }}
            >
              <MessageCircle style={{ width: 'var(--btn-icon)', height: 'var(--btn-icon)', flexShrink: 0 }} />
              <span className="truncate">Whatsapp</span>
            </a>

            <a
              href={resumeUrl || "/Curriculo_Swamiy_Saraiva.pdf"}
              download="Curriculo_Swamiy_Saraiva.pdf"
              className={`${btnBase} flex-1 bg-red-500 hover:bg-red-600 active:bg-red-700 focus-visible:outline-red-400`}
              style={{ fontSize: 'var(--btn-size)', padding: 'var(--skill-gap) var(--padding)', gap: 'var(--skill-gap)' }}
            >
              <FileText style={{ width: 'var(--btn-icon)', height: 'var(--btn-icon)', flexShrink: 0 }} />
              <span className="truncate">Currículo</span>
            </a>

            <a
              href="https://github.com/Saraiva94"
              className={`${btnBase} flex-1 bg-black hover:bg-gray-900 active:bg-gray-800 !text-white focus-visible:outline-gray-700`}
              style={{ fontSize: 'var(--btn-size)', padding: 'var(--skill-gap) var(--padding)', gap: 'var(--skill-gap)' }}
            >
              <Github style={{ width: 'var(--btn-icon)', height: 'var(--btn-icon)', flexShrink: 0 }} className="text-white" />
              <span className="text-white truncate">Github</span>
            </a>
          </div>

          {/* Base: texto e skills */}
          <div className="relative z-0 flex-1 min-h-0 text-white overflow-hidden flex flex-col">
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

            <div
              ref={skillsViewportRef}
              className="flex flex-1 min-h-0 overflow-hidden"
              style={{ gap: "var(--section-gap)" }}
            >
              <div ref={skillsContentRef} className="w-full" style={scaledStyle}>
                <div className="flex w-full" style={{ gap: "var(--section-gap)" }}>
                  {/* Hard Skills - 2/3 do espaço */}
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
                        <div
                          key={skill.id}
                          className="flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 transition-all duration-300 hover:bg-white/20 hover:-translate-y-0.5 hover:shadow-[0_0_18px_rgba(255,255,255,0.22)]"
                          style={{
                            height: "var(--skill-h)",
                            gap: "var(--skill-gap)",
                            padding: "var(--skill-gap)",
                          }}
                        >
                          {renderSkillIcon(skill.icon_key, skill.icon_color, "hard")}
                          <span
                            className="leading-tight truncate"
                            style={{
                              fontSize: "var(--text-size)",
                              maxWidth: "16ch",
                            }}
                          >
                            {skill.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Soft Skills - 1/3 do espaço */}
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
                        <div
                          key={skill.id}
                          className="flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 transition-all duration-300 hover:bg-white/20 hover:-translate-y-0.5 hover:shadow-[0_0_18px_rgba(255,255,255,0.22)]"
                          style={{
                            height: "var(--skill-h)",
                            gap: "var(--skill-gap)",
                            padding: "var(--skill-gap)",
                          }}
                        >
                          {renderSkillIcon(skill.icon_key, skill.icon_color, "soft")}
                          <span
                            className="leading-tight truncate"
                            style={{
                              fontSize: "var(--text-size)",
                              maxWidth: "18ch",
                            }}
                          >
                            {skill.name}
                          </span>
                        </div>
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
}

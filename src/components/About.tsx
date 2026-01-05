import { Link } from "react-router-dom";
import { useMemo, useRef } from "react";
import {
  Clapperboard,
  Code2,
  FileText,
  Github,
  MessageCircle,
  MessagesSquare,
  ListChecks,
  Users,
  Zap,
  Lightbulb,
} from "lucide-react";
import { useFitScale } from "@/hooks/useFitScale";
import {
  SiAdobeaftereffects,
  SiAdobepremierepro,
  SiAdobecreativecloud,
  SiHtml5,
  SiJavascript,
  SiTypescript,
  SiReact,
  SiNextdotjs,
  SiNodedotjs,
  SiMysql,
  SiSqlite,
  SiPython,
  SiGit,
  SiGithub,
  SiSupabase,
  SiBun,
} from "react-icons/si";
import { VscAzure } from "react-icons/vsc";
import { FileSpreadsheet } from "lucide-react";
import about1ImgRaw from "@/assets/eu.png";
import about2ImgRaw from "@/assets/background.jpg";

const about1Img = about1ImgRaw as unknown as string;
const about2Img = about2ImgRaw as unknown as string;

interface AboutProps {
  isVisible?: boolean;
}

export function About({ isVisible = true }: AboutProps) {
  const btnBase =
    "w-full inline-flex items-center justify-center " +
    "rounded-md font-medium text-white shadow-sm " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 " +
    "transition-colors duration-300 ease-in-out " +
    "hover:shadow-md";

  // CSS custom properties for responsive sizing
  // Objetivo: manter a UI “cheia” e coerente, e reduzir só quando necessário.
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

  return (
    <section
      className={`w-full h-full bg-transparent transition-opacity duration-1000 ease-out ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      style={cardStyle}
    >
      <div className="w-full h-full relative rounded-2xl overflow-hidden">
        {/* overlay glass - removido ring-1 que causava linha branca piscando */}
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
                // fallback visual para não ficar "sumido"
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
              href="/Curriculo_Swamiy_Saraiva.pdf"
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
                      {[
                        // Edição de vídeo / Design
                        { icon: SiAdobecreativecloud, color: "#DA1F26", label: "Creative Cloud" },
                        { icon: SiAdobeaftereffects, color: "#9999FF", label: "After Effects" },
                        { icon: SiAdobepremierepro, color: "#9999FF", label: "Premiere Pro" },
                        // Frontend
                        { icon: SiHtml5, color: "#E34F26", label: "HTML5 & CSS3" },
                        { icon: SiJavascript, color: "#F7DF1E", label: "JavaScript" },
                        { icon: SiTypescript, color: "#3178C6", label: "TypeScript" },
                        { icon: SiReact, color: "#61DAFB", label: "React" },
                        { icon: SiReact, color: "#61DAFB", label: "React Native" },
                        { icon: SiNextdotjs, color: "#FFFFFF", label: "Next.js" },
                        // Backend & Cloud
                        { icon: SiNodedotjs, color: "#339933", label: "Node.js" },
                        { icon: SiBun, color: "#FBF0DF", label: "Bun.js" },
                        { icon: SiPython, color: "#3776AB", label: "Python" },
                        { icon: VscAzure, color: "#0078D4", label: "Azure" },
                        // Banco de dados
                        { icon: SiMysql, color: "#4479A1", label: "MySQL" },
                        { icon: SiSqlite, color: "#003B57", label: "SQLite" },
                        { icon: SiSupabase, color: "#3ECF8E", label: "Supabase" },
                        // Ferramentas
                        { icon: SiGit, color: "#F05032", label: "Git" },
                        { icon: SiGithub, color: "#FFFFFF", label: "GitHub" },
                        { icon: FileSpreadsheet, color: "#217346", label: "Excel" },
                      ].map((skill, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 transition-all duration-300 hover:bg-white/20 hover:-translate-y-0.5 hover:shadow-[0_0_18px_rgba(255,255,255,0.22)]"
                          style={{
                            height: "var(--skill-h)",
                            gap: "var(--skill-gap)",
                            padding: "var(--skill-gap)",
                          }}
                        >
                          <skill.icon
                            className="shrink-0"
                            style={{
                              width: "var(--icon-size)",
                              height: "var(--icon-size)",
                              color: skill.color,
                            }}
                          />
                          <span
                            className="leading-tight truncate"
                            style={{
                              fontSize: "var(--text-size)",
                              maxWidth: "16ch",
                            }}
                          >
                            {skill.label}
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
                      {[
                        { icon: MessagesSquare, color: "#60A5FA", label: "Comunicação" },
                        { icon: ListChecks, color: "#4ADE80", label: "Organização" },
                        { icon: Users, color: "#C084FC", label: "Trabalho em equipe" },
                        { icon: Zap, color: "#FACC15", label: "Proatividade" },
                        { icon: Lightbulb, color: "#FB923C", label: "Criatividade" },
                      ].map((skill, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 transition-all duration-300 hover:bg-white/20 hover:-translate-y-0.5 hover:shadow-[0_0_18px_rgba(255,255,255,0.22)]"
                          style={{
                            height: "var(--skill-h)",
                            gap: "var(--skill-gap)",
                            padding: "var(--skill-gap)",
                          }}
                        >
                          <skill.icon
                            className="shrink-0"
                            style={{
                              width: "var(--icon-size)",
                              height: "var(--icon-size)",
                              color: skill.color,
                            }}
                          />
                          <span
                            className="leading-tight truncate"
                            style={{
                              fontSize: "var(--text-size)",
                              maxWidth: "18ch",
                            }}
                          >
                            {skill.label}
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

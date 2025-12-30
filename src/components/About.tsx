import { Link } from "react-router-dom";
import {
  Clapperboard,
  Code2,
  FileText,
  Github,
  MessageCircle,
  Film,
  Code,
  FileCode,
  Atom,
  Server,
  Cloud,
  Database,
  MessagesSquare,
  ListChecks,
  Users,
  Zap,
  Lightbulb,
} from "lucide-react";
import about1ImgRaw from "@/assets/eu.png";
import about2ImgRaw from "@/assets/background.jpg";

const about1Img = about1ImgRaw as unknown as string;
const about2Img = about2ImgRaw as unknown as string;

interface AboutProps {
  isVisible?: boolean;
}

export function About({ isVisible = true }: AboutProps) {
  const btnBase =
    "mt-1 w-full inline-flex items-center justify-center " +
    "rounded-md font-medium text-white shadow-sm " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 " +
    "transition-colors duration-300 ease-in-out " +
    "hover:shadow-md";

  // CSS custom properties for responsive sizing - scales with viewport
  const cardStyle = {
    '--skill-w': 'clamp(72px, 6.5vw, 130px)',
    '--skill-h': 'clamp(32px, 2.8vw, 55px)',
    '--skill-gap': 'clamp(2px, 0.2vw, 4px)',
    '--icon-size': 'clamp(10px, 0.9vw, 16px)',
    '--text-size': 'clamp(7px, 0.55vw, 11px)',
    '--padding': 'clamp(6px, 0.8vw, 16px)',
    '--title-size': 'clamp(12px, 1.2vw, 22px)',
    '--subtitle-size': 'clamp(9px, 0.75vw, 14px)',
    '--btn-size': 'clamp(9px, 0.7vw, 13px)',
    '--btn-icon': 'clamp(10px, 0.9vw, 16px)',
    '--avatar': 'clamp(60px, 8vw, 150px)',
  } as React.CSSProperties;

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
                     border border-gray-400/50 ring-1 ring-gray-300/30
                     shadow-[0_8px_30px_rgba(150,150,150,0.15)]
                     pointer-events-none"
        />

        {/* Conteúdo principal */}
        <div className="relative z-[1] h-full flex flex-col p-[var(--padding)] gap-[var(--skill-gap)]">
          {/* Topo: imagem de background com avatar */}
          <div className="relative flex-[0_0_42%] min-h-0 rounded-2xl overflow-hidden">
            <img
              src={about2Img}
              alt="background"
              className="absolute inset-0 w-full h-full object-cover object-[50%_68%] origin-[50%_68%]
                         transition-transform duration-500 will-change-transform hover:scale-[1.08]"
            />

            {/* avatar (direita) */}
            <div className="absolute right-[var(--padding)] bottom-[var(--padding)] z-20 flex flex-col items-center pointer-events-auto">
              <div 
                className="relative border-[3px] border-white/40 overflow-hidden rounded-lg shadow-lg"
                style={{ width: 'var(--avatar)', height: 'var(--avatar)' }}
              >
                <img src={about1Img} alt="foto do Swamiy" className="w-full h-full object-cover" />
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

            <div className="flex flex-1 min-h-0 overflow-hidden" style={{ gap: 'var(--padding)' }}>
              {/* Hard Skills - 2/3 do espaço */}
              <section className="flex-[2] flex flex-col min-h-0">
                <h3 className="font-bold text-sky-400 shrink-0" style={{ fontSize: 'var(--title-size)', marginBottom: 'var(--skill-gap)' }}>Hard skills</h3>
                <div 
                  className="grid grid-flow-col grid-rows-3 content-start"
                  style={{ 
                    gridAutoColumns: 'var(--skill-w)',
                    gap: 'var(--skill-gap)'
                  }}
                >
                  {[
                    { icon: Film, color: "text-purple-400", label: "After Effects" },
                    { icon: Film, color: "text-purple-400", label: "Premiere Pro" },
                    { icon: Code, color: "text-orange-400", label: "HTML5 & CSS3" },
                    { icon: FileCode, color: "text-yellow-400", label: "JavaScript" },
                    { icon: FileCode, color: "text-blue-400", label: "TypeScript" },
                    { icon: Atom, color: "text-cyan-400", label: "React" },
                    { icon: Atom, color: "text-cyan-400", label: "React Native" },
                    { icon: Atom, color: "text-cyan-400", label: "Next.js" },
                    { icon: Server, color: "text-green-400", label: "Node.js" },
                    { icon: Cloud, color: "text-blue-400", label: "Azure" },
                    { icon: Database, color: "text-blue-300", label: "MySQL" },
                    { icon: Database, color: "text-blue-300", label: "SQLite" },
                  ].map((skill, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 transition-all duration-300 hover:bg-white/20 hover:-translate-y-0.5 hover:shadow-[0_0_18px_rgba(255,255,255,0.22)]"
                      style={{ width: 'var(--skill-w)', height: 'var(--skill-h)', gap: 'var(--skill-gap)', padding: 'var(--skill-gap)' }}
                    >
                      <skill.icon 
                        className={`${skill.color} shrink-0`} 
                        style={{ width: 'var(--icon-size)', height: 'var(--icon-size)' }}
                      />
                      <span className="leading-tight truncate" style={{ fontSize: 'var(--text-size)' }}>{skill.label}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Soft Skills - 1/3 do espaço */}
              <section className="flex-1 flex flex-col min-h-0">
                <h3 className="font-bold text-sky-400 shrink-0" style={{ fontSize: 'var(--title-size)', marginBottom: 'var(--skill-gap)' }}>Soft skills</h3>
                <div 
                  className="grid grid-flow-col grid-rows-3 content-start"
                  style={{ 
                    gridAutoColumns: 'var(--skill-w)',
                    gap: 'var(--skill-gap)'
                  }}
                >
                  {[
                    { icon: MessagesSquare, color: "text-blue-400", label: "Comunicação" },
                    { icon: ListChecks, color: "text-green-400", label: "Organização" },
                    { icon: Users, color: "text-purple-400", label: "Trabalho em equipe" },
                    { icon: Zap, color: "text-yellow-400", label: "Proatividade" },
                    { icon: Lightbulb, color: "text-orange-400", label: "Criatividade" },
                  ].map((skill, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 transition-all duration-300 hover:bg-white/20 hover:-translate-y-0.5 hover:shadow-[0_0_18px_rgba(255,255,255,0.22)]"
                      style={{ width: 'var(--skill-w)', height: 'var(--skill-h)', gap: 'var(--skill-gap)', padding: 'var(--skill-gap)' }}
                    >
                      <skill.icon 
                        className={`${skill.color} shrink-0`} 
                        style={{ width: 'var(--icon-size)', height: 'var(--icon-size)' }}
                      />
                      <span className="leading-tight truncate" style={{ fontSize: 'var(--text-size)' }}>{skill.label}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

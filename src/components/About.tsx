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
    "mt-1 w-full inline-flex items-center justify-center gap-[0.4vw] " +
    "px-[0.5vw] py-[0.4vw] rounded-md font-medium text-white text-[clamp(10px,0.8vw,14px)] shadow-sm " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 " +
    "transition-colors duration-300 ease-in-out " +
    "hover:shadow-md";

  // CSS custom properties for responsive sizing
  const cardStyle = {
    '--skill-w': 'clamp(80px, 7vw, 140px)',
    '--skill-h': 'clamp(36px, 3.2vw, 60px)',
    '--skill-gap': 'clamp(2px, 0.2vw, 5px)',
    '--icon-size': 'clamp(12px, 1vw, 18px)',
    '--text-size': 'clamp(8px, 0.6vw, 12px)',
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
        <div className="relative z-[1] h-full flex flex-col p-[clamp(8px,1vw,20px)] gap-[clamp(4px,0.5vw,12px)]">
          {/* Topo: imagem de background com avatar */}
          <div className="relative flex-[0_0_45%] min-h-[clamp(120px,15vw,220px)] rounded-2xl overflow-hidden">
            <img
              src={about2Img}
              alt="background"
              className="absolute inset-0 w-full h-full object-cover object-[50%_68%] origin-[50%_68%]
                         transition-transform duration-500 will-change-transform hover:scale-[1.08]"
            />

            {/* avatar (direita) */}
            <div
              className="absolute right-[clamp(0.5rem,2vw,1rem)] bottom-[clamp(0.5rem,2vw,1rem)] z-20 flex flex-col items-center pointer-events-auto"
              style={{
                ['--avatar' as any]: 'clamp(80px, 10vw, 180px)',
              }}
            >
              <div className="relative w-[var(--avatar)] h-[var(--avatar)] border-4 border-white/40 overflow-hidden rounded-lg shadow-lg">
                <img src={about1Img} alt="foto do Swamiy" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>

          {/* Botões horizontais abaixo da imagem */}
          <div className="flex gap-[clamp(4px,0.5vw,10px)] w-full">
            <Link
              to="/portfolio/edits"
              className={`${btnBase} flex-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus-visible:outline-blue-400`}
            >
              <Clapperboard style={{ width: 'clamp(12px, 1vw, 18px)', height: 'clamp(12px, 1vw, 18px)' }} />
              Portfólio Editor
            </Link>

            <Link
              to="/portfolio/dev"
              className={`${btnBase} flex-1 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 focus-visible:outline-purple-400`}
            >
              <Code2 style={{ width: 'clamp(12px, 1vw, 18px)', height: 'clamp(12px, 1vw, 18px)' }} />
              Portfólio Dev
            </Link>

            <a
              href="https://wa.me/5521969381944"
              className={`${btnBase} flex-1 bg-green-500 hover:bg-green-600 active:bg-green-700 focus-visible:outline-green-300`}
            >
              <MessageCircle style={{ width: 'clamp(12px, 1vw, 18px)', height: 'clamp(12px, 1vw, 18px)' }} />
              Whatsapp
            </a>

            <a
              href="/Curriculo_Swamiy_Saraiva.pdf"
              download="Curriculo_Swamiy_Saraiva.pdf"
              className={`${btnBase} flex-1 bg-red-500 hover:bg-red-600 active:bg-red-700 focus-visible:outline-red-400`}
            >
              <FileText style={{ width: 'clamp(12px, 1vw, 18px)', height: 'clamp(12px, 1vw, 18px)' }} />
              Currículo
            </a>

            <a
              href="https://github.com/Saraiva94"
              className={`${btnBase} flex-1 bg-black hover:bg-gray-900 active:bg-gray-800 !text-white focus-visible:outline-gray-700`}
            >
              <Github style={{ width: 'clamp(12px, 1vw, 18px)', height: 'clamp(12px, 1vw, 18px)' }} className="text-white" />
              <span className="text-white">Github</span>
            </a>
          </div>

          {/* Base: texto e skills */}
          <div className="relative z-0 flex-1 min-h-0 text-white overflow-hidden pr-1 flex flex-col">
            <div className="text-white/90 leading-snug mb-[clamp(4px,0.5vw,12px)] text-center shrink-0">
              <span className="block text-[clamp(14px,1.4vw,24px)] font-bold leading-tight md:hidden">
                Análise e<br />
                desenvolvimento<br />
                de sistemas (ADS)
              </span>
              <span className="hidden md:block text-[clamp(14px,1.4vw,24px)] font-bold">
                Análise e Desenvolvimento de Sistemas (ADS)
              </span>
              <span className="block text-[clamp(10px,0.85vw,16px)]">Faculdade Unigranrio</span>
            </div>

            <div className="flex gap-[clamp(6px,0.8vw,16px)] flex-1 min-h-0 overflow-hidden">
              {/* Hard Skills - 2/3 do espaço */}
              <section className="flex-[2] flex flex-col min-h-0">
                <h3 className="text-[clamp(12px,1.1vw,20px)] font-bold mb-[clamp(2px,0.3vw,8px)] text-sky-400 shrink-0">Hard skills</h3>
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
                      className="flex items-center justify-center gap-[clamp(4px,0.4vw,10px)] bg-white/10 backdrop-blur-sm px-[clamp(6px,0.6vw,14px)] py-[clamp(4px,0.4vw,10px)] rounded-lg border border-white/20 transition-all duration-300 hover:bg-white/20 hover:-translate-y-0.5 hover:shadow-[0_0_18px_rgba(255,255,255,0.22)]"
                      style={{ width: 'var(--skill-w)', height: 'var(--skill-h)' }}
                    >
                      <skill.icon 
                        className={`${skill.color} shrink-0`} 
                        style={{ width: 'var(--icon-size)', height: 'var(--icon-size)' }}
                      />
                      <span style={{ fontSize: 'var(--text-size)' }} className="leading-tight">{skill.label}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Soft Skills - 1/3 do espaço */}
              <section className="flex-1 flex flex-col min-h-0">
                <h3 className="text-[clamp(12px,1.1vw,20px)] font-bold mb-[clamp(2px,0.3vw,8px)] text-sky-400 shrink-0">Soft skills</h3>
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
                      className="flex items-center justify-center gap-[clamp(4px,0.4vw,10px)] bg-white/10 backdrop-blur-sm px-[clamp(6px,0.6vw,14px)] py-[clamp(4px,0.4vw,10px)] rounded-lg border border-white/20 transition-all duration-300 hover:bg-white/20 hover:-translate-y-0.5 hover:shadow-[0_0_18px_rgba(255,255,255,0.22)]"
                      style={{ width: 'var(--skill-w)', height: 'var(--skill-h)' }}
                    >
                      <skill.icon 
                        className={`${skill.color} shrink-0`} 
                        style={{ width: 'var(--icon-size)', height: 'var(--icon-size)' }}
                      />
                      <span style={{ fontSize: 'var(--text-size)' }} className="leading-tight">{skill.label}</span>
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

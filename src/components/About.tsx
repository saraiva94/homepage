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
  Binary,
  GitBranch,
  FileSpreadsheet,
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
    "mt-2 w-[var(--avatar)] inline-flex items-center justify-center gap-2 " +
    "px-4 py-2 rounded-md font-semibold text-white shadow-sm " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 " +
    "transition-colors duration-300 ease-in-out " +
    "motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out " +
    "hover:-translate-y-0.5 hover:shadow-md";

  return (
    <section
      className={`py-6 bg-transparent transition-opacity duration-1000 ease-out ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="relative rounded-3xl p-4 [--avatar:clamp(120px,28vw,240px)] overflow-hidden">
          {/* overlay glass */}
          <div
            aria-hidden
            className="absolute inset-0 z-0 rounded-3xl
                       bg-black/20 backdrop-blur-sm backdrop-saturate-150
                       border border-gray-400/50 ring-1 ring-gray-300/30
                       shadow-[0_8px_30px_rgba(150,150,150,0.15)]
                       pointer-events-none"
          />

          {/* bloco imagem de fundo */}
          <div className="relative z-[1]">
            <div className="relative w-full h-[400px] rounded-3xl overflow-hidden">
              <img
                src={about2Img}
                alt="background"
                className="absolute inset-0 w-full h-full object-cover object-[50%_68%] origin-[50%_68%]
                           transition-transform duration-500 will-change-transform hover:scale-[1.08]"
              />
            </div>

            {/* avatar + botões */}
            <div
              className="
                absolute
                right-[clamp(0.5rem,2vw,1rem)]
                bottom-[calc(-1*var(--avatar))]
                z-20 flex flex-col items-center pointer-events-auto
              "
            >
              {/* avatar */}
              <div className="relative w-[var(--avatar)] h-[var(--avatar)] border-4 overflow-hidden rounded-lg">
                <img src={about1Img} alt="eu" className="w-full h-full object-cover" />
              </div>

              {/* Portfólio Editor */}
              <Link
                to="/portfolio/edits"
                className={`${btnBase} bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus-visible:outline-blue-400`}
              >
                <Clapperboard className="w-4 h-4" />
                Portfólio Editor
              </Link>

              {/* Portfólio Desenvolvedor */}
              <Link
                to="/portfolio/dev"
                className={`${btnBase} bg-purple-600 hover:bg-purple-700 active:bg-purple-800 focus-visible:outline-purple-400`}
              >
                <Code2 className="w-4 h-4" />
                Portfólio Dev
              </Link>

              {/* WhatsApp (verde) */}
              <a
                href="https://wa.me/5521969381944"
                className={`${btnBase} bg-green-500 hover:bg-green-600 active:bg-green-700 focus-visible:outline-green-300`}
              >
                <MessageCircle className="w-4 h-4" />
                Whatsapp
              </a>

              {/* Currículo (vermelho) */}
              <a
                href="/Curriculo_Swamiy_Saraiva.pdf"
                download="Curriculo_Swamiy_Saraiva.pdf"
                className={`${btnBase} bg-red-500 hover:bg-red-600 active:bg-red-700 focus-visible:outline-red-400`}
              >
                <FileText className="w-4 h-4" />
                Currículo
              </a>

              {/* GitHub (preto) */}
              <a
                href="https://github.com/Saraiva94"
                className={`${btnBase} bg-black hover:bg-gray-900 active:bg-gray-800 !text-white focus-visible:outline-gray-700`}
              >
                <Github className="w-4 h-4 text-white" />
                <span className="text-white">Github</span>
              </a>
            </div>
          </div>

          {/* TEXTO */}
          <div className="relative z-0 mt-8 text-white">
            <div className="text-white/90 leading-snug mb-6 text-center">
              <span className="block text-2xl font-bold leading-tight md:hidden">
                Análise e<br />
                desenvolvimento<br />
                de sistemas (ADS)
              </span>
              <span className="hidden md:block text-2xl font-bold">
                Análise e Desenvolvimento de Sistemas (ADS)
              </span>
              <span className="block text-base">Faculdade Unigranrio</span>
            </div>

            <div className="relative">
              {/* Hard skills - à esquerda */}
              <section>
                <h3 className="text-2xl font-bold mb-3 text-sky-400">Hard skills</h3>
                <ul className="space-y-1">
                  <li className="flex items-center gap-2">
                    <Film className="w-4 h-4 text-purple-400" /> After effects
                  </li>
                  <li className="flex items-center gap-2">
                    <Film className="w-4 h-4 text-purple-400" /> Premiere pro
                  </li>
                  <li className="flex items-center gap-2">
                    <Code className="w-4 h-4 text-orange-400" /> HTML5 e CSS3 (Tailwind)
                  </li>
                  <li className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-yellow-400" /> JavaScript | TypeScript
                  </li>
                  <li className="flex items-center gap-2">
                    <Atom className="w-4 h-4 text-cyan-400" /> React | React Native | Next.js
                  </li>
                  <li className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-green-400" /> Node.js (APIs, SSR)
                  </li>
                  <li className="flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-blue-400" /> Cloud Computing: Microsoft Azure
                  </li>
                  <li className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-blue-300" /> SQL: MySQL | SQLite
                  </li>
                  <li className="flex items-center gap-2">
                    <Binary className="w-4 h-4 text-yellow-300" /> Python (análise de dados,
                    integração de IA)
                  </li>
                  <li className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-orange-500" /> Versionamento: Git, GitHub,
                    Git Bash
                  </li>
                  <li className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-green-500" /> Excel
                  </li>
                </ul>
              </section>

              {/* Soft skills - centralizado horizontalmente no card */}
              <section className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <h3 className="text-2xl font-bold mb-3 text-sky-400 text-center">Soft skills</h3>
                <ul className="space-y-1">
                  <li className="flex items-center gap-2">
                    <MessagesSquare className="w-4 h-4 text-blue-400" /> Boa comunicação
                  </li>
                  <li className="flex items-center gap-2">
                    <ListChecks className="w-4 h-4 text-green-400" /> Organização exemplar
                  </li>
                  <li className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-400" /> Trabalho em equipe
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" /> Proatividade
                  </li>
                  <li className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-orange-400" /> Visão criativa
                  </li>
                </ul>
              </section>
            </div>
          </div>

          <div className="clear-both" />
        </div>
      </div>
    </section>
  );
}

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
    "mt-1 w-full inline-flex items-center justify-center gap-1.5 " +
    "px-2 py-1.5 rounded-md font-medium text-white text-xs shadow-sm " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 " +
    "transition-colors duration-300 ease-in-out " +
    "hover:shadow-md";

  return (
    <section
      className={`w-full h-full bg-transparent transition-opacity duration-1000 ease-out ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
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

        {/* Conteúdo principal: layout horizontal */}
        <div className="relative z-[1] h-full flex flex-row p-3 gap-3">
          {/* Coluna esquerda: imagem de fundo com avatar/botões */}
          <div className="relative w-[40%] h-full rounded-xl overflow-hidden flex-shrink-0">
            <img
              src={about2Img}
              alt="background"
              className="absolute inset-0 w-full h-full object-cover object-[50%_68%]
                         transition-transform duration-500 will-change-transform hover:scale-[1.05]"
            />

            {/* avatar + botões no canto inferior direito da imagem */}
            <div className="absolute right-2 bottom-2 z-20 flex flex-col items-center pointer-events-auto">
              {/* avatar */}
              <div className="w-16 h-16 md:w-20 md:h-20 border-2 border-white/50 overflow-hidden rounded-lg shadow-lg">
                <img src={about1Img} alt="eu" className="w-full h-full object-cover" />
              </div>

              {/* Portfólio Editor */}
              <Link
                to="/portfolio/edits"
                className={`${btnBase} bg-blue-600 hover:bg-blue-700`}
              >
                <Clapperboard className="w-3 h-3" />
                Editor
              </Link>

              {/* Portfólio Desenvolvedor */}
              <Link
                to="/portfolio/dev"
                className={`${btnBase} bg-purple-600 hover:bg-purple-700`}
              >
                <Code2 className="w-3 h-3" />
                Dev
              </Link>

              {/* WhatsApp */}
              <a
                href="https://wa.me/5521969381944"
                className={`${btnBase} bg-green-500 hover:bg-green-600`}
              >
                <MessageCircle className="w-3 h-3" />
                WhatsApp
              </a>

              {/* Currículo */}
              <a
                href="/Curriculo_Swamiy_Saraiva.pdf"
                download="Curriculo_Swamiy_Saraiva.pdf"
                className={`${btnBase} bg-red-500 hover:bg-red-600`}
              >
                <FileText className="w-3 h-3" />
                CV
              </a>

              {/* GitHub */}
              <a
                href="https://github.com/Saraiva94"
                className={`${btnBase} bg-gray-800 hover:bg-gray-900`}
              >
                <Github className="w-3 h-3" />
                GitHub
              </a>
            </div>
          </div>

          {/* Coluna direita: texto e skills */}
          <div className="flex-1 min-w-0 flex flex-col text-white overflow-y-auto pr-1">
            {/* Título */}
            <div className="text-white/90 leading-snug mb-3 text-center">
              <span className="block text-lg md:text-xl font-bold">
                Análise e Desenvolvimento de Sistemas
              </span>
              <span className="block text-sm text-white/70">Faculdade Unigranrio</span>
            </div>

            {/* Grid de skills */}
            <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
              {/* Hard skills */}
              <section className="overflow-y-auto">
                <h3 className="text-base font-bold mb-2 text-sky-400">Hard skills</h3>
                <ul className="space-y-0.5 text-xs">
                  <li className="flex items-center gap-1.5">
                    <Film className="w-3 h-3 text-purple-400 flex-shrink-0" /> After Effects
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Film className="w-3 h-3 text-purple-400 flex-shrink-0" /> Premiere Pro
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Code className="w-3 h-3 text-orange-400 flex-shrink-0" /> HTML5 / CSS3
                  </li>
                  <li className="flex items-center gap-1.5">
                    <FileCode className="w-3 h-3 text-yellow-400 flex-shrink-0" /> JS / TS
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Atom className="w-3 h-3 text-cyan-400 flex-shrink-0" /> React / Next.js
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Server className="w-3 h-3 text-green-400 flex-shrink-0" /> Node.js
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Cloud className="w-3 h-3 text-blue-400 flex-shrink-0" /> Azure
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Database className="w-3 h-3 text-blue-300 flex-shrink-0" /> SQL
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Binary className="w-3 h-3 text-yellow-300 flex-shrink-0" /> Python
                  </li>
                  <li className="flex items-center gap-1.5">
                    <GitBranch className="w-3 h-3 text-orange-500 flex-shrink-0" /> Git
                  </li>
                  <li className="flex items-center gap-1.5">
                    <FileSpreadsheet className="w-3 h-3 text-green-500 flex-shrink-0" /> Excel
                  </li>
                </ul>
              </section>

              {/* Soft skills */}
              <section className="overflow-y-auto">
                <h3 className="text-base font-bold mb-2 text-sky-400">Soft skills</h3>
                <ul className="space-y-0.5 text-xs">
                  <li className="flex items-center gap-1.5">
                    <MessagesSquare className="w-3 h-3 text-blue-400 flex-shrink-0" /> Comunicação
                  </li>
                  <li className="flex items-center gap-1.5">
                    <ListChecks className="w-3 h-3 text-green-400 flex-shrink-0" /> Organização
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Users className="w-3 h-3 text-purple-400 flex-shrink-0" /> Trabalho em equipe
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-yellow-400 flex-shrink-0" /> Proatividade
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Lightbulb className="w-3 h-3 text-orange-400 flex-shrink-0" /> Visão criativa
                  </li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

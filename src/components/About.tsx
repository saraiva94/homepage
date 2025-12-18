import { Link } from "react-router-dom";
import { Clapperboard, Code2, FileText, Github, MessageCircle, Film, Code, FileCode, Atom, Server, Cloud, Database, Binary, GitBranch, FileSpreadsheet, MessagesSquare, ListChecks, Users, Zap, Lightbulb } from "lucide-react";
import about1ImgRaw from "@/assets/eu.png";
import about2ImgRaw from "@/assets/background.jpg";
const about1Img = about1ImgRaw as unknown as string;
const about2Img = about2ImgRaw as unknown as string;

export function About() {
  const btnBase =
    "mt-1.5 w-[var(--avatar)] inline-flex items-center justify-center gap-1.5 " +
    "px-3 py-1.5 rounded-md font-semibold text-white shadow-sm text-sm " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 " +
    "transition-colors duration-300 ease-in-out " +
    "motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out " +
    "hover:-translate-y-0.5 hover:shadow-md";

  return (
    <section className="py-2 md:py-4 bg-transparent">
      <div className="container mx-auto px-2 md:px-4">
        <div className="relative rounded-2xl md:rounded-3xl p-2 md:p-4 [--avatar:clamp(80px,18vw,160px)] overflow-hidden">
          {/* overlay glass */}
          <div
            aria-hidden
            className="absolute inset-0 z-0 rounded-2xl md:rounded-3xl
                       bg-black/20 backdrop-blur-sm backdrop-saturate-150
                       border border-gray-400/50 ring-1 ring-gray-300/30
                       shadow-[0_8px_30px_rgba(150,150,150,0.15)]
                       pointer-events-none"
          />

          {/* bloco imagem de fundo */}
          <div className="relative z-[1]">
            <div className="relative w-full h-[30vh] md:h-[35vh] lg:h-[40vh] max-h-[350px] rounded-2xl md:rounded-3xl overflow-hidden">
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
                right-[clamp(0.25rem,1.5vw,0.75rem)]
                bottom-[calc(-1*var(--avatar))]
                z-20 flex flex-col items-center pointer-events-auto
              "
            >
              {/* avatar */}
              <div className="relative w-[var(--avatar)] h-[var(--avatar)] border-2 md:border-4 overflow-hidden rounded-lg">
                <img src={about1Img} alt="eu" className="w-full h-full object-cover" />
              </div>

              {/* Portfólio Editor */}
              <Link
                to="/portfolio/edits"
                className={`${btnBase} bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus-visible:outline-blue-400`}
              >
                <Clapperboard className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Portfólio</span> Editor
              </Link>

              {/* Portfólio Desenvolvedor */}
              <Link
                to="/portfolio/dev"
                className={`${btnBase} bg-purple-600 hover:bg-purple-700 active:bg-purple-800 focus-visible:outline-purple-400`}
              >
                <Code2 className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Portfólio</span> Dev
              </Link>

              {/* WhatsApp (verde) */}
              <a
                href="https://wa.me/5521969381944"
                className={`${btnBase} bg-green-500 hover:bg-green-600 active:bg-green-700 focus-visible:outline-green-300`}
              >
                <MessageCircle className="w-3 h-3 md:w-4 md:h-4" />
                Whatsapp
              </a>

              {/* Currículo (vermelho) */}
              <a
                href="/Curriculo_Swamiy_Saraiva.pdf"
                download="Curriculo_Swamiy_Saraiva.pdf"
                className={`${btnBase} bg-red-500 hover:bg-red-600 active:bg-red-700 focus-visible:outline-red-400`}
              >
                <FileText className="w-3 h-3 md:w-4 md:h-4" />
                Currículo
              </a>

              {/* GitHub (preto) */}
              <a
                href="https://github.com/Saraiva94"
                className={`${btnBase} bg-black hover:bg-gray-900 active:bg-gray-800 !text-white focus-visible:outline-gray-700`}
              >
                <Github className="w-3 h-3 md:w-4 md:h-4 text-white" />
                <span className="text-white">Github</span>
              </a>
            </div>
          </div>

          {/* TEXTO */}
          <div className="relative z-0 mt-4 md:mt-6 text-white pb-2">
            <div className="text-white/90 leading-snug mb-3 md:mb-4 text-center">
              <span className="block text-lg md:text-xl lg:text-2xl font-bold leading-tight md:hidden">
                Análise e<br />
                desenvolvimento<br />
                de sistemas (ADS)
              </span>
              <span className="hidden md:block text-xl lg:text-2xl font-bold">
                Análise e Desenvolvimento de Sistemas (ADS)
              </span>
              <span className="block text-xs md:text-sm lg:text-base">Faculdade Unigranrio</span>
            </div>

            <div className="flex flex-col md:flex-row md:justify-between gap-4 md:gap-8 text-xs md:text-sm">
              {/* Hard skills */}
              <section className="flex-1">
                <h3 className="text-lg md:text-xl lg:text-2xl font-bold mb-2 text-sky-400">Hard skills</h3>
                <ul className="space-y-0.5 md:space-y-1">
                  <li className="flex items-center gap-1.5"><Film className="w-3 h-3 md:w-4 md:h-4 text-purple-400 flex-shrink-0" /> After effects</li>
                  <li className="flex items-center gap-1.5"><Film className="w-3 h-3 md:w-4 md:h-4 text-purple-400 flex-shrink-0" /> Premiere pro</li>
                  <li className="flex items-center gap-1.5"><Code className="w-3 h-3 md:w-4 md:h-4 text-orange-400 flex-shrink-0" /> HTML5 e CSS3 (Tailwind)</li>
                  <li className="flex items-center gap-1.5"><FileCode className="w-3 h-3 md:w-4 md:h-4 text-yellow-400 flex-shrink-0" /> JavaScript | TypeScript</li>
                  <li className="flex items-center gap-1.5"><Atom className="w-3 h-3 md:w-4 md:h-4 text-cyan-400 flex-shrink-0" /> React | React Native | Next.js</li>
                  <li className="flex items-center gap-1.5"><Server className="w-3 h-3 md:w-4 md:h-4 text-green-400 flex-shrink-0" /> Node.js (APIs, SSR)</li>
                  <li className="flex items-center gap-1.5"><Cloud className="w-3 h-3 md:w-4 md:h-4 text-blue-400 flex-shrink-0" /> Cloud: Microsoft Azure</li>
                  <li className="flex items-center gap-1.5"><Database className="w-3 h-3 md:w-4 md:h-4 text-blue-300 flex-shrink-0" /> SQL: MySQL | SQLite</li>
                  <li className="flex items-center gap-1.5"><Binary className="w-3 h-3 md:w-4 md:h-4 text-yellow-300 flex-shrink-0" /> Python (IA, dados)</li>
                  <li className="flex items-center gap-1.5"><GitBranch className="w-3 h-3 md:w-4 md:h-4 text-orange-500 flex-shrink-0" /> Git, GitHub</li>
                  <li className="flex items-center gap-1.5"><FileSpreadsheet className="w-3 h-3 md:w-4 md:h-4 text-green-500 flex-shrink-0" /> Excel</li>
                </ul>
              </section>

              {/* Soft skills */}
              <section className="flex-1 md:text-center">
                <h3 className="text-lg md:text-xl lg:text-2xl font-bold mb-2 text-sky-400 md:text-center">Soft skills</h3>
                <ul className="space-y-0.5 md:space-y-1 md:inline-block md:text-left">
                  <li className="flex items-center gap-1.5"><MessagesSquare className="w-3 h-3 md:w-4 md:h-4 text-blue-400 flex-shrink-0" /> Boa comunicação</li>
                  <li className="flex items-center gap-1.5"><ListChecks className="w-3 h-3 md:w-4 md:h-4 text-green-400 flex-shrink-0" /> Organização exemplar</li>
                  <li className="flex items-center gap-1.5"><Users className="w-3 h-3 md:w-4 md:h-4 text-purple-400 flex-shrink-0" /> Trabalho em equipe</li>
                  <li className="flex items-center gap-1.5"><Zap className="w-3 h-3 md:w-4 md:h-4 text-yellow-400 flex-shrink-0" /> Proatividade</li>
                  <li className="flex items-center gap-1.5"><Lightbulb className="w-3 h-3 md:w-4 md:h-4 text-orange-400 flex-shrink-0" /> Visão criativa</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

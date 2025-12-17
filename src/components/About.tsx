import about1ImgRaw from "@/assets/eu.png";
import about2ImgRaw from "@/assets/background.jpg";

const about1Img = about1ImgRaw as unknown as string;
const about2Img = about2ImgRaw as unknown as string;

export function About() {
  const btnBase =
    "mt-2 w-[var(--avatar)] inline-flex items-center justify-center gap-2 " +
    "px-4 py-2 rounded-md font-semibold text-white shadow-sm " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 " +
    "transition-colors duration-300 ease-in-out " +
    "motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out " +
    "hover:-translate-y-0.5 hover:shadow-md";

  return (
    <section className="py-6 bg-transparent mb-6 md:mb-10">
      <div className="container mx-auto px-4">
        <div className="relative rounded-3xl p-4 [--avatar:clamp(120px,28vw,240px)] overflow-hidden">
          {/* overlay glass */}
          <div
            aria-hidden
            className="absolute inset-0 z-0 rounded-3xl
                       bg-black/40 backdrop-blur-md backdrop-saturate-150
                       border border-green-500/30 ring-1 ring-green-500/20
                       shadow-[0_8px_30px_rgba(0,255,0,0.2)]
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

              {/* Currículo (vermelho) */}
              <a
                href="/Curriculo_Swamiy_Saraiva.pdf"
                download="Curriculo_Swamiy_Saraiva.pdf"
                className={`${btnBase} bg-red-500 hover:bg-red-600 active:bg-red-700 focus-visible:outline-red-400`}
              >
                Currículo
              </a>

              {/* GitHub (preto) */}
              <a
                href="https://github.com/Saraiva94"
                className={`${btnBase} bg-black hover:bg-neutral-800 active:bg-neutral-900 focus-visible:outline-white`}
              >
                Github
              </a>

              {/* WhatsApp (verde) */}
              <a
                href="https://wa.me/5521969381944"
                className={`${btnBase} bg-green-500 hover:bg-green-600 active:bg-green-700 focus-visible:outline-green-300`}
              >
                Whatsapp
              </a>
            </div>
          </div>

          {/* TEXTO */}
          <div className="relative z-0 mt-8 text-white">
            <div className="text-white/90 leading-snug mb-6">
              <span className="block text-lg font-bold leading-tight md:hidden">
                Análise e<br />
                desenvolvimento<br />
                de sistemas (ADS)
              </span>
              <span className="hidden md:block text-lg font-bold">
                Análise e Desenvolvimento de Sistemas (ADS)
              </span>
              <span className="block">Faculdade Unigranrio</span>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <section>
                <h3 className="text-lg font-semibold mb-2">Hard skills</h3>
                <ul className="list-disc pl-5 space-y-1 marker:text-white/60">
                  <li>After effects</li>
                  <li>Premiere pro</li>
                  <li>HTML5 e CSS3 (Tailwind)</li>
                  <li>JavaScript | TypeScript</li>
                  <li>React | React Native | Next.js</li>
                  <li>Node.js (APIs, SSR)</li>
                  <li>Cloud Computing: Microsoft Azure</li>
                  <li>SQL: MySQL | SQLite</li>
                  <li>Python (análise de dados, integração de IA)</li>
                  <li>Versionamento: Git, GitHub, Git Bash</li>
                  <li>Excel</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-2">Soft skills</h3>
                <ul className="list-disc pl-5 space-y-1 marker:text-white/60">
                  <li>Boa comunicação</li>
                  <li>Organização exemplar</li>
                  <li>Trabalho em equipe</li>
                  <li>Proatividade</li>
                  <li>Visão criativa</li>
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
"use client";

import Image from "next/image";
import about1Img from "../../../assets/eu.png";
import about2Img from "../../../assets/background.jpg";

export function About() {
  return (
    <section className="py-6 bg-transparent mb-6 md:mb-10">
      <div className="container mx-auto px-4">
        {/* Define a var p/ avatar: de 120px até 240px, escalando com a viewport */}
        <div className="relative rounded-3xl p-4 [--avatar:clamp(120px,28vw,240px)]">
          {/* overlay glass */}
          <div
            aria-hidden
            className="absolute inset-0 z-0 rounded-3xl
                       bg-white/10 backdrop-blur-xl backdrop-saturate-150
                       border border-white/15 ring-1 ring-white/10
                       shadow-[0_8px_30px_rgba(0,0,0,0.35)]
                       pointer-events-none"
          />

          {/* bloco imagem de fundo */}
          <div className="relative">
            <div className="relative w-full h-[400px] rounded-3xl overflow-hidden">
              <Image
                src={about2Img}
                alt="background"
                fill
                quality={100}
                className="object-cover object-[50%_68%] origin-[50%_68%]
                           transition-transform duration-500 will-change-transform hover:scale-[1.08]"
                sizes="(min-width:1024px) 50vw, 100vw"
                priority
              />
            </div>

            {/* avatar + botões ANCORADOS por var:
               - right: aproxima conforme viewport
               - bottom: ~29.2% do avatar (≈70px quando avatar=240px) */}
            <div
              className="
                absolute
                right-[clamp(0.5rem,2vw,1rem)]
                bottom-[calc(-1*var(--avatar))]
                z-20 flex flex-col items-center pointer-events-auto
              "
            >
              {/* avatar responsivo 120..240 */}
              <div className="relative w-[var(--avatar)] h-[var(--avatar)] border-4 overflow-hidden rounded-lg">
                <Image src={about1Img} alt="eu" fill quality={100} priority />
              </div>

              {/* botões com a MESMA largura do avatar */}
              <a
                href="/Curriculo_Swamiy_Saraiva.pdf"
                download="Curriculo_Swamiy_Saraiva.pdf"
                className="mt-2 w-[var(--avatar)]
                           inline-flex items-center justify-center gap-2
                           px-4 py-2 rounded-md font-semibold
                           bg-red-500 hover:bg-red-600 active:bg-red-10000
                           text-white shadow-sm
                           focus-visible:outline-2 focus-visible:outline-red-400 focus-visible:outline-offset-2 motion-safe:transition motion-safe:duration-300 motion-safe:ease-out
                            hover:shadow-md hover:-translate-y-0.5 transition-colors duration-300 ease-in-out" 
                >
                Currículo
              </a>
              <a
                href="https://github.com/Saraiva94"
                className="mt-2 w-[var(--avatar)]
                            inline-flex items-center justify-center gap-2
                            px-4 py-2 rounded-md font-semibold
                            bg-black hover:bg-neutral-800 active:bg-neutral-900
                            text-white shadow-sm
                            focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2

                            transition-colors duration-300 ease-in-out
                            hover:shadow-md hover:-translate-y-0.5"
              >
                Github
              </a>

              <a
                href="https://wa.me/5521969381944"
                className="mt-2 w-[var(--avatar)]
                           inline-flex items-center justify-center gap-2
                           px-4 py-2 rounded-md font-semibold
                           bg-green-500 hover:bg-green-600 active:bg-green-10000
                           text-white shadow-sm
                           focus-visible:outline-2 focus-visible:outline-green-300 
                            focus-visible:outline-offset-2 motion-safe:transition motion-safe:duration-300 motion-safe:ease-out
                            hover:shadow-md hover:-translate-y-0.5 transition-colors duration-300 ease-in-out"
                           
              >
                Whatsapp
              </a>
            </div>
          </div>

          {/* placeholder ÚNICO que acompanha o avatar (texto desvia sempre) */}
          <div
            aria-hidden
            className="hidden sm:block float-right mr-4
                       w-[var(--avatar)]
                       h-[calc(var(--avatar)+6rem)]
                       [shape-outside:circle(50%)]"
          />

          {/* TEXTO */}
          <div className="relative z-0 mt-8 text-white">
                <div className="text-white/90 leading-snug mb-6">
                  <span className="block text-lg font-bold leading-tight md:hidden">
                    Análise e<br />
                    desenvolvimento<br />
                    de sistemas (ADS)
                  </span>

                  {/* Desktop/Tablet: uma linha só */}
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
                  <li>Python (análise de dados, integração de IA)</li>
                  <li>SQL: MySQL | SQLite</li>
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

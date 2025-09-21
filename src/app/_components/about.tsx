"use client";

import Image from "next/image";
import about1Img from "../../../assets/eu.png";
import about2Img from "../../../assets/background.jpg";

export function About() {
  return (
    <section className="bg-[#000] py-6">
      <div className="container mx-auto px-4">
        <div className="relative rounded-3xl p-4">
          {/* overlay glass */}
          <div
            aria-hidden
            className="absolute inset-0 z-0 rounded-3xl
                       bg-white/10 backdrop-blur-xl backdrop-saturate-150
                       border border-white/15 ring-1 ring-white/10
                       shadow-[0_8px_30px_rgba(0,0,0,0.35)]
                       pointer-events-none"
          />

          {/* BLOCO IMAGEM + AVATAR/BOTÃO */}
          <div className="relative">
            {/* Imagem de fundo */}
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

            {/* Foto (240x240) + botão no MESMO contêiner absoluto */}
            <div className="absolute right-10 -bottom-60 z-10 flex flex-col items-center">
              <div className="relative w-[240px] h-[240px] border-4 overflow-hidden rounded-lg">
                <Image src={about1Img} alt="eu" fill quality={100} priority />
              </div>

              {/* Espaço pequeno e botão ocupando a mesma largura da foto */}
              <a
                href="/Curriculo_Swamiy_Saraiva.pdf"
                download="Curriculo_Swamiy_Saraiva.pdf"
                className="mt-3 w-[240px] text-center inline-flex items-center justify-center gap-2
                           px-4 py-2 rounded-md font-semibold
                           bg-red-500 hover:bg-red-600 active:bg-red-700
                           text-white shadow-sm
                           focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-400 focus-visible:outline-offset-2"
              >
                Baixar currículo
              </a>
            </div>
          </div>

          {/* placeholder para o texto desviar do conjunto foto+botão */}
          <div
            aria-hidden
            className="hidden md:block float-right mr-4
                       w-[240px] h-[320px] [shape-outside:circle(50%)]"
          />

          {/* TEXTO */}
          <div className="relative z-10 mt-8 text-white">
            <h2 className="text-4xl font-bold mb-3">Informações pessoais</h2>

            <p className="opacity-90 leading-relaxed mb-6">
              Tecnólogo em Análise e Desenvolvimento de Sistemas (ADS) – Faculdade Unigranrio
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <section>
                <h3 className="text-lg font-semibold mb-2">Hard skills</h3>
                <ul className="list-disc pl-5 space-y-1 marker:text-white/60">
                  <li>HTML5 e CSS3 (Tailwind)</li>
                  <li>JavaScript / TypeScript</li>
                  <li>React / Next.js</li>
                  <li>Node.js (APIs, SSR)</li>
                  <li>Python (análise de dados, integração de IA)</li>
                  <li>SQL: MySQL / SQLite</li>
                  <li>Versionamento: Git, GitHub, Git Bash</li>
                  <li>Excel (básico)</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-2">Soft skills</h3>
                <ul className="list-disc pl-5 space-y-1 marker:text-white/60">
                  <li>Boa comunicação</li>
                  <li>Organização exemplar</li>
                  <li>Trabalho em equipe</li>
                  <li>Proatividade</li>
                </ul>
              </section>
            </div>

            <section className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Objetivo</h3>
              <ul className="list-disc pl-5 space-y-1 marker:text-white/60">
                <li>
                  Atuar como Analista de Dados ou Desenvolvedor Web Júnior aplicando conhecimentos de
                  estudos, certificações e projetos práticos.
                </li>
              </ul>
            </section>

            <section className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Experiência e atuação</h3>
              <ul className="list-disc pl-5 space-y-1 marker:text-white/60">
                <li>Atendimento remoto, suporte claro e eficiente.</li>
                <li>Home office com ferramentas digitais para comunicação e organização.</li>
                <li>Gestão de tarefas e demandas; foco em entregas.</li>
              </ul>
            </section>
          </div>

          {/* limpa o float do placeholder */}
          <div className="clear-both" />
        </div>
      </div>
    </section>
  );
}

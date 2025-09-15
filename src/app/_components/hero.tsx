import { WhatsappLogo } from '@phosphor-icons/react/dist/ssr';

export function Hero() {
  return (
    <section className="bg-[#6f00ff] text-white relative overflow-hidden">
      <div>
        <article className='grid  grid-cols-1 lg:grid-cols-2 gap-8 relative'>
          <div className='space-y-6'>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-10">
              Bem vindo ao meu espaço, aqui eu materializo todos os meus projetos
            </h1>
            <p className="lg:text-lg">
              Em busca de oferecer os melhores serviços para garantir o progresso dos nossos objetivos
            </p>
            <a
              href="#"
              className="bg-green-500 px-5 py-2 rounded-md font-semibold flex items-center justify-center w-fit gap-2"
            >
              {<WhatsappLogo className='w-5 h-5'/>}
              Contato via Whatsapp
            </a>
          </div>
        </article>
      </div>
    </section>
  );
}
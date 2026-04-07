# portfolio

Site pessoal e portfolio profissional com animacoes scroll-driven, painel administrativo e preload inteligente de assets.

## Sobre

Este projeto e um site-portfolio construido com React 19 e TypeScript, projetado para apresentar trabalhos de desenvolvimento web e edicao de video em uma interface unica. A homepage exibe um card de perfil com skills categorizadas (hard e soft), links de contato e botoes de navegacao para os dois portfolios.

Cada portfolio usa uma animacao de scroll-scrubbing: centenas de frames de imagem sao renderizados em canvas e controlados pela posicao do scroll via GSAP ScrollTrigger. O painel administrativo permite gerenciar videos, skills, imagens de perfil e curriculo sem tocar no codigo. O Supabase serve como backend para autenticacao, banco de dados e storage de arquivos.

## Stack

| Camada | Tecnologia | Proposito |
|--------|-----------|-----------|
| Framework | React 19 + TypeScript | UI reativa com tipagem estatica |
| Build | Vite 7 + SWC | Bundling rapido com HMR e code splitting |
| Estilo | Tailwind CSS 4 | Utility-first CSS sem arquivos de estilo separados |
| Animacao | GSAP + ScrollTrigger | Scroll-scrubbing de frames e transicoes de elementos |
| Scroll | Lenis | Smooth scroll com integracao nativa ao GSAP ticker |
| Backend | Supabase | Auth, PostgreSQL, Storage e API REST automatica |
| Drag & Drop | dnd-kit | Reordenacao de videos e skills no painel admin |
| Icones | Lucide, React Icons, Phosphor | Icones para UI, skills e acoes |
| Deploy | Vercel | Build automatico, CDN e rewrites para SPA |
| Imagens | sharp | Otimizacao e conversao para WebP no build |

## Funcionalidades

- Homepage com card de perfil responsivo, skills categorizadas por area e scroll interno por coluna
- Portfolio Dev: animacao scroll-driven com 261 frames renderizados em canvas + galeria de videos
- Portfolio Edits: mesma mecanica com 300 frames e tema visual distinto
- Preload inteligente: frames sao carregados em background via `requestIdleCallback` enquanto o usuario esta na homepage
- Cache global de frames em memoria com batching (`Promise.allSettled`) e yield ao main thread
- Service Worker para cache persistente de frames entre sessoes
- Loading screen com progresso real (videos + GSAP + frames)
- Efeito glitch CSS puro com 3 fases de animacao (RGB split, distortion, scanline)
- Background de particulas com randomness deterministico (seed-based)
- Cursor trail com fisica de interpolacao e cor baseada em velocidade
- Code splitting: homepage eager, demais rotas lazy com `React.lazy`
- Prefetch de chunks de rotas em idle time
- Painel administrativo protegido por login com Supabase RPC
- CRUD de videos com upload para Supabase Storage e reordenacao drag-and-drop
- Gerenciamento de hard skills e soft skills com catalogo de icones e busca
- Upload e posicionamento de imagem de perfil e background com editor visual
- Upload e gerenciamento de curriculo PDF
- Editor de thumbnails para videos do portfolio
- Responsivo de mobile a ultrawide com `clamp()` e CSS variables

## Arquitetura

A aplicacao usa code splitting agressivo: a homepage carrega eager enquanto portfolios, login e admin sao lazy-loaded com chunks separados configurados via `manualChunks` no Vite (react, icons, dnd-kit e gsap em bundles independentes). O preload de frames segue uma estrategia de duas camadas: um hook `useOptimizedPreload` carrega imagens em batches de 15-20 usando `Promise.allSettled` com yield de 5ms entre batches para nao bloquear o main thread, e um `Map` global fora do React serve como cache que persiste entre navegacoes sem depender de state. Componentes pesados como o grid de 200+ skill cards usam `React.memo` em cascata (icone, card, coluna) combinado com `useMemo` para agrupamento e `useRef` para estado de animacao que muda 60x/segundo sem disparar re-renders. O canvas dos portfolios limita o DPR a 2x para evitar uso excessivo de memoria em dispositivos de alto DPR.

## Como rodar localmente

Prerequisitos: Node.js 18+ e npm.

```bash
# Clonar o repositorio
git clone <url-do-repositorio>
cd portfolio

# Instalar dependencias
npm install

# Configurar variaveis de ambiente
cp .env.example .env
# Preencher as variaveis no arquivo .env

# Rodar em desenvolvimento
npm run dev
# Acesse http://localhost:8080

# Build de producao
npm run build

# Preview do build
npm run preview
```

## Variaveis de ambiente

| Variavel | Descricao |
|----------|-----------|
| `VITE_SUPABASE_URL` | URL do projeto Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Chave publica (anon key) do Supabase |

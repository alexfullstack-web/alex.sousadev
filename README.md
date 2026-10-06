# Alex Sousa Tech — Portfolio v3

Portfólio de Alex Sousa, desenvolvedor Full Stack, com tema espacial completo:
hero 3D com astronautas que se revezam, fundo de estrelas no site inteiro e a
**Missão Terra → Lua** — um foguete que decola da Terra, atravessa portões de
tecnologia (Front-end, Back-end, APIs, Banco de dados, Cloud, IA) e pousa na Lua.

React + Vite + Three.js (React Three Fiber) + Framer Motion. Sem TypeScript e sem backend.

## Executar

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # gera dist/
npm run preview   # serve o build de produção
```

Publicação: rode `npm run build` e publique `dist/` (na Vercel o preset **Vite** é detectado sozinho).

## Estrutura

```text
index.html                    casca da página (monta o React em #root)
public/img/
├── hero/                     astronautas recortados + fundo espacial (WebP)
├── space/                    Terra (dia, noite, nuvens) e Lua
└── site/                     logo, fotos e imagens dos projetos
src/
├── App.jsx                   ordem das seções
├── data/site.js              TODO o conteúdo: contatos, projetos, stack, etapas da missão e códigos
├── styles/site.css           tema espacial, seções e painel de código
├── components/
│   ├── SpaceBackground.jsx   estrelas com parallax, nebulosas e estrelas cadentes
│   ├── Navbar.jsx            menu, seção ativa e barra de progresso
│   ├── CodePanel.jsx         painel de código grande com digitação
│   └── Sections.jsx          Sobre, Stack (órbitas), Projetos, Experiência, Contato, Rodapé
├── hero/                     hero 3D
│   ├── config.js             linha do tempo, astronautas, tags, códigos do holograma
│   └── scene/                Astronaut, HoloScreen, Starfield, Planet...
└── mission/                  Missão Terra → Lua
    ├── Mission.jsx           seção com scroll, cartão da etapa, painel de código, telemetria
    ├── missionPath.js        trajetória, câmera, giro de frenagem e pouso
    └── scene/                Rocket, Planets (Terra/Lua), Props (portões, plataforma, bandeira), SpaceField
```

## Hero

- Três astronautas se revezam a cada 8 s com dissolve holográfico (`ASTRO_VARIANTS` e `SWITCH` em `src/hero/config.js`).
- Holograma grande com um trecho de código diferente para cada astronauta (`HOLO_CODES`).
- Mouse move a câmera; tags com glow ao passar o mouse.

## Missão Terra → Lua

- A seção tem 600vh e fica "presa" na tela enquanto você rola: o scroll controla o voo.
- Etapas e códigos ficam em `MISSION_STAGES` (`src/data/site.js`); o intervalo `range` define quando cada uma aparece.
- Os pontos da barra inferior levam direto a cada etapa.
- No pouso, o painel de código sai para revelar a bandeira e a Terra ao fundo.

## Desempenho e acessibilidade

- three.js fica em um chunk separado; a hero 3D carrega quando o navegador está ocioso e a missão só quando a seção se aproxima.
- Cada cena pausa quando sai da tela; estrelas, partículas e chamas animam no shader.
- Celular/máquinas fracas: texturas menores, menos partículas, sem antialias e resolução adaptativa.
- `prefers-reduced-motion` ou sem WebGL 2: hero estática e missão em lista (cartões + código), sem baixar three.js.

## Ajustes em desenvolvimento

- Hero: `http://localhost:5173/?t=12&freeze` pula para o segundo 12 da animação e congela.
- Missão: `http://localhost:5173/?mp=0.95` fixa o progresso do voo (role até a seção).
Esses parâmetros não existem no build de produção.

## Créditos das texturas

Terra (Blue Marble, luzes noturnas, nuvens) e Lua: imagens da NASA, distribuídas nos exemplos do pacote `three-globe` (MIT).

## Contato

Email: alexsousadev.21@gmail.com  
GitHub: https://github.com/alexfullstack-web  
WhatsApp: https://wa.me/5599984686139  
Instagram: https://instagram.com/alex.sousadev

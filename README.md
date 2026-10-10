# Alex Sousa Tech — Portfolio

Portfólio de Alex Sousa, desenvolvedor Full Stack. Fundo espacial azul com estrelas em todo o site,
hero 3D com astronautas que se revezam e painel de código grande, e vitrine dos sites feitos para clientes.

React + Vite + Three.js (React Three Fiber, só na hero) + Framer Motion. Sem TypeScript e sem backend.

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
index.html
public/img/
├── hero/                 astronautas recortados + foto de espaço profundo
├── projetos/             capturas dos sites de clientes
└── site/                 logo, fotos e imagens dos projetos
src/
├── App.jsx               ordem das seções
├── data/site.js          TODO o conteúdo: contatos, projetos, sites de clientes, stack e etapas da Missão
├── styles/site.css       tema espacial, seções, cartões e painel de código
├── components/
│   ├── SpaceBackground.jsx   fundo azul com estrelas (parallax, nebulosas, estrelas cadentes)
│   ├── Navbar.jsx            menu, seção ativa e barra de progresso
│   ├── CodePanel.jsx         painel de código grande com digitação
│   └── Sections.jsx          Sobre, Stack, Projetos, Sites para clientes, Experiência, Contato, Rodapé
├── hero/                 hero 3D (astronautas, holograma de código, estrelas)
└── mission/Mission.jsx   seção "Do código ao deploy": 6 etapas com cartão e código, guiada pela rolagem
```

## Adicionar um site de cliente

1. Salve a captura em `public/img/projetos/nome.webp` (formato 16:10).
2. Adicione um item em `CLIENT_PROJECTS` (`src/data/site.js`) com título, categoria, descrição, imagem e link.

## Hero

- Três astronautas se revezam a cada 8 s com dissolve holográfico (`ASTRO_VARIANTS` e `SWITCH` em `src/hero/config.js`).
- Holograma grande com um trecho de código diferente para cada astronauta (`HOLO_CODES`).
- Em desenvolvimento, `?t=12&freeze` pula para o segundo 12 da animação e congela.

## Desempenho e acessibilidade

- three.js só é carregado para a hero, em um chunk separado, quando o navegador está ocioso; a cena pausa fora da tela.
- O fundo de estrelas é CSS + imagens geradas uma vez (nada roda por frame com a página parada).
- `prefers-reduced-motion` ou sem WebGL 2: hero estática e Missão em lista, sem baixar three.js.

## Contato

Email: alexsousadev.21@gmail.com  
GitHub: https://github.com/alexfullstack-web  
WhatsApp: https://wa.me/5599984686139  
Instagram: https://instagram.com/alex.sousadev

# Alex Sousa Tech — Portfolio

Portfólio profissional de Alex Sousa, desenvolvedor Full Stack.

A página continua sendo HTML/CSS/JS estático, com uma **hero 3D cinematográfica** em React + Three.js (React Three Fiber) montada em `#hero-root`.

## Executar

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # gera a pasta dist/
npm run preview   # serve o build de produção
```

Para publicar (Vercel, Netlify, GitHub Pages), use `npm run build` e publique a pasta `dist/`. Na Vercel o preset **Vite** é detectado automaticamente.

## Estrutura

```text
index.html                 página (seções Sobre, Skills, Projetos...)
public/                    arquivos servidos como estão
├── css/  js/  img/
└── img/hero/              arte do astronauta e fundo espacial (WebP)
src/
├── main.jsx               monta a hero em #hero-root
└── hero/
    ├── HeroSpace.jsx      texto, botões, lazy loading, fallback estático
    ├── HeroCanvas.jsx     <Canvas> (carregado sob demanda), tags e assinatura
    ├── config.js          linha do tempo, tags, código do holograma, qualidade
    ├── hero.css
    └── scene/
        ├── Scene.jsx          câmera, layout responsivo, projeção das tags
        ├── Astronaut.jsx      astronauta 2.5D + visor com código + brilho do notebook
        ├── HoloScreen.jsx     interface holográfica com código sendo digitado
        ├── Starfield.jsx      milhares de estrelas animadas na GPU
        ├── FlareStars.jsx     estrelas com brilho intenso (cruz de difração)
        ├── DustParticles.jsx  partículas com profundidade de campo (bokeh)
        ├── Backdrop.jsx       nebulosas azuis
        ├── Planet.jsx         planeta distante com atmosfera
        └── Glows.jsx          glow e iluminação volumétrica
```

## Sequência da animação

Controlada por `TIMELINE` em `src/hero/config.js` (segundos):

1. espaço vazio → estrelas começam a se mover (0.3s)
2. aproximação lenta da câmera (0.6s → 6.8s)
3. astronauta entra pela esquerda (1.2s)
4. reflexos de código no visor (3.0s)
5. notebook acende e o holograma abre (3.6s → 5.0s) e o código é digitado
6. tags tecnológicas aparecem (5.3s)
7. assinatura "ALEX SOUSA TECH" (7.6s)

Em desenvolvimento, `http://localhost:5173/?t=6` começa a cena no segundo 6 e `&freeze` congela a linha do tempo (útil para ajustes). Isso não existe no build de produção.

## Desempenho

- three.js e a cena ficam em um chunk separado, carregado com `React.lazy` só quando o navegador está ocioso; o texto e os botões aparecem antes.
- Estrelas e partículas são animadas no shader (sem custo de CPU por partícula).
- Celulares, tablets e máquinas fracas recebem menos estrelas/partículas, sem antialias e com resolução menor (`QUALITY` em `config.js`). Se o FPS cair, a resolução é reduzida automaticamente.
- O render pausa quando a hero sai da tela.
- `prefers-reduced-motion` ou navegador sem WebGL 2: versão estática (imagem + tags), sem carregar three.js.

## Personalizar

- Textos e botões: `src/hero/HeroSpace.jsx`
- Tags flutuantes e código do holograma: `src/hero/config.js`
- Posição/escala do astronauta: `computeLayout` em `src/hero/scene/Scene.jsx`
- Demais seções: `index.html`, `public/css/style.css`, `public/css/responsive.css`

## Contato

Email: alexsousadev.21@gmail.com  
GitHub: https://github.com/alexfullstack-web  
WhatsApp: https://wa.me/5599984686139  
Instagram: https://instagram.com/alex.sousadev

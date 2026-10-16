# Alex Sousa Tech — Portfólio V4

Site institucional e portfólio de Alex Sousa, **controlado pelo Business OS**: projetos, serviços,
textos, WhatsApp, orçamentos e atendimento vêm da API do sistema. Nenhum projeto fica fixo no código.

React + Vite + React Router + Axios + Lucide. JavaScript puro (sem TypeScript). Sem backend próprio:
usa a API do Business OS.

## Executar

```bash
cp .env.example .env      # preencha VITE_API_URL, VITE_EMPRESA e VITE_SITE_URL
npm install
npm run dev               # http://localhost:5173
npm run build             # gera dist/ (antes, gera sitemap.xml e robots.txt com os projetos publicados)
npm run preview
```

| Variável | O que é |
|---|---|
| `VITE_API_URL` | API do Business OS, terminando em `/api` |
| `VITE_EMPRESA` | slug da empresa no Business OS (aparece em Projetos e ideias → Site público) |
| `VITE_SITE_URL` | endereço público deste site (SEO, Open Graph, sitemap) |
| `VITE_TURNSTILE_SITE_KEY` | opcional — chave **pública** do Turnstile, se o backend usar `TURNSTILE_SECRET_KEY` |

Tudo que começa com `VITE_` vai para o navegador: **nunca** coloque chaves de IA ou segredos aqui.
A chave da IA fica só no backend (`OPENROUTER_API_KEY`).

## Publicar na Vercel

1. Preset **Vite**; configure as variáveis acima no projeto da Vercel.
2. `vercel.json` já faz as rotas da SPA (`/projetos/:slug`) e define cache e cabeçalhos de segurança.
3. No backend, inclua o domínio do site em `CORS_ORIGINS`.
4. No Business OS → Projetos e ideias → **Site público**, ligue o site. Enquanto estiver desligado,
   o site mostra "em manutenção".

## Estrutura

```text
src/
├── App.jsx                 rotas, fundo, navegação, rodapé, WhatsApp e João Pedro IA
├── api.js / config.js      cliente da API pública (só rotas públicas)
├── context/SiteContext.jsx dados do site vindos do Business OS
├── components/
│   ├── TechBackground.jsx  fundo animado (partículas, trilhas de circuito com pulsos, parallax) em um canvas
│   ├── LoadingScreen.jsx   tela de carregamento com a logo AS (1ª visita da sessão)
│   ├── JoaoPedro.jsx       assistente (Central de Atendimento do Business OS, origem PORTFOLIO)
│   ├── QuoteForm.jsx       orçamento: registrar, pedir contato ou continuar pelo WhatsApp
│   └── QuoteStatus.jsx     andamento dos pedidos feitos neste navegador
├── pages/                  Início, Projetos, Projeto (/projetos/:slug), Orçamento, Privacidade, 404
└── styles/                 base (tokens, botões chanfrados), seções, widgets
scripts/gerar-sitemap.mjs   sitemap.xml + robots.txt no build
```

## Comportamentos importantes

- **Projetos**: só os publicados no Business OS. Retirar do site lá tira daqui na hora.
- **Orçamento**: a confirmação só aparece depois que a API registra o pedido (protocolo
  `ORC-...`). Falha de rede mostra o erro; tentar de novo não duplica. "Continuar pelo
  WhatsApp" só abre o WhatsApp com o resumo e **não** registra o pedido.
- **João Pedro IA**: sem IA configurada no servidor, avisa que está indisponível e oferece
  formulário, WhatsApp e falar com a equipe (sem respostas inventadas). Nunca informa preços ou prazos.
- **Desempenho e acessibilidade**: um único canvas leve (pausa em aba oculta, ~30 fps no celular),
  fontes servidas pelo próprio site, imagens WebP com carregamento sob demanda, foco visível, e
  `prefers-reduced-motion` desliga as animações.
- **LGPD**: consentimento para registrar pedidos, página `/privacidade`, só os dados necessários.

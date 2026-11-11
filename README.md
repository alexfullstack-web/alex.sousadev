# Alex Sousa Tech — site oficial

Site institucional da **Alex Sousa Tech**: empresa, serviços, projetos, processo de trabalho e pedido de orçamento.
Endereço: `https://portfolio.alexsousatech.com.br`.

React 19 + Vite + React Router 7 + CSS próprio + Lucide. JavaScript puro, sem TypeScript.
O conteúdo dos **projetos** e o recebimento dos **pedidos de orçamento** ficam no **Alex Sousa Tech Gestão**.

## Rodar localmente

```bash
npm install
cp .env.example .env.local   # preencha os valores (veja a tabela abaixo)
npm run dev                  # http://localhost:5173
npm run build                # gera dist/ com as páginas pré-renderizadas
npm run preview              # serve dist/ como na Vercel, inclusive /api/portfolio
```

Sem o Gestão configurado, o site abre normalmente, mas a lista de projetos fica vazia e o formulário mostra um erro ao enviar.

## Variáveis de ambiente

| Variável | Onde é usada | Pública? |
|----------|--------------|----------|
| `GESTAO_API_URL` | Funções `api/` da Vercel e build (`https://<API do Gestão>/api/v1`) | não |
| `GESTAO_SITE_KEY` | Chave do site gerada no Gestão (Portfólio → Integração com o site) | **não. Nunca use o prefixo `VITE_`** |
| `VITE_GESTAO_API_URL` | Formulário de orçamento, no navegador (`https://<API do Gestão>/api/v1`) | sim |
| `VITE_TURNSTILE_SITE_KEY` | Opcional: Cloudflare Turnstile no formulário | sim |

Variáveis com prefixo `VITE_` vão para o JavaScript que o visitante baixa. Por isso a chave do site **não** pode ter esse prefixo. O `.env` e os `.env.*` estão no `.gitignore`; só o `.env.example`, sem valores reais, vai para o repositório.

## Publicar na Vercel

1. *Settings → Environment Variables*, ambiente **Production**: as quatro variáveis acima.
2. No Gestão (API no Render): `PUBLIC_FORM_ORIGINS=https://portfolio.alexsousatech.com.br`, para aceitar o formulário, e `PUBLIC_BASE_URL` com o endereço público da API, para os links das imagens.
3. Faça o deploy. O `vercel.json` já tem os redirecionamentos, cabeçalhos de segurança e o sitemap dinâmico.

Passo a passo completo do lado do Gestão: `docs/INTEGRACAO-SITE.md` no repositório do Gestão.

## Como os projetos chegam ao site

- O site lê só os projetos **publicados** no Gestão, pelo servidor da Vercel (`api/portfolio`), usando a chave do site. O navegador nunca vê a chave.
- No `build`, cada projeto vira uma página HTML completa, com título, descrição, imagem e dados estruturados. Isso é bom para o Google e para o compartilhamento.
- Depois do deploy, a Vercel busca de novo a cada 5 minutos, no máximo. **Publicar, despublicar, editar e reordenar no Gestão aparece no site sem novo deploy.**
- Projeto publicado depois do deploy abre pela página base (`app-shell`) e entra no sitemap na hora. Ele ganha HTML completo no próximo deploy. Projeto despublicado vira "página não encontrada".
- Se o Gestão estiver fora do ar ou a chave for trocada, o site continua mostrando os projetos do último deploy.

## Formulário de orçamento

O formulário (`src/components/QuoteForm.jsx`) envia direto para `POST /public/service-requests` do Gestão. O pedido aparece em **Atendimento**, com empresa, faixa de investimento, prazo, forma de contato preferida e a data do aceite da política de privacidade.

- A confirmação só aparece depois que o Gestão grava o pedido. Depois dela, o visitante pode adiantar a conversa pelo WhatsApp com um resumo pronto.
- Erros de cada campo vindos da API aparecem ao lado do campo.
- Proteção contra robôs: campo-armadilha, tempo mínimo de preenchimento e Turnstile opcional.

## Estrutura

```
api/                       funções da Vercel (rodam no servidor)
├── _gestao.js             leitura do portfólio no Gestão (usado também pelo build)
├── _sitemap.js            páginas fixas e montagem do sitemap
├── portfolio/index.js     GET /api/portfolio
├── portfolio/[slug].js    GET /api/portfolio/:slug
└── sitemap.js             GET /sitemap.xml
scripts/prerender.mjs      gera o HTML de cada página depois do build
src/
├── App.jsx                rotas
├── config.js              endereços públicos (site, API do formulário)
├── data/empresa.js        textos da empresa, serviços, processo, diferenciais, contatos e "Sobre"
├── lib/gestao.js          chamadas do navegador (projetos via /api, envio do orçamento)
├── hooks/                 useProjetos, useSeo
├── seo/                   títulos, descrições e dados estruturados (Schema.org)
├── components/            Header, Footer, QuoteForm, ProjectCard, Processo, HeroVisual...
├── pages/                 Home, Empresa, SobreAlexSousa, Servicos, Projetos, Projeto,
│                          Orcamento, Contato, Privacidade, NaoEncontrado
└── styles/                base.css (cores, fontes, base) e site.css (componentes)
```

## Conteúdo

- **Textos da empresa, serviços, contatos e "Sobre"**: `src/data/empresa.js`. Ao mudar o conteúdo de uma página, atualize a data dela em `PAGINAS_FIXAS` (`api/_sitemap.js`).
- **Projetos**: só pelo painel do Gestão.
- **Fotos do Alex**: `public/img/site/`. A imagem de compartilhamento do site é `public/img/og-empresa.jpg` (1200×630).

SEO, Search Console e Cloudflare: `docs/SEO.md`.

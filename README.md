# Alex Sousa Tech — site oficial (v6.0.0)

Site comercial da **Alex Sousa Tech**: empresa, serviços, pedido de orçamento, planos por assinatura e área do cliente.
Endereço: `https://site.alexsousatech.com.br`.

React 19 + Vite + React Router 7 + CSS próprio + Lucide. JavaScript puro, sem TypeScript.
Os **planos e plataformas**, as **contas de clientes**, as **assinaturas** e o recebimento dos **pedidos de orçamento** ficam no **Alex Sousa Tech Gestão**.

## Rodar localmente

```bash
npm install
cp .env.example .env.local   # preencha os valores (veja a tabela abaixo)
npm run dev                  # http://localhost:5173
npm run build                # gera dist/ com as páginas pré-renderizadas
npm run preview              # serve dist/ como na Vercel, inclusive /api/status
```

Sem o Gestão configurado, o site abre normalmente, mas os planos mostram um aviso de indisponibilidade e o formulário mostra um erro ao enviar.

## Variáveis de ambiente

| Variável | Onde é usada | Pública? |
|----------|--------------|----------|
| `GESTAO_API_URL` | Diagnóstico `/api/status` (`https://<API do Gestão>/api/v1`; se vazio, usa `VITE_GESTAO_API_URL`) | não |
| `VITE_GESTAO_API_URL` | No navegador: orçamento, planos e área do cliente (`https://<API do Gestão>/api/v1`) | sim |
| `VITE_TURNSTILE_SITE_KEY` | Opcional: Cloudflare Turnstile no formulário | sim |

Variáveis com prefixo `VITE_` vão para o JavaScript que o visitante baixa: nada secreto nelas. O site não usa mais a chave `GESTAO_SITE_KEY` (servia só para a vitrine de projetos, removida); ela pode ser apagada na Vercel. O `.env` e os `.env.*` estão no `.gitignore`; só o `.env.example`, sem valores reais, vai para o repositório.

## Publicar na Vercel

1. *Settings → Environment Variables*, ambiente **Production**: as quatro variáveis acima.
2. No Gestão (API no Render): `PUBLIC_FORM_ORIGINS=https://site.alexsousatech.com.br`, para aceitar o formulário, e `PUBLIC_BASE_URL` com o endereço público da API, para os links das imagens.
3. Faça o deploy. O `vercel.json` já tem os redirecionamentos, cabeçalhos de segurança e o sitemap dinâmico.

### Conferir a ligação com o Gestão

Abra **`/api/status`** no site publicado, por exemplo `https://site.alexsousatech.com.br/api/status`. A página mostra, sem expor a chave:
- o endereço da API que o site está usando;
- se a chave está configurada e no formato certo;
- se a API respondeu;
- quantos planos o Gestão está oferecendo ao site (e se aceita este domínio em `CUSTOMER_ORIGINS`);
- se o Gestão aceita o formulário de orçamento deste domínio.

Quando algo falha, o campo `ajuda` diz o que corrigir. `GESTAO_API_URL` funciona com ou sem `/api/v1`, com aspas ou barra no fim: o site corrige.

Passo a passo completo do lado do Gestão: `docs/INTEGRACAO-SITE.md` no repositório do Gestão.

## Formulário de orçamento

O formulário (`src/components/QuoteForm.jsx`) envia direto para `POST /public/service-requests` do Gestão. O pedido aparece em **Atendimento**, com empresa, faixa de investimento, prazo, forma de contato preferida e a data do aceite da política de privacidade.

- A confirmação só aparece depois que o Gestão grava o pedido. Depois dela, o visitante pode adiantar a conversa pelo WhatsApp com um resumo pronto.
- Erros de cada campo vindos da API aparecem ao lado do campo.
- Proteção contra robôs: campo-armadilha, tempo mínimo de preenchimento e Turnstile opcional.

## Estrutura

```
api/                       funções da Vercel (rodam no servidor)
├── _gestao.js             endereço da API do Gestão (diagnóstico)
├── _sitemap.js            páginas fixas e montagem do sitemap
├── status.js              GET /api/status (API, planos e formulário aceitam este domínio?)
└── sitemap.js             GET /sitemap.xml
scripts/prerender.mjs      gera o HTML de cada página depois do build
src/
├── App.jsx                rotas
├── config.js              endereços públicos (site, API do formulário)
├── data/empresa.js        textos da empresa, serviços, processo, diferenciais, contatos e "Sobre"
├── lib/gestao.js          chamadas do navegador (planos do Gestão, envio do orçamento)
├── hooks/                 usePlanos, useSeo
├── seo/                   títulos, descrições e dados estruturados (Schema.org)
├── components/            Header, Footer, QuoteForm, Processo, HeroVisual...
├── pages/                 Home, Empresa, SobreAlexSousa, Servicos, Planos,
│                          Orcamento, Contato, PoliticaPrivacidade, TermosUso, NaoEncontrado
├── components/ui/         Cartao, SecaoTopo, Aviso, Carregando (componentes reutilizáveis da v6)
└── styles/                base.css (identidade e base), ui.css (botões, cartões, formulários),
                           layout.css (fundo, cabeçalho, rodapé), paginas.css e conta.css (área do cliente)
```

## Planos (`/planos`) e vitrine de projetos

- `/planos` e a seção "Plataformas por assinatura" da página inicial mostram os planos e plataformas cadastrados no painel do Gestão (`/customer/catalog`: só planos ativos e públicos). São buscados pelo navegador, então mudanças no painel aparecem sem novo deploy. Usam só componentes e classes já existentes (lista de Serviços e cartões `servico`).
- "Contratar" leva a `/conta?aba=assinaturas`; sem login, a aba pedida é aberta depois do cadastro ou login.
- A vitrine pública de projetos foi removida do site: `/projetos` e `/projetos/:slug` redirecionam (308) para `/servicos`. O módulo Portfólio do Gestão e os projetos no banco continuam intactos.

## Área do cliente (`/conta`)

- Páginas em `src/conta/` (Entrar, Criar conta, Recuperar senha, Nova senha, Minha conta), carregadas só quando o visitante abre `/conta`.
- Conversam com `VITE_GESTAO_API_URL` + `/customer` (API do Gestão), com `credentials: 'include'`. A sessão volta pelo cookie HttpOnly da API; o token de acesso fica só em memória, nada no `localStorage`.
- Não são pré-renderizadas nem indexadas: o `vercel.json` manda `/conta` para a casca do app (`noindex`) e o `robots.txt` tem `Disallow: /conta`.
- "Minhas assinaturas" e "Minhas plataformas" (`src/conta/Assinaturas.jsx`): tudo vem da API (`/customer/catalog`, `/customer/subscriptions`, `/customer/platforms`); o site não decide acesso nem pagamento. A contratação só aparece quando a API responde `checkoutEnabled: true`; antes disso, o botão é "Quero contratar" (WhatsApp).
- Na API (Render), o site precisa estar em `CUSTOMER_ORIGINS` (padrão: `PUBLIC_FORM_ORIGINS`), e `SITE_URL` define o endereço dos links nos e-mails.

## Páginas legais

- `/politica-de-privacidade` (`src/pages/PoliticaPrivacidade.jsx`) e `/termos-de-uso` (`src/pages/TermosUso.jsx`), com links no rodapé. Os endereços ficam em `src/data/legal.js`.
- O endereço antigo `/privacidade` redireciona (308) para `/politica-de-privacidade`.
- A política descreve só o que está implementado no site e no Gestão, inclusive o envio de e-mails pelo Resend. Se o tratamento de dados mudar (novo campo, fornecedor ou finalidade), atualize o texto, a data no topo da página e a data em `api/_sitemap.js`.
- No domínio `alexsousatech.com.br` (painel do Gestão), os mesmos caminhos redirecionam para cá: veja o `vercel.json` do painel.

## Conteúdo

- **Textos da empresa, serviços, contatos e "Sobre"**: `src/data/empresa.js`. Ao mudar o conteúdo de uma página, atualize a data dela em `PAGINAS_FIXAS` (`api/_sitemap.js`).
- **Projetos**: só pelo painel do Gestão.
- **Fotos do Alex**: `public/img/site/`. A imagem de compartilhamento do site é `public/img/og-empresa.jpg` (1200×630).

SEO, Search Console e Cloudflare: `docs/SEO.md`.

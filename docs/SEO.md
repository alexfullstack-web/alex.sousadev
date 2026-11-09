# SEO e identidade digital — Alex Sousa Tech

Domínio oficial: `https://portfolio.alexsousatech.com.br` (fixo em `src/config.js` e `api/_sitemap.js`).
Sitemap: `https://portfolio.alexsousatech.com.br/sitemap.xml`

## Como funciona

- `npm run build` gera um HTML completo por página pública, com conteúdo, título, canonical e JSON-LD.
- Os dados vêm das rotas públicas da API. Se a API não responder, o build continua sem os dados dela (aparece um aviso no log).
- Depois de carregar, o React assume a página e busca os dados atuais na API.
- Projeto publicado depois do último build: abre normalmente por `app-shell.html` e já entra no sitemap, mas só tem HTML completo no próximo deploy.

## Depois de publicar ou editar projeto

Crie um Deploy Hook na Vercel (Settings → Git → Deploy Hooks) e chame a URL após publicar um projeto, ou faça um novo deploy. Sem isso, títulos e textos do HTML inicial ficam como no último build.

## Variáveis na Vercel

| Variável | Valor |
|---|---|
| `VITE_API_URL` | API do Business OS, terminando em `/api` |
| `VITE_EMPRESA` | slug da empresa (padrão `alex-sousa-tech`) |

`VITE_SITE_URL` não é mais usada e pode ser apagada.

## Backend

Inclua `https://portfolio.alexsousatech.com.br` em `CORS_ORIGINS`, ou o site não carregará os dados nesse domínio.

## Redes sociais

Os links do JSON-LD (`sameAs`), do rodapé e da página Sobre vêm do Business OS. Só entram endereços `https://`.
Confira GitHub, LinkedIn, Instagram e YouTube em Configurações do site antes de publicar.

## Cloudflare

1. DNS → registro do subdomínio `portfolio`: use o valor exibido em Vercel → Settings → Domains.
2. Deixe esse registro como **DNS only** (nuvem cinza), como a Vercel recomenda.
3. Com DNS only, as regras de proxy, WAF e cache da Cloudflare não atuam nesse subdomínio.
4. Se um dia ativar o proxy: SSL em Full (strict), não bloqueie o Googlebot e desligue a edição gerenciada do robots.txt.

## Google Search Console

1. Em https://search.google.com/search-console adicione uma propriedade do tipo **Domínio**: `alexsousatech.com.br`.
2. Copie o valor `google-site-verification=...`.
3. Cloudflare → DNS → Add record: tipo `TXT`, nome `@`, conteúdo = valor copiado.
4. Volte ao Search Console e clique em Verificar. Pode demorar alguns minutos para propagar.
5. Sitemaps → envie `https://portfolio.alexsousatech.com.br/sitemap.xml`.
6. Inspeção de URL → teste e solicite indexação de `/`, `/sobre-alex-sousa` e `/projetos`.
7. Valide os dados estruturados em https://search.google.com/test/rich-results e https://validator.schema.org.
8. Acompanhe em Indexação → Páginas e em Core Web Vitals.

SEO não garante posição. Perfis externos que apontem para o site (GitHub, LinkedIn, Instagram) ajudam o Google a ligar a marca ao fundador.

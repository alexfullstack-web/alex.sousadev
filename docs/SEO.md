# SEO e identidade digital — Alex Sousa Tech

Domínio oficial: `https://site.alexsousatech.com.br` (fixo em `src/config.js` e `api/_sitemap.js`).
Sitemap: `https://site.alexsousatech.com.br/sitemap.xml`

## Como funciona

- `npm run build` gera um HTML completo por página pública, com conteúdo, título, canonical e JSON-LD.
- Os projetos vêm do Alex Sousa Tech Gestão, lidos com a chave do site (`api/_gestao.js`). Se o Gestão não responder, o build tenta de novo e, se continuar fora, gera as páginas fixas e avisa no log.
- Depois de carregar, o React assume a página e busca os projetos atuais em `/api/portfolio`, que guarda cache por 5 minutos na Vercel.
- Projeto publicado depois do último build abre normalmente por `app-shell.html` e já entra no sitemap, mas só tem HTML completo no próximo deploy.

## Datas do sitemap

O `lastmod` dos projetos vem da data da última alteração no Gestão. O das páginas fixas fica em `PAGINAS_FIXAS` (`api/_sitemap.js`): ao mudar o conteúdo de uma página, atualize a data dela.

## Depois de publicar ou editar projeto

A página que o visitante vê se atualiza sozinha em até 5 minutos. O **HTML inicial**, que é o que o Google e as redes sociais leem primeiro, só muda no próximo deploy. Depois de publicar algo importante, faça um *Redeploy* na Vercel, ou crie um Deploy Hook (Settings → Git → Deploy Hooks) e chame a URL dele.

## Variáveis na Vercel

Veja a tabela no `README.md`: `GESTAO_API_URL`, `GESTAO_SITE_KEY` (só no servidor), `VITE_GESTAO_API_URL` e, se usar, `VITE_TURNSTILE_SITE_KEY`.

Variáveis antigas que podem ser apagadas: `VITE_API_URL`, `VITE_EMPRESA`, `VITE_SITE_URL`.

## Gestão (API)

Inclua `https://site.alexsousatech.com.br` em `PUBLIC_FORM_ORIGINS`, ou o formulário de orçamento será recusado nesse domínio.

## Redes sociais

Os perfis oficiais (Instagram e GitHub) ficam em `src/data/empresa.js` (`CONTATO`) e em `src/seo/marca.js` (`REDES_OFICIAIS`, usados no `sameAs` do JSON-LD). Ao criar outro perfil oficial, por exemplo LinkedIn, inclua-o nos dois lugares.

## Dados estruturados por página

| Página | Schema.org |
|--------|------------|
| Todas | `Organization` (Alex Sousa Tech) e `WebSite` |
| `/sobre-alex-sousa` | `ProfilePage` + `Person` (Alex Sousa, fundador) |
| `/servicos` | `ItemList` com os 9 `Service` |
| `/projetos/:slug` | `CreativeWork` do projeto, criado pela `Organization`, + `BreadcrumbList` |

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
5. Sitemaps → envie `https://site.alexsousatech.com.br/sitemap.xml`.
6. Inspeção de URL → teste e solicite indexação de `/`, `/sobre-alex-sousa` e `/projetos`.
7. Valide os dados estruturados em https://search.google.com/test/rich-results e https://validator.schema.org.
8. Acompanhe em Indexação → Páginas e em Core Web Vitals.

SEO não garante posição. Perfis externos que apontem para o site (GitHub, LinkedIn, Instagram) ajudam o Google a ligar a marca ao fundador.

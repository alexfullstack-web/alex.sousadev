// Pré-renderização: grava em dist/ um HTML completo por página pública, para que o conteúdo, os
// títulos e os dados estruturados já venham na primeira resposta. Roda depois do "vite build".
// Os projetos vêm do Alex Sousa Tech Gestão pela API autenticada (GESTAO_API_URL + GESTAO_SITE_KEY).
// Se o Gestão não responder, o build continua: as páginas saem sem a lista, e o navegador busca
// os projetos em /api/portfolio ao abrir a página.
import { existsSync, readFileSync, readdirSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { montarSitemap } from '../api/_sitemap.js';
import { buscarPortfolio, buscarProjeto, lerConfig } from '../api/_gestao.js';

const raiz = process.cwd();
const dist = resolve(raiz, 'dist');
const ssr = resolve(raiz, 'dist-ssr');

function lerEnv() {
  const env = { ...process.env };
  for (const arquivo of ['.env', '.env.production', '.env.local', '.env.production.local']) {
    const p = resolve(raiz, arquivo);
    if (!existsSync(p)) continue;
    for (const linha of readFileSync(p, 'utf8').split(/\r?\n/)) {
      const m = linha.match(/^\s*((?:VITE|GESTAO)_[A-Z_]+)\s*=\s*(.*)\s*$/);
      if (m && env[m[1]] === undefined) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
  return env;
}

const config = lerConfig(lerEnv());

function escrever(arquivo, conteudo) {
  const destino = resolve(dist, arquivo);
  mkdirSync(dirname(destino), { recursive: true });
  writeFileSync(destino, conteudo);
}

const { renderizar, calcularSeo, cabecalhoHtml, jsonSeguro } = await import(pathToFileURL(resolve(ssr, 'entry-server.js')).href);

const modelo = readFileSync(resolve(dist, 'index.html'), 'utf8');
const trocarBloco = (html, nome, novo) => {
  const re = new RegExp(`<!--${nome}-inicio-->[\\s\\S]*?<!--${nome}-fim-->`);
  if (!re.test(html)) throw new Error(`Marcador ${nome} não encontrado em index.html`);
  return html.replace(re, () => novo);
};

// Pré-carrega só as fontes do que aparece primeiro, para reduzir a troca de fonte (CLS).
const fontes = readdirSync(resolve(dist, 'assets'))
  .filter((f) => /^(manrope-latin-400|sora-latin-700)-normal-.*\.woff2$/.test(f))
  .map((f) => `<link rel="preload" as="font" type="font/woff2" href="/assets/${f}" crossorigin />`);

async function gerar(rota, arquivo, dados) {
  const { html, seo } = await renderizar(rota, dados);
  // React antecipa imagens prioritárias como <link> no início do HTML: o lugar certo é o <head>.
  const links = [];
  const corpo = html.replace(/^(?:<link rel="preload"[^>]*\/>)+/, (m) => {
    links.push(...m.match(/<link[^>]*\/>/g));
    return '';
  });
  let pagina = trocarBloco(modelo, 'seo', `${cabecalhoHtml(seo)}\n    ${[...fontes, ...links].join('\n    ')}`);
  pagina = trocarBloco(pagina, 'app', corpo);
  pagina = pagina.replace('</head>', () => `  <script>window.__DADOS_INICIAIS__=${jsonSeguro(dados)}</script>\n  </head>`);
  escrever(arquivo, pagina);
  return seo;
}

let projetos = null;
if (!config.configurado) {
  console.warn('[prerender] GESTAO_API_URL/GESTAO_SITE_KEY ausentes: páginas geradas sem a lista de projetos.');
} else {
  try {
    // O Render gratuito pode estar dormindo: até 4 tentativas na primeira chamada.
    ({ itens: projetos } = await buscarPortfolio(config, { tentativas: 4, tempo: 30000 }));
  } catch (e) {
    console.warn(`[prerender] Gestão indisponível (${e.message}). Páginas geradas sem a lista de projetos.`);
  }
}

// Casca sem conteúdo: atende projetos publicados depois do último build.
const casca = trocarBloco(modelo, 'seo', `${cabecalhoHtml(calcularSeo({ caminho: null }))}\n    ${fontes.join('\n    ')}`);
escrever('app-shell.html', casca);

const paginas = [
  ['/', 'index.html', { projetos }],
  ['/empresa', 'empresa.html', {}],
  ['/sobre-alex-sousa', 'sobre-alex-sousa.html', {}],
  ['/servicos', 'servicos.html', {}],
  ['/projetos', 'projetos.html', { projetos }],
  ['/orcamento', 'orcamento.html', {}],
  ['/contato', 'contato.html', {}],
  ['/privacidade', 'privacidade.html', {}],
  ['/404', '404.html', {}],
];
for (const [rota, arquivo, dados] of paginas) await gerar(rota, arquivo, dados);

let gerados = 0;
for (const { slug } of projetos || []) {
  let projeto = null;
  try {
    projeto = await buscarProjeto(slug, config);
  } catch (e) {
    console.warn(`[prerender] /projetos/${slug}: ${e.message}`);
  }
  if (!projeto) continue;
  await gerar(`/projetos/${slug}`, `projetos/${slug}.html`, { projeto, projetoSlug: slug });
  gerados++;
}

escrever('sitemap-fallback.xml', montarSitemap(projetos || []));
// Um sitemap.xml estático teria prioridade sobre o dinâmico na Vercel: nunca pode ir para o deploy.
rmSync(resolve(dist, 'sitemap.xml'), { force: true });
rmSync(ssr, { recursive: true, force: true });
console.log(`[prerender] ${paginas.length} páginas fixas e ${gerados} projeto(s) gerados.${projetos ? '' : ' ATENÇÃO: sem dados do Gestão neste build.'}`);

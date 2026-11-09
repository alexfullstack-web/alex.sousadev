// Pré-renderização: grava em dist/ um HTML completo por página pública, para que o conteúdo, os
// títulos e os dados estruturados já venham na primeira resposta. Roda depois do "vite build".
// Só lê rotas públicas da API. Se ela não responder, o build continua, sem os dados dela.
import { existsSync, readFileSync, readdirSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { montarSitemap } from '../api/_sitemap.js';

const raiz = process.cwd();
const dist = resolve(raiz, 'dist');
const ssr = resolve(raiz, 'dist-ssr');

function lerEnv() {
  const env = { ...process.env };
  for (const arquivo of ['.env', '.env.production', '.env.local', '.env.production.local']) {
    const p = resolve(raiz, arquivo);
    if (!existsSync(p)) continue;
    for (const linha of readFileSync(p, 'utf8').split(/\r?\n/)) {
      const m = linha.match(/^\s*(VITE_[A-Z_]+)\s*=\s*(.*)\s*$/);
      if (m && env[m[1]] === undefined) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
  return env;
}

const env = lerEnv();
const API = (env.VITE_API_URL || '').replace(/\/+$/, '');
const BASE = `${API}/site/publico/${encodeURIComponent(env.VITE_EMPRESA || 'alex-sousa-tech')}`;
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
let apiFora = !API;

// A API pode estar "dormindo" (plano gratuito leva cerca de 1 minuto para acordar): insiste só na primeira chamada.
let acordada = false;
async function obter(caminho) {
  if (apiFora) return null;
  const tentativas = acordada ? 1 : 4;
  for (let i = 1; i <= tentativas; i++) {
    try {
      const r = await fetch(`${BASE}${caminho}`, { signal: AbortSignal.timeout(30000) });
      acordada = true;
      if (!r.ok) {
        console.warn(`[prerender] ${caminho || '/'}: HTTP ${r.status}`);
        return null;
      }
      return await r.json();
    } catch (e) {
      console.warn(`[prerender] ${caminho || '/'}: tentativa ${i}/${tentativas} falhou (${e.message})`);
      if (i < tentativas) await espera(5000);
    }
  }
  if (!acordada) apiFora = true;
  return null;
}

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

// Pré-carrega só as duas fontes do que aparece primeiro, para reduzir a troca de fonte (CLS).
const fontes = readdirSync(resolve(dist, 'assets'))
  .filter((f) => /^(manrope-latin-400|chakra-petch-latin-700)-normal-.*\.woff2$/.test(f))
  .map((f) => `<link rel="preload" as="font" type="font/woff2" href="/assets/${f}" crossorigin />`);

const PRELOAD_HOME = [
  '<link rel="preload" as="image" href="/img/site/alex.webp" type="image/webp" media="(min-width: 700px)" fetchpriority="high" />',
  '<link rel="preload" as="image" href="/img/site/alex-sm.webp" type="image/webp" media="(max-width: 699px)" fetchpriority="high" />',
];

async function gerar(rota, arquivo, dados) {
  const { html, seo } = await renderizar(rota, dados);
  // React antecipa imagens prioritárias como <link> no início do HTML: o lugar certo é o <head>.
  const links = [];
  const corpo = html.replace(/^(?:<link rel="preload"[^>]*\/>)+/, (m) => {
    links.push(...m.match(/<link[^>]*\/>/g));
    return '';
  });
  const extras = [...fontes, ...(rota === '/' ? PRELOAD_HOME : links)];
  let pagina = trocarBloco(modelo, 'seo', `${cabecalhoHtml(seo)}\n    ${extras.join('\n    ')}`);
  pagina = trocarBloco(pagina, 'app', corpo);
  pagina = pagina.replace('</head>', () => `  <script>window.__DADOS_INICIAIS__=${jsonSeguro(dados)}</script>\n  </head>`);
  escrever(arquivo, pagina);
  return seo;
}

const site = await obter('');
const [todos, inicio, listaSitemap] = await Promise.all([obter('/projetos'), obter('/projetos?limite=7'), obter('/sitemap')]);
const projetos = todos?.itens || [];

// Da rota de sitemap vem a data de atualização; se faltar, usa a listagem.
const publicados = (listaSitemap?.projetos || projetos).filter((p) => /^[a-z0-9][a-z0-9-]*$/i.test(p?.slug || ''));

// Casca sem conteúdo: atende projetos publicados depois do último build.
const casca = trocarBloco(modelo, 'seo', `${cabecalhoHtml(calcularSeo({ caminho: null }, site))}\n    ${fontes.join('\n    ')}`);
escrever('app-shell.html', casca);

const comuns = { site };
await gerar('/', 'index.html', { ...comuns, projetosInicio: inicio?.itens ?? null });
await gerar('/sobre-alex-sousa', 'sobre-alex-sousa.html', { ...comuns, projetosInicio: inicio?.itens ?? null });
await gerar('/projetos', 'projetos.html', { ...comuns, projetos: todos?.itens ?? null });
await gerar('/orcamento', 'orcamento.html', comuns);
await gerar('/privacidade', 'privacidade.html', comuns);
await gerar('/404', '404.html', comuns);

let gerados = 0;
for (const { slug } of publicados) {
  const projeto = await obter(`/projetos/${encodeURIComponent(slug)}`);
  if (!projeto) continue;
  await gerar(`/projetos/${slug}`, `projetos/${slug}.html`, { ...comuns, projeto, projetoSlug: slug });
  gerados++;
}

escrever('sitemap-fallback.xml', montarSitemap(publicados));
rmSync(ssr, { recursive: true, force: true });
console.log(`[prerender] 6 páginas fixas e ${gerados} projeto(s) gerados.${site ? '' : ' ATENÇÃO: sem dados da API neste build.'}`);

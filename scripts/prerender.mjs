// Pré-renderização: grava em dist/ um HTML completo por página pública, para que o conteúdo, os
// títulos e os dados estruturados já venham na primeira resposta. Roda depois do "vite build".
// Não depende do Gestão: os planos (página inicial e /planos) são buscados pelo navegador ao abrir a página.
import { readFileSync, readdirSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { montarSitemap } from '../api/_sitemap.js';

const raiz = process.cwd();
const dist = resolve(raiz, 'dist');
const ssr = resolve(raiz, 'dist-ssr');


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

// Casca sem conteúdo: atende a área do cliente (/conta), que não é pré-renderizada.
const casca = trocarBloco(modelo, 'seo', `${cabecalhoHtml(calcularSeo({ caminho: null }))}\n    ${fontes.join('\n    ')}`);
escrever('app-shell.html', casca);

const paginas = [
  ['/', 'index.html', {}],
  ['/empresa', 'empresa.html', {}],
  ['/sobre-alex-sousa', 'sobre-alex-sousa.html', {}],
  ['/servicos', 'servicos.html', {}],
  ['/planos', 'planos.html', {}],
  ['/orcamento', 'orcamento.html', {}],
  ['/contato', 'contato.html', {}],
  ['/politica-de-privacidade', 'politica-de-privacidade.html', {}],
  ['/termos-de-uso', 'termos-de-uso.html', {}],
  ['/404', '404.html', {}],
];
for (const [rota, arquivo, dados] of paginas) await gerar(rota, arquivo, dados);

escrever('sitemap-fallback.xml', montarSitemap());
// Um sitemap.xml estático teria prioridade sobre o dinâmico na Vercel: nunca pode ir para o deploy.
rmSync(resolve(dist, 'sitemap.xml'), { force: true });
rmSync(ssr, { recursive: true, force: true });
console.log(`[prerender] ${paginas.length} páginas geradas.`);

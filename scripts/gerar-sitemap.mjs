// Gera public/sitemap.xml e public/robots.txt antes do build (npm run build).
// Lê os projetos PUBLICADOS da API pública do Business OS; se a API não responder, gera só as
// páginas fixas e avisa (o build continua).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

function lerEnv() {
  const env = { ...process.env };
  for (const arquivo of ['.env', '.env.production', '.env.local', '.env.production.local']) {
    const p = resolve(process.cwd(), arquivo);
    if (!existsSync(p)) continue;
    for (const linha of readFileSync(p, 'utf8').split(/\r?\n/)) {
      const m = linha.match(/^\s*(VITE_[A-Z_]+)\s*=\s*(.*)\s*$/);
      if (m && env[m[1]] === undefined) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
  return env;
}

const env = lerEnv();
const SITE = (env.VITE_SITE_URL || 'https://alex-sousadev.vercel.app').replace(/\/+$/, '');
const API = (env.VITE_API_URL || '').replace(/\/+$/, '');
const EMPRESA = env.VITE_EMPRESA || 'alex-sousa-tech';
const hoje = new Date().toISOString().slice(0, 10);

const urls = [
  { loc: `${SITE}/`, prioridade: '1.0', lastmod: hoje },
  { loc: `${SITE}/projetos`, prioridade: '0.9', lastmod: hoje },
  { loc: `${SITE}/orcamento`, prioridade: '0.8', lastmod: hoje },
  { loc: `${SITE}/privacidade`, prioridade: '0.3', lastmod: hoje },
];

async function projetos() {
  if (!API) return [];
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 8000);
  try {
    const r = await fetch(`${API}/site/publico/${encodeURIComponent(EMPRESA)}/sitemap`, { signal: ctrl.signal });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return (await r.json()).projetos || [];
  } finally {
    clearTimeout(t);
  }
}

try {
  const lista = await projetos();
  for (const p of lista) urls.push({ loc: `${SITE}/projetos/${p.slug}`, prioridade: '0.7', lastmod: String(p.atualizadoEm).slice(0, 10) });
  console.log(`[sitemap] ${lista.length} projeto(s) publicado(s) incluído(s).`);
} catch (e) {
  console.warn(`[sitemap] API indisponível (${e.message}); gerando só as páginas fixas.`);
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod><priority>${u.prioridade}</priority></url>`).join('\n')}
</urlset>
`;
writeFileSync(resolve(process.cwd(), 'public/sitemap.xml'), xml);
writeFileSync(resolve(process.cwd(), 'public/robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);

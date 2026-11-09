// /sitemap.xml dinâmico: lê os projetos publicados no Business OS a cada atualização do cache.
// Só usa a rota pública da API. Se ela estiver dormindo ou fora, entrega a lista gerada no último build.
import { SITE, montarSitemap } from './_sitemap.js';

async function projetosPublicados() {
  const api = (process.env.VITE_API_URL || '').replace(/\/+$/, '');
  if (!api) throw new Error('VITE_API_URL ausente');
  const empresa = encodeURIComponent(process.env.VITE_EMPRESA || 'alex-sousa-tech');
  const r = await fetch(`${api}/site/publico/${empresa}/sitemap`, { signal: AbortSignal.timeout(8000) });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return (await r.json()).projetos || [];
}

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('X-Robots-Tag', 'noindex');
  try {
    const xml = montarSitemap(await projetosPublicados());
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).send(xml);
  } catch {
    res.setHeader('Cache-Control', 'public, s-maxage=300');
    try {
      const r = await fetch(`${SITE}/sitemap-fallback.xml`, { signal: AbortSignal.timeout(4000) });
      if (r.ok) return res.status(200).send(await r.text());
    } catch {
      /* segue para a lista fixa */
    }
    return res.status(200).send(montarSitemap());
  }
}

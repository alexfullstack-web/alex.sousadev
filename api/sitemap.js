// /sitemap.xml dinâmico: lê os projetos publicados no Gestão (API autenticada) a cada atualização do cache.
// Se o Gestão estiver dormindo ou fora, entrega a lista gerada no último build.
import { SITE, montarSitemap } from './_sitemap.js';
import { buscarPortfolio, lerConfig } from './_gestao.js';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('X-Robots-Tag', 'noindex');
  try {
    const config = lerConfig();
    if (!config.configurado) throw new Error('integração não configurada');
    const { itens } = await buscarPortfolio(config, { tempo: 8000 });
    res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=3600');
    return res.status(200).send(montarSitemap(itens));
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

// /sitemap.xml: só páginas fixas (a vitrine de projetos saiu do site; a área do cliente não é indexada).
import { montarSitemap } from './_sitemap.js';

export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('X-Robots-Tag', 'noindex');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  return res.status(200).send(montarSitemap());
}

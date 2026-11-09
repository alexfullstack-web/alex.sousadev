// Montagem do sitemap, compartilhada entre a função da Vercel e o build.
// (Arquivos com "_" na pasta api não viram rota.)
export const SITE = 'https://portfolio.alexsousatech.com.br';

export const PAGINAS_FIXAS = ['/', '/sobre-alex-sousa', '/projetos', '/orcamento', '/privacidade'];

const dataValida = (d) => (/^\d{4}-\d{2}-\d{2}/.test(String(d)) ? String(d).slice(0, 10) : null);

export function montarSitemap(projetos = []) {
  const urls = [
    ...PAGINAS_FIXAS.map((p) => ({ loc: `${SITE}${p}` })),
    ...projetos.filter((p) => p?.slug).map((p) => ({ loc: `${SITE}/projetos/${encodeURIComponent(p.slug)}`, lastmod: dataValida(p.atualizadoEm) })),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`).join('\n')}
</urlset>
`;
}

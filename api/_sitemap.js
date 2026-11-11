// Montagem do sitemap, compartilhada entre a função da Vercel e o build.
// (Arquivos com "_" na pasta api não viram rota.)
export const SITE = 'https://portfolio.alexsousatech.com.br';

// Todas as páginas públicas fixas (mesmas rotas de src/App.jsx).
// atualizadoEm = dia da última alteração real da página. Ao mudar o conteúdo de uma delas, atualize a data aqui.
export const PAGINAS_FIXAS = [
  { caminho: '/', atualizadoEm: '2026-11-10' },
  { caminho: '/empresa', atualizadoEm: '2026-11-10' },
  { caminho: '/sobre-alex-sousa', atualizadoEm: '2026-11-10' },
  { caminho: '/servicos', atualizadoEm: '2026-11-10' },
  { caminho: '/projetos', atualizadoEm: '2026-11-10' },
  { caminho: '/orcamento', atualizadoEm: '2026-11-10' },
  { caminho: '/contato', atualizadoEm: '2026-11-10' },
  { caminho: '/privacidade', atualizadoEm: '2026-11-10' },
];

const SLUG_VALIDO = /^[a-z0-9][a-z0-9-]*$/i;

// Só aceita data real e não futura; sem data confiável, o lastmod é omitido.
function dataValida(valor) {
  const t = Date.parse(valor);
  return Number.isNaN(t) || t > Date.now() ? null : new Date(t).toISOString().slice(0, 10);
}

export function montarSitemap(projetos = []) {
  const unicos = [...new Map(projetos.filter((p) => SLUG_VALIDO.test(p?.slug || '')).map((p) => [p.slug, p])).values()];
  const datasProjetos = unicos.map((p) => ({ slug: p.slug, lastmod: dataValida(p.atualizadoEm) }));
  const maisRecente = datasProjetos.map((p) => p.lastmod).filter(Boolean).sort().pop();
  const urls = [
    ...PAGINAS_FIXAS.map(({ caminho, atualizadoEm }) => ({
      loc: `${SITE}${caminho}`,
      // A listagem muda sempre que um projeto publicado muda.
      lastmod: caminho === '/projetos' && maisRecente && maisRecente > atualizadoEm ? maisRecente : atualizadoEm,
    })),
    ...datasProjetos.map((p) => ({ loc: `${SITE}/projetos/${p.slug}`, lastmod: p.lastmod })),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`).join('\n')}
</urlset>
`;
}

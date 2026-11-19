// Montagem do sitemap, compartilhada entre a função da Vercel e o build.
// (Arquivos com "_" na pasta api não viram rota.)
export const SITE = 'https://site.alexsousatech.com.br';

// Todas as páginas públicas fixas (mesmas rotas de src/App.jsx).
// atualizadoEm = dia da última alteração real da página. Ao mudar o conteúdo de uma delas, atualize a data aqui.
export const PAGINAS_FIXAS = [
  { caminho: '/', atualizadoEm: '2026-11-19' },
  { caminho: '/empresa', atualizadoEm: '2026-11-19' },
  { caminho: '/sobre-alex-sousa', atualizadoEm: '2026-11-10' },
  { caminho: '/servicos', atualizadoEm: '2026-11-10' },
  { caminho: '/planos', atualizadoEm: '2026-11-19' },
  { caminho: '/orcamento', atualizadoEm: '2026-11-10' },
  { caminho: '/contato', atualizadoEm: '2026-11-10' },
  { caminho: '/politica-de-privacidade', atualizadoEm: '2026-11-19' },
  { caminho: '/termos-de-uso', atualizadoEm: '2026-11-19' },
];

export function montarSitemap() {
  const urls = PAGINAS_FIXAS.map(({ caminho, atualizadoEm }) => ({ loc: `${SITE}${caminho}`, lastmod: atualizadoEm }));
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`).join('\n')}
</urlset>
`;
}

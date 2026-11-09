// Calcula o SEO de uma página. A mesma função serve ao navegador (useSeo) e ao build (HTML inicial).
import { SITE_URL } from '../config.js';
import { DESCRICAO_PADRAO, IMAGEM_SOCIAL, MARCA, TITULO_PADRAO, resumirDescricao, urlAbsoluta } from './marca.js';
import { entidadesGlobais } from './schema.js';

export function calcularSeo({ titulo, tituloCompleto, descricao, caminho, imagem, imagemAlt, noindex = false, entidades = [] }, dados) {
  return {
    titulo: tituloCompleto || (titulo ? `${titulo} | ${MARCA}` : TITULO_PADRAO),
    descricao: resumirDescricao(descricao || DESCRICAO_PADRAO),
    url: caminho && !noindex ? `${SITE_URL}${caminho === '/' ? '/' : caminho}` : null,
    imagem: imagem ? urlAbsoluta(imagem) : IMAGEM_SOCIAL,
    imagemAlt: imagemAlt || `Logotipo e apresentação da ${MARCA}`,
    robots: noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large',
    jsonLd: { '@context': 'https://schema.org', '@graph': [...entidadesGlobais(dados), ...entidades] },
  };
}

const atributo = (v) => String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export const jsonSeguro = (obj) =>
  JSON.stringify(obj).replace(/[<\u2028\u2029]/g, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`);

// Bloco <head> gravado em cada HTML gerado no build.
export function cabecalhoHtml(seo) {
  const linhas = [
    `<title>${atributo(seo.titulo)}</title>`,
    `<meta name="description" content="${atributo(seo.descricao)}" />`,
    `<meta name="robots" content="${seo.robots}" />`,
    seo.url && `<link rel="canonical" href="${atributo(seo.url)}" />`,
    '<meta property="og:type" content="website" />',
    `<meta property="og:site_name" content="${MARCA}" />`,
    '<meta property="og:locale" content="pt_BR" />',
    `<meta property="og:title" content="${atributo(seo.titulo)}" />`,
    `<meta property="og:description" content="${atributo(seo.descricao)}" />`,
    seo.url && `<meta property="og:url" content="${atributo(seo.url)}" />`,
    `<meta property="og:image" content="${atributo(seo.imagem)}" />`,
    `<meta property="og:image:alt" content="${atributo(seo.imagemAlt)}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${atributo(seo.titulo)}" />`,
    `<meta name="twitter:description" content="${atributo(seo.descricao)}" />`,
    `<meta name="twitter:image" content="${atributo(seo.imagem)}" />`,
    `<meta name="twitter:image:alt" content="${atributo(seo.imagemAlt)}" />`,
    `<script type="application/ld+json" id="dados-estruturados">${jsonSeguro(seo.jsonLd)}</script>`,
  ];
  return linhas.filter(Boolean).join('\n    ');
}

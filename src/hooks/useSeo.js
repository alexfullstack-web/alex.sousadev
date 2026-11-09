// SEO por página. No navegador atualiza o <head>; no build entrega os valores ao HTML inicial.
import { useEffect } from 'react';
import { useSite } from '../context/SiteContext.jsx';
import { calcularSeo } from '../seo/cabecalho.js';

let coleta = null;
export const iniciarColetaSeo = () => {
  coleta = null;
};
export const lerColetaSeo = () => coleta;

function meta(attr, nome, valor) {
  let el = document.head.querySelector(`meta[${attr}="${nome}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, nome);
    document.head.appendChild(el);
  }
  el.setAttribute('content', valor);
}

function aplicar(seo) {
  document.title = seo.titulo;
  meta('name', 'description', seo.descricao);
  meta('name', 'robots', seo.robots);
  meta('property', 'og:title', seo.titulo);
  meta('property', 'og:description', seo.descricao);
  meta('property', 'og:image', seo.imagem);
  meta('property', 'og:image:alt', seo.imagemAlt);
  meta('name', 'twitter:title', seo.titulo);
  meta('name', 'twitter:description', seo.descricao);
  meta('name', 'twitter:image', seo.imagem);
  meta('name', 'twitter:image:alt', seo.imagemAlt);

  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (seo.url) {
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = seo.url;
    meta('property', 'og:url', seo.url);
  } else {
    canonical?.remove();
    document.head.querySelector('meta[property="og:url"]')?.remove();
  }

  let ld = document.getElementById('dados-estruturados');
  if (!ld) {
    ld = document.createElement('script');
    ld.type = 'application/ld+json';
    ld.id = 'dados-estruturados';
    document.head.appendChild(ld);
  }
  ld.textContent = JSON.stringify(seo.jsonLd);
}

export function useSeo(opcoes) {
  const { dados } = useSite();
  const seo = calcularSeo(opcoes, dados);
  if (typeof document === 'undefined') coleta = seo;
  const serializado = JSON.stringify(seo);
  useEffect(() => aplicar(JSON.parse(serializado)), [serializado]);
}

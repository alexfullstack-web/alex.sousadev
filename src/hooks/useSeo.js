// Título, descrição, canonical e Open Graph por página (SPA).
import { useEffect } from 'react';
import { SITE_URL } from '../config.js';

function meta(attr, nome, valor) {
  let el = document.head.querySelector(`meta[${attr}="${nome}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, nome);
    document.head.appendChild(el);
  }
  el.setAttribute('content', valor);
}

export function useSeo({ titulo, descricao, caminho = '/', imagem, noindex = false }) {
  useEffect(() => {
    const t = titulo ? `${titulo} | Alex Sousa Tech` : 'Alex Sousa Tech — Sites, sistemas web e aplicações';
    document.title = t;
    const url = `${SITE_URL}${caminho}`;
    if (descricao) {
      meta('name', 'description', descricao);
      meta('property', 'og:description', descricao);
    }
    meta('property', 'og:title', t);
    meta('property', 'og:url', url);
    meta('property', 'og:image', imagem || `${SITE_URL}/img/og-image.jpg`);
    meta('name', 'twitter:image', imagem || `${SITE_URL}/img/og-image.jpg`);
    meta('name', 'robots', noindex ? 'noindex' : 'index, follow');
    let link = document.head.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = url;
  }, [titulo, descricao, caminho, imagem, noindex]);
}

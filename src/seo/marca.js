// Identidade oficial usada em títulos, metatags e dados estruturados.
// Só entram aqui fatos confirmados pelo dono da marca: nada de endereço, telefone ou resultados.
import { SITE_URL } from '../config.js';

export const MARCA = 'Alex Sousa Tech';
export const FUNDADOR = 'Alex Sousa';
export const PROFISSAO = 'Desenvolvedor Full Stack';
export const SLOGAN = 'Desenvolvimento • Tecnologia • Inovação';

export const TITULO_PADRAO = 'Alex Sousa Tech | Desenvolvedor Full Stack, Sites e Sistemas';
export const DESCRICAO_PADRAO =
  'Alex Sousa Tech é a marca do desenvolvedor Full Stack Alex Sousa: criação de sites, desenvolvimento de sistemas web, SaaS, aplicativos e automação com IA.';

export const IMAGEM_SOCIAL = `${SITE_URL}/img/og-image.jpg`;
export const LOGO = { url: `${SITE_URL}/img/logo.png`, largura: 1000, altura: 1000 };
export const FOTO_FUNDADOR = `${SITE_URL}/img/site/alex.webp`;

export const CAMINHO_SOBRE = '/sobre-alex-sousa';

// Google corta descrições longas: limita em ~155 caracteres sem partir palavras.
export function resumirDescricao(texto, limite = 155) {
  const limpo = String(texto || '').replace(/\s+/g, ' ').trim();
  if (limpo.length <= limite) return limpo;
  const corte = limpo.slice(0, limite - 1);
  return `${corte.slice(0, corte.lastIndexOf(' ')).replace(/[\s,;:.–—-]+$/, '')}…`;
}

// Capas vindas da API podem ser absolutas ou relativas ao site.
export function urlAbsoluta(caminho) {
  if (!caminho) return '';
  if (/^https?:\/\//i.test(caminho)) return caminho;
  return `${SITE_URL}/${String(caminho).replace(/^\/+/, '')}`;
}

// Redes sociais = somente as cadastradas no Business OS (Configurações do site). Nada fixo no código.
export function redesOficiais(dados) {
  const c = dados?.conteudo?.contato || {};
  return [c.github, c.linkedin, c.instagram, c.youtube].filter((u) => typeof u === 'string' && /^https:\/\//i.test(u));
}

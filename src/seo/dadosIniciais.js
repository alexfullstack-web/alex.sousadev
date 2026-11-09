// Dados que a pré-renderização grava no HTML, para o React assumir a página sem piscar.
// No servidor, o script de build define um conjunto por página (uma renderização por vez).
let noServidor = null;

export function definirDadosIniciais(dados) {
  noServidor = dados;
}

const atuais = () => (typeof window === 'undefined' ? noServidor : window.__DADOS_INICIAIS__) || {};

export const dadoInicial = (chave) => atuais()[chave] ?? null;

// true no build e nas páginas pré-renderizadas; false na casca usada por projetos novos.
export const foiPreRenderizado = () => typeof window === 'undefined' || Boolean(window.__DADOS_INICIAIS__);

export const projetoInicial = (slug) => (dadoInicial('projetoSlug') === slug ? dadoInicial('projeto') : null);

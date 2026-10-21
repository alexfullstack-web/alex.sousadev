/* Ligação com o backend do Sistema de Gestão (Alex Sousa Tech).
   Só usa as rotas PÚBLICAS (/public/...): projetos publicados, dados do site e pedidos de orçamento.
   Nada da área administrativa é acessível daqui. Sem backend configurado, o site usa o conteúdo de data/site.js. */
const BASE = (import.meta.env.VITE_API_URL || '/api/v1').replace(/\/+$/, '');
const ORIGEM = /^https?:\/\//.test(BASE) ? new URL(BASE).origin : '';

async function pedir(caminho, opcoes = {}, tempo = 8000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), tempo);
  try {
    const r = await fetch(`${BASE}${caminho}`, { ...opcoes, signal: ctrl.signal, headers: { Accept: 'application/json', ...(opcoes.body ? { 'Content-Type': 'application/json' } : {}) } });
    const corpo = await r.json().catch(() => null);
    if (!r.ok) {
      const e = new Error(corpo?.erro || 'Não foi possível concluir agora. Tente de novo em instantes.');
      e.status = r.status;
      e.campos = corpo?.campos || {};
      throw e;
    }
    return corpo;
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('O servidor demorou a responder. Tente de novo.');
    if (e instanceof TypeError) throw new Error('Sem conexão com o servidor agora.');
    throw e;
  } finally {
    clearTimeout(t);
  }
}

export const buscarSite = () => pedir('/public/site');
export const buscarProjetos = () => pedir('/public/portfolio');
export const enviarPedido = (dados) => pedir('/public/inquiries', { method: 'POST', body: JSON.stringify(dados) }, 15000);
/** As imagens publicadas vêm como "/api/v1/public/files/..." — com o backend em outro domínio, prefixa a origem. */
export const urlArquivo = (url) => (!url ? null : /^https?:\/\//.test(url) ? url : `${ORIGEM}${url}`);

// Ligação do navegador com o Alex Sousa Tech Gestão.
//  - Planos e plataformas: catálogo público da área do cliente (/customer/catalog), cadastrado no painel.
//  - Orçamento: enviado direto à rota pública /public/service-requests do Gestão (sem login, com anti-spam).
import { GESTAO_API_URL } from '../config.js';

async function pedir(url, opcoes = {}, tempo = 15000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), tempo);
  try {
    const r = await fetch(url, {
      ...opcoes,
      signal: ctrl.signal,
      headers: { Accept: 'application/json', ...(opcoes.body ? { 'Content-Type': 'application/json' } : {}) },
    });
    const corpo = await r.json().catch(() => null);
    if (!r.ok) {
      const e = new Error(corpo?.error?.message || corpo?.erro || 'Não foi possível concluir agora. Tente de novo em instantes.');
      e.status = r.status;
      e.codigo = corpo?.error?.code;
      e.campos = Object.fromEntries((corpo?.error?.details || []).filter((d) => d.field).map((d) => [d.field, d.message]));
      throw e;
    }
    return corpo;
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('O servidor demorou a responder. Tente de novo.');
    if (e instanceof TypeError) throw new Error('Sem conexão com o servidor agora. Confira a internet e tente de novo.');
    throw e;
  } finally {
    clearTimeout(t);
  }
}

// Só planos ativos e públicos, com plataformas ativas (o Gestão filtra). Tempo maior: o Render pode estar "acordando".
export const listarPlanos = () => pedir(`${GESTAO_API_URL}/customer/catalog`, {}, 60000);
// O Render gratuito pode estar "acordando": o envio tem tempo maior.
export const enviarPedido = (dados) => pedir(`${GESTAO_API_URL}/public/service-requests`, { method: 'POST', body: JSON.stringify(dados) }, 60000);

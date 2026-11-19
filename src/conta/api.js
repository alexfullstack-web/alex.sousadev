// Chamadas da área do cliente à API do Gestão (/api/v1/customer).
// O token de acesso fica só em memória; a sessão é renovada pelo cookie HttpOnly da API.
import { GESTAO_API_URL } from '../config.js';

const BASE = `${GESTAO_API_URL}/customer`;
let token = null;
let renovando = null;

export const temToken = () => Boolean(token);
export const limparToken = () => {
  token = null;
};

async function chamar(caminho, { metodo = 'GET', corpo, autenticado = false, tempo = 60000 } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), tempo);
  try {
    const r = await fetch(`${BASE}${caminho}`, {
      method: metodo,
      credentials: 'include',
      signal: ctrl.signal,
      headers: {
        Accept: 'application/json',
        ...(corpo ? { 'Content-Type': 'application/json' } : {}),
        ...(autenticado && token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: corpo ? JSON.stringify(corpo) : undefined,
    });
    if (r.status === 204) return null;
    const dados = await r.json().catch(() => null);
    if (!r.ok) {
      const e = new Error(dados?.error?.message || 'Não foi possível concluir agora. Tente de novo em instantes.');
      e.status = r.status;
      e.codigo = dados?.error?.code;
      e.campos = Object.fromEntries((dados?.error?.details || []).filter((d) => d.field).map((d) => [d.field, d.message]));
      throw e;
    }
    return dados;
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('O servidor demorou a responder. Tente de novo.');
    if (e instanceof TypeError) throw new Error('Sem conexão com o servidor agora. Confira a internet e tente de novo.');
    throw e;
  } finally {
    clearTimeout(t);
  }
}

// Uma renovação por vez (várias abas/pedidos ao mesmo tempo usam a mesma).
export function renovar() {
  renovando ??= chamar('/auth/refresh', { metodo: 'POST' })
    .then((r) => {
      token = r.accessToken;
      return r;
    })
    .finally(() => {
      renovando = null;
    });
  return renovando;
}

// Chamada autenticada: se o token venceu, renova uma vez e repete.
async function autenticada(caminho, opcoes = {}) {
  if (!token) await renovar();
  try {
    return await chamar(caminho, { ...opcoes, autenticado: true });
  } catch (e) {
    if (e.status === 401 && ['TOKEN_EXPIRED', 'TOKEN_INVALID'].includes(e.codigo)) {
      await renovar();
      return chamar(caminho, { ...opcoes, autenticado: true });
    }
    throw e;
  }
}

export async function cadastrar(dados) {
  const r = await chamar('/auth/register', { metodo: 'POST', corpo: dados });
  token = r.accessToken;
  return r.customer;
}
export async function entrar(dados) {
  const r = await chamar('/auth/login', { metodo: 'POST', corpo: dados });
  token = r.accessToken;
  return r.customer;
}
export async function sair() {
  try {
    await chamar('/auth/logout', { metodo: 'POST' });
  } finally {
    token = null;
  }
}
export const pedirRedefinicao = (email) => chamar('/auth/forgot-password', { metodo: 'POST', corpo: { email } });
export const redefinirSenha = (dados) => chamar('/auth/reset-password', { metodo: 'POST', corpo: dados });
export const meusDados = () => autenticada('/me').then((r) => r.customer);
export const atualizarDados = (dados) => autenticada('/me', { metodo: 'PUT', corpo: dados }).then((r) => r.customer);
export const trocarSenha = (dados) => autenticada('/me/password', { metodo: 'PUT', corpo: dados });

// Planos, assinaturas e plataformas (o servidor só devolve o que é do próprio cliente).
export const catalogo = () => chamar('/catalog');
export const minhasAssinaturas = () => autenticada('/subscriptions').then((r) => r.data);
export const contratar = (planId) => autenticada('/subscriptions', { metodo: 'POST', corpo: { planId } });
export const cancelarAssinatura = (id) => autenticada(`/subscriptions/${id}/cancel`, { metodo: 'POST' });
export const manterAssinatura = (id) => autenticada(`/subscriptions/${id}/resume`, { metodo: 'POST' });
export const minhasPlataformas = () => autenticada('/platforms').then((r) => r.data);

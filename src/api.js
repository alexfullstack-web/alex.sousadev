// Cliente da API pública do Business OS. Só rotas públicas: o site não tem login nem segredos.
import axios from 'axios';
import { API_URL, EMPRESA } from './config.js';

export const api = axios.create({ baseURL: API_URL, timeout: 15000 });

const base = `/site/publico/${encodeURIComponent(EMPRESA)}`;
const dados = (r) => r.data;

export const site = {
  inicio: () => api.get(base).then(dados),
  projetos: (params) => api.get(`${base}/projetos`, { params }).then(dados),
  projeto: (slug) => api.get(`${base}/projetos/${encodeURIComponent(slug)}`).then(dados),
  enviarOrcamento: (corpo) => api.post(`${base}/orcamentos`, corpo).then(dados),
  statusOrcamento: (token) => api.get(`${base}/orcamentos/status`, { headers: { 'X-Orcamento-Token': token } }).then(dados),
};

// João Pedro IA = Central de Atendimento do Business OS (origem PORTFOLIO).
const atd = '/atendimento/publico';
const comToken = (token) => ({ headers: { 'X-Atendimento-Token': token } });
export const chat = {
  iniciar: (extra) => api.post(`${atd}/conversas`, { empresa: EMPRESA, origem: 'PORTFOLIO', ...extra }).then(dados),
  ver: (token) => api.get(`${atd}/conversa`, comToken(token)).then(dados),
  enviar: (token, texto) => api.post(`${atd}/conversa/mensagens`, { texto }, comToken(token)).then(dados),
  pedirEquipe: (token, corpo) => api.post(`${atd}/conversa/atendimento`, corpo, comToken(token)).then(dados),
};

// Mensagem de erro em linguagem de gente (a API já responde em português).
export function mensagemDeErro(e, padrao = 'Não foi possível concluir agora. Tente novamente.') {
  if (!e?.response) return 'Sem conexão com o servidor. Confira a internet e tente de novo.';
  if (e.response.status === 429) return e.response.data?.error || 'Muitas tentativas seguidas. Aguarde alguns minutos.';
  return e.response.data?.error || padrao;
}

// Armazenamento local opcional (navegação privada pode bloquear): nunca quebra o site.
export const local = {
  ler(chave, padrao = null) {
    try {
      const v = localStorage.getItem(chave);
      return v ? JSON.parse(v) : padrao;
    } catch {
      return padrao;
    }
  },
  salvar(chave, valor) {
    try {
      localStorage.setItem(chave, JSON.stringify(valor));
    } catch {
      /* sem armazenamento: segue sem lembrar */
    }
  },
  apagar(chave) {
    try {
      localStorage.removeItem(chave);
    } catch {
      /* */
    }
  },
};

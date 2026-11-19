// Endereço da API do Alex Sousa Tech Gestão para as funções do servidor (diagnóstico em /api/status).
// O site não usa mais chave do Gestão: a vitrine pública de projetos foi removida, e os planos vêm da
// rota pública /customer/catalog direto do navegador. (Arquivos com "_" na pasta api não viram rota.)

// Aceita o endereço com ou sem "/api/v1", com aspas ou barra no fim (erros comuns ao colar na Vercel).
export function normalizarApi(valor) {
  let api = String(valor || '').trim().replace(/^["']|["']$/g, '').replace(/\/+$/, '');
  if (!api) return '';
  if (!/^https?:\/\//i.test(api)) api = `https://${api}`;
  if (/\/api$/i.test(api)) api += '/v1';
  else if (!/\/api\/v1$/i.test(api)) api += '/api/v1';
  return api;
}

export function lerConfig(env = process.env) {
  const api = normalizarApi(env.GESTAO_API_URL || env.VITE_GESTAO_API_URL);
  const avisos = api ? [] : ['GESTAO_API_URL não definida.'];
  return { api, configurado: Boolean(api), avisos };
}

// Motivos de falha do diagnóstico (nunca incluem dados sensíveis).
export const MOTIVOS = {
  ENDERECO_INVALIDO: 'Endereço do Gestão errado. GESTAO_API_URL deve terminar em /api/v1.',
  SEM_CONEXAO: 'Não foi possível conectar ao Gestão (endereço inexistente ou API fora do ar).',
  TEMPO_ESGOTADO: 'O Gestão demorou demais para responder (a API do Render pode estar acordando).',
};

export function classificar(e) {
  if (e.motivo) return e;
  const comMotivo = (motivo) => Object.assign(new Error(`${motivo}: ${e.message}`), { motivo });
  if (e.name === 'TimeoutError' || e.name === 'AbortError') return comMotivo('TEMPO_ESGOTADO');
  const codigo = e.cause?.code || e.code || '';
  if (['ENOTFOUND', 'EAI_AGAIN', 'ERR_INVALID_URL'].includes(codigo) || (e instanceof TypeError && /Invalid URL/i.test(e.message))) return comMotivo('ENDERECO_INVALIDO');
  return comMotivo('SEM_CONEXAO');
}

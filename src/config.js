// Configuração pública do site (variáveis VITE_*: vão para o navegador, nada secreto aqui).
// A chave da API do Gestão (GESTAO_SITE_KEY) é usada SÓ no servidor: pasta api/ e build.

// API do Alex Sousa Tech Gestão, terminando em /api/v1 (o formulário de orçamento envia para lá).
// Aceita com ou sem "/api/v1" e com barra no fim (o mesmo ajuste feito no servidor).
function normalizarApi(valor) {
  let api = String(valor || '').trim().replace(/^["']|["']$/g, '').replace(/\/+$/, '');
  if (!/^https?:\/\//i.test(api)) api = `https://${api}`;
  if (/\/api$/i.test(api)) api += '/v1';
  else if (!/\/api\/v1$/i.test(api)) api += '/api/v1';
  return api;
}
export const GESTAO_API_URL = normalizarApi(import.meta.env.VITE_GESTAO_API_URL || 'http://localhost:3333/api/v1');

// Domínio oficial, fixo de propósito: canonical e sitemap não podem variar conforme o ambiente.
export const SITE_URL = 'https://site.alexsousatech.com.br';

export const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '';

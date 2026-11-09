// Configuração pública do site (variáveis VITE_*; nada secreto aqui).
export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/+$/, '');
export const EMPRESA = import.meta.env.VITE_EMPRESA || 'alex-sousa-tech';
// Domínio oficial, fixo de propósito: canonical e sitemap não podem variar conforme o ambiente.
export const SITE_URL = 'https://portfolio.alexsousatech.com.br';
export const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '';

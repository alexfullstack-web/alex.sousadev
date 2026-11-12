// Configuração pública do site (variáveis VITE_*: vão para o navegador, nada secreto aqui).
// A chave da API do Gestão (GESTAO_SITE_KEY) é usada SÓ no servidor: pasta api/ e build.

// API do Alex Sousa Tech Gestão, terminando em /api/v1 (o formulário de orçamento envia para lá).
export const GESTAO_API_URL = (import.meta.env.VITE_GESTAO_API_URL || 'http://localhost:3333/api/v1').replace(/\/+$/, '');

// Domínio oficial, fixo de propósito: canonical e sitemap não podem variar conforme o ambiente.
<<<<<<< HEAD
export const SITE_URL = 'https://site.alexsousatech.com.br';
=======
export const SITE_URL = 'https://portfolio.alexsousatech.com.br';
>>>>>>> 38af9dfaef26d34258c85a4b6cc54b504c2bca58

export const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '';

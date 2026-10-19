// Configuração pública do site (variáveis VITE_*; nada secreto aqui).
export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3333/api').replace(/\/+$/, '');
export const EMPRESA = import.meta.env.VITE_EMPRESA || 'alex-sousa-tech';
export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://alex-sousadev.vercel.app').replace(/\/+$/, '');
export const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '';

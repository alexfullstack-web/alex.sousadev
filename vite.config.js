import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// base "/" (e não "./"): as rotas do site (/projetos/:slug) precisam de caminhos absolutos.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  // index.html usa %VITE_SITE_URL% (canonical e Open Graph); sem variável, o domínio atual.
  if (!env.VITE_SITE_URL) process.env.VITE_SITE_URL = 'https://alex-sousadev.vercel.app';
  return {
    plugins: [react()],
    base: '/',
    build: { target: 'es2020' },
  };
});

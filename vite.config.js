import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base "/" (e não "./"): as rotas do site (/projetos/:slug) precisam de caminhos absolutos.
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: { target: 'es2020' },
});

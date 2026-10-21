import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // em desenvolvimento, /api é repassado para o backend do Sistema de Gestão (padrão: localhost:3333)
  const alvo = loadEnv(mode, process.cwd(), '').API_PROXY_TARGET || 'http://localhost:3333';
  const proxy = { '/api': { target: alvo, changeOrigin: true } };
  return {
    plugins: [react()],
    base: './',
    server: { proxy },
    preview: { proxy },
    build: {
      target: 'es2020',
      chunkSizeWarningLimit: 1000,
    },
  };
});

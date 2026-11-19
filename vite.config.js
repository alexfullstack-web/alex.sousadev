import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import status from './api/status.js';

// Em desenvolvimento (npm run dev) e no preview local, a função /api/status roda como na Vercel
// (mesmo código), para diagnosticar a ligação com o Gestão.
function apiLocal(env) {
  for (const k of ['GESTAO_API_URL', 'VITE_GESTAO_API_URL']) {
    if (env[k] !== undefined && process.env[k] === undefined) process.env[k] = env[k];
  }
  // Adapta a resposta do Node ao formato das funções da Vercel (status().json()).
  const adaptar = (res) => {
    res.status = (c) => {
      res.statusCode = c;
      return res;
    };
    res.json = (corpo) => {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify(corpo));
    };
    return res;
  };
  const middleware = async (req, res, next) => {
    try {
      if (req.url.split('?')[0] === '/api/status') return await status(req, adaptar(res));
      return next();
    } catch (e) {
      return next(e);
    }
  };
  return {
    name: 'api-local',
    // Sem "return": um valor devolvido aqui seria tratado pelo Vite como gancho posterior.
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}

// base "/" (e não "./"): as rotas do site (/conta/...) precisam de caminhos absolutos.
export default defineConfig(({ mode }) => {
  const env = { ...process.env, ...loadEnv(mode, process.cwd(), '') };
  return {
    plugins: [react(), apiLocal(env)],
    base: '/',
    build: { target: 'es2020' },
  };
});

import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import portfolioLista from './api/portfolio/index.js';
import portfolioProjeto from './api/portfolio/[slug].js';
import status from './api/status.js';

// Em desenvolvimento (npm run dev) e no preview local, as funções da pasta api/ rodam como na
// Vercel (mesmo código): /api/portfolio, /api/portfolio/:slug e /api/status.
// A chave do Gestão (GESTAO_SITE_KEY, sem prefixo VITE_) fica só no servidor do Vite.
function apiPortfolio(env) {
  for (const k of ['GESTAO_API_URL', 'GESTAO_SITE_KEY', 'VITE_GESTAO_API_URL', 'VITE_GESTAO_SITE_KEY']) {
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
    const caminho = req.url.split('?')[0];
    const m = caminho.match(/^\/api\/portfolio(?:\/([^/]+))?\/?$/);
    try {
      if (caminho === '/api/status') return await status(req, adaptar(res));
      if (!m) return next();
      if (!m[1]) return await portfolioLista(req, adaptar(res));
      req.query = { slug: decodeURIComponent(m[1]) };
      return await portfolioProjeto(req, adaptar(res));
    } catch (e) {
      return next(e);
    }
  };
  return {
    name: 'api-portfolio-local',
    // Sem "return": um valor devolvido aqui seria tratado pelo Vite como gancho posterior.
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
      // Igual à Vercel (vercel.json): projeto publicado depois do build usa a casca sem conteúdo.
      server.middlewares.use((req, _res, next) => {
        const m = req.url.split('?')[0].match(/^\/projetos\/([a-z0-9-]+)\/?$/);
        if (m && !existsSync(resolve('dist/projetos', `${m[1]}.html`))) req.url = '/app-shell.html';
        next();
      });
    },
  };
}

// base "/" (e não "./"): as rotas do site (/projetos/:slug) precisam de caminhos absolutos.
export default defineConfig(({ mode }) => {
  const env = { ...process.env, ...loadEnv(mode, process.cwd(), '') };
  return {
    plugins: [react(), apiPortfolio(env)],
    base: '/',
    build: { target: 'es2020' },
  };
});

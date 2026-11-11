import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { buscarPortfolio, buscarProjeto, lerConfig } from './api/_gestao.js';

// Em desenvolvimento (npm run dev) e no preview local, /api/portfolio funciona como na Vercel:
// a chave do Gestão (GESTAO_SITE_KEY, sem prefixo VITE_) fica no servidor do Vite.
function apiPortfolio(env) {
  const config = lerConfig(env);
  const responder = (res, status, corpo) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(corpo));
  };
  const middleware = async (req, res, next) => {
    const m = req.url.split('?')[0].match(/^\/api\/portfolio(?:\/([^/]+))?\/?$/);
    if (!m) return next();
    if (!config.configurado) return responder(res, 503, { erro: 'Integração com o Gestão não configurada (GESTAO_API_URL e GESTAO_SITE_KEY no .env).' });
    try {
      if (!m[1]) return responder(res, 200, await buscarPortfolio(config));
      const projeto = await buscarProjeto(decodeURIComponent(m[1]), config);
      return projeto ? responder(res, 200, { projeto }) : responder(res, 404, { erro: 'Projeto não encontrado.' });
    } catch {
      return responder(res, 502, { erro: 'Não foi possível carregar os projetos agora.' });
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

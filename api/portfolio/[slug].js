// GET /api/portfolio/:slug — um projeto publicado no Gestão.
<<<<<<< HEAD
import { buscarProjeto, lerConfig, responderFalha } from '../_gestao.js';
=======
import { buscarProjeto, lerConfig } from '../_gestao.js';
>>>>>>> 38af9dfaef26d34258c85a4b6cc54b504c2bca58

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ erro: 'Método não permitido.' });
  const config = lerConfig();
  res.setHeader('X-Robots-Tag', 'noindex');
  if (!config.configurado) {
    res.setHeader('Cache-Control', 'no-store');
<<<<<<< HEAD
    console.error('[gestao] NAO_CONFIGURADO — defina GESTAO_API_URL e GESTAO_SITE_KEY na Vercel e faça um novo deploy.');
    return res.status(503).json({ erro: 'Integração com o Gestão não configurada.', motivo: 'NAO_CONFIGURADO' });
  }
  try {
    const projeto = await buscarProjeto(String(req.query.slug || ''), config, { tentativas: 2, tempo: 25000 });
=======
    return res.status(503).json({ erro: 'Integração com o Gestão não configurada.' });
  }
  try {
    const projeto = await buscarProjeto(String(req.query.slug || ''), config, { tempo: 9000 });
>>>>>>> 38af9dfaef26d34258c85a4b6cc54b504c2bca58
    if (!projeto) {
      res.setHeader('Cache-Control', 'public, s-maxage=60');
      return res.status(404).json({ erro: 'Projeto não encontrado.' });
    }
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400');
    return res.status(200).json({ projeto });
<<<<<<< HEAD
  } catch (e) {
    return responderFalha(res, e, 'Não foi possível carregar o projeto agora.');
=======
  } catch {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).json({ erro: 'Não foi possível carregar o projeto agora.' });
>>>>>>> 38af9dfaef26d34258c85a4b6cc54b504c2bca58
  }
}

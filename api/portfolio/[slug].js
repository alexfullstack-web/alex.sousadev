// GET /api/portfolio/:slug — um projeto publicado no Gestão.
import { buscarProjeto, lerConfig, responderFalha } from '../_gestao.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ erro: 'Método não permitido.' });
  const config = lerConfig();
  res.setHeader('X-Robots-Tag', 'noindex');
  if (!config.configurado) {
    res.setHeader('Cache-Control', 'no-store');
    console.error('[gestao] NAO_CONFIGURADO — defina GESTAO_API_URL e GESTAO_SITE_KEY na Vercel e faça um novo deploy.');
    return res.status(503).json({ erro: 'Integração com o Gestão não configurada.', motivo: 'NAO_CONFIGURADO' });
  }
  try {
    const projeto = await buscarProjeto(String(req.query.slug || ''), config, { tentativas: 2, tempo: 25000 });
    if (!projeto) {
      res.setHeader('Cache-Control', 'public, s-maxage=60');
      return res.status(404).json({ erro: 'Projeto não encontrado.' });
    }
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400');
    return res.status(200).json({ projeto });
  } catch (e) {
    return responderFalha(res, e, 'Não foi possível carregar o projeto agora.');
  }
}

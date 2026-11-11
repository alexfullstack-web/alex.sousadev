// GET /api/portfolio/:slug — um projeto publicado no Gestão.
import { buscarProjeto, lerConfig } from '../_gestao.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ erro: 'Método não permitido.' });
  const config = lerConfig();
  res.setHeader('X-Robots-Tag', 'noindex');
  if (!config.configurado) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(503).json({ erro: 'Integração com o Gestão não configurada.' });
  }
  try {
    const projeto = await buscarProjeto(String(req.query.slug || ''), config, { tempo: 9000 });
    if (!projeto) {
      res.setHeader('Cache-Control', 'public, s-maxage=60');
      return res.status(404).json({ erro: 'Projeto não encontrado.' });
    }
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400');
    return res.status(200).json({ projeto });
  } catch {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).json({ erro: 'Não foi possível carregar o projeto agora.' });
  }
}

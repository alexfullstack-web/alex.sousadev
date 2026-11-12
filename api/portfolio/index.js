// GET /api/portfolio — projetos publicados no Gestão, para o navegador.
// A chave do Gestão fica aqui no servidor; a CDN da Vercel guarda a resposta por alguns minutos
// e continua entregando a última versão se a API do Gestão estiver dormindo.
<<<<<<< HEAD
import { buscarPortfolio, lerConfig, responderFalha } from '../_gestao.js';
=======
import { buscarPortfolio, lerConfig } from '../_gestao.js';
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
    const dados = await buscarPortfolio(config, { tentativas: 2, tempo: 25000 });
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400');
    return res.status(200).json(dados);
  } catch (e) {
    return responderFalha(res, e, 'Não foi possível carregar os projetos agora.');
=======
    return res.status(503).json({ erro: 'Integração com o Gestão não configurada.' });
  }
  try {
    const dados = await buscarPortfolio(config, { tempo: 9000 });
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400');
    return res.status(200).json(dados);
  } catch {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).json({ erro: 'Não foi possível carregar os projetos agora.' });
>>>>>>> 38af9dfaef26d34258c85a4b6cc54b504c2bca58
  }
}

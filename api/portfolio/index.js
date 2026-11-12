// GET /api/portfolio — projetos publicados no Gestão, para o navegador.
// A chave do Gestão fica aqui no servidor; a CDN da Vercel guarda a resposta por alguns minutos
// e continua entregando a última versão se a API do Gestão estiver dormindo.
import { buscarPortfolio, lerConfig, responderFalha } from '../_gestao.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ erro: 'Método não permitido.' });
  const config = lerConfig();
  res.setHeader('X-Robots-Tag', 'noindex');
  if (!config.configurado) {
    res.setHeader('Cache-Control', 'no-store');
    console.error(`[gestao] NAO_CONFIGURADO — ${config.avisos.join(' ') || 'defina GESTAO_API_URL e GESTAO_SITE_KEY na Vercel'} Depois, faça um novo deploy.`);
    return res.status(503).json({ erro: 'Integração com o Gestão não configurada.', motivo: 'NAO_CONFIGURADO', ajuda: config.avisos.join(' ') || 'Defina GESTAO_API_URL e GESTAO_SITE_KEY na Vercel e faça um novo deploy.' });
  }
  try {
    const dados = await buscarPortfolio(config, { tentativas: 2, tempo: 25000 });
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400');
    return res.status(200).json(dados);
  } catch (e) {
    return responderFalha(res, e, 'Não foi possível carregar os projetos agora.');
  }
}

// GET /api/portfolio — projetos publicados no Gestão, para o navegador.
// A chave do Gestão fica aqui no servidor; a CDN da Vercel guarda a resposta por alguns minutos
// e continua entregando a última versão se a API do Gestão estiver dormindo.
import { buscarPortfolio, lerConfig } from '../_gestao.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ erro: 'Método não permitido.' });
  const config = lerConfig();
  res.setHeader('X-Robots-Tag', 'noindex');
  if (!config.configurado) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(503).json({ erro: 'Integração com o Gestão não configurada.' });
  }
  try {
    const dados = await buscarPortfolio(config, { tempo: 9000 });
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400');
    return res.status(200).json(dados);
  } catch {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).json({ erro: 'Não foi possível carregar os projetos agora.' });
  }
}

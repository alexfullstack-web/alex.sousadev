// Leitura do portfólio no Alex Sousa Tech Gestão pela API AUTENTICADA (contrato v1,
// docs/INTEGRACAO-SITE.md no projeto do Gestão). Roda SÓ no servidor: funções da Vercel,
// pré-renderização no build e servidor de desenvolvimento. A chave nunca vai para o navegador.
// (Arquivos com "_" na pasta api não viram rota.)

export function lerConfig(env = process.env) {
  const api = String(env.GESTAO_API_URL || env.VITE_GESTAO_API_URL || '').replace(/\/+$/, '');
  const chave = String(env.GESTAO_SITE_KEY || '').trim();
  return { api, chave, configurado: Boolean(api && chave) };
}

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const texto = (v, max) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null);
const url = (v, protocolos = ['https:', 'http:']) => {
  if (typeof v !== 'string') return null;
  try {
    const u = new URL(v);
    return protocolos.includes(u.protocol) ? u.href : null;
  } catch {
    return null;
  }
};
const imagem = (i, padrao) => {
  const endereco = url(i?.url);
  if (!endereco) return null;
  return { url: endereco, alt: texto(i.alt, 200) || padrao, largura: Number(i.width) || null, altura: Number(i.height) || null };
};

// Converte o item do contrato para o formato usado nas páginas (e descarta o que for inválido).
export function normalizar(item) {
  if (!item || !SLUG.test(item.slug || '') || !texto(item.title, 160)) return null;
  const nome = texto(item.title, 160);
  return {
    slug: item.slug,
    nome,
    segmento: texto(item.segment, 100),
    resumo: texto(item.summary, 300) || '',
    descricao: texto(item.description, 8000),
    desafio: texto(item.challenge, 3000),
    solucao: texto(item.solution, 3000),
    tecnologias: Array.isArray(item.technologies) ? item.technologies.map((t) => texto(t, 40)).filter(Boolean).slice(0, 20) : [],
    // Link de demonstração só com https (evita conteúdo misto e esquemas perigosos).
    demo: url(item.demoUrl, ['https:']),
    conclusao: /^\d{4}-\d{2}-\d{2}$/.test(item.completedAt || '') ? item.completedAt : null,
    capa: imagem(item.cover, nome),
    galeria: (Array.isArray(item.gallery) ? item.gallery : []).map((g) => imagem(g, nome)).filter(Boolean).slice(0, 12),
    atualizadoEm: item.updatedAt || null,
  };
}

async function pedir(caminho, { api, chave }, { tentativas = 1, tempo = 15000 } = {}) {
  let ultimoErro;
  for (let i = 1; i <= tentativas; i++) {
    try {
      const r = await fetch(`${api}/integrations/site${caminho}`, {
        headers: { Authorization: `Bearer ${chave}`, Accept: 'application/json' },
        signal: AbortSignal.timeout(tempo),
      });
      if (r.status === 404) return { naoEncontrado: true };
      if (!r.ok) {
        const e = new Error(r.status === 401 ? 'Chave do site recusada pelo Gestão (GESTAO_SITE_KEY).' : `Gestão respondeu HTTP ${r.status}`);
        e.status = r.status;
        throw e;
      }
      return { dados: await r.json() };
    } catch (e) {
      ultimoErro = e;
      // Chave errada não melhora com nova tentativa.
      if (e.status === 401 || i === tentativas) break;
      // O plano gratuito do Render "dorme": a primeira chamada pode levar perto de 1 minuto.
      await new Promise((ok) => setTimeout(ok, 5000));
    }
  }
  throw ultimoErro;
}

export async function buscarPortfolio(config, opcoes) {
  const { dados } = await pedir('/portfolio', config, opcoes);
  const itens = (dados?.items || []).map(normalizar).filter(Boolean);
  return { itens, atualizadoEm: dados?.updatedAt || null };
}

export async function buscarProjeto(slug, config, opcoes) {
  if (!SLUG.test(slug || '')) return null;
  const r = await pedir(`/portfolio/${encodeURIComponent(slug)}`, config, opcoes);
  return r.naoEncontrado ? null : normalizar(r.dados?.item);
}

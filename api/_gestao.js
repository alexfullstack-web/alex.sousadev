// Leitura do portfólio no Alex Sousa Tech Gestão pela API AUTENTICADA (contrato v1,
// docs/INTEGRACAO-SITE.md no projeto do Gestão). Roda SÓ no servidor: funções da Vercel,
// pré-renderização no build e servidor de desenvolvimento. A chave nunca vai para o navegador.
// (Arquivos com "_" na pasta api não viram rota.)

// Aceita o endereço com ou sem "/api/v1", com aspas ou barra no fim (erros comuns ao colar na Vercel).
export function normalizarApi(valor) {
  let api = String(valor || '').trim().replace(/^["']|["']$/g, '').replace(/\/+$/, '');
  if (!api) return '';
  if (!/^https?:\/\//i.test(api)) api = `https://${api}`;
  if (/\/api$/i.test(api)) api += '/v1';
  else if (!/\/api\/v1$/i.test(api)) api += '/api/v1';
  return api;
}

// Aceita a chave colada com aspas, espaços, "Bearer " ou "GESTAO_SITE_KEY=" na frente.
export function limparChave(valor) {
  return String(valor || '')
    .trim()
    .replace(/^GESTAO_SITE_KEY\s*=\s*/i, '')
    .replace(/^["']|["']$/g, '')
    .replace(/^Bearer\s+/i, '')
    .trim();
}

export const FORMATO_CHAVE = /^ast_site_[A-Za-z0-9_-]{30,80}$/;

export function lerConfig(env = process.env) {
  const api = normalizarApi(env.GESTAO_API_URL || env.VITE_GESTAO_API_URL);
  const chave = limparChave(env.GESTAO_SITE_KEY);
  const avisos = [];
  if (!chave && env.VITE_GESTAO_SITE_KEY) {
    avisos.push('A chave está em VITE_GESTAO_SITE_KEY: renomeie para GESTAO_SITE_KEY (sem VITE_, que é público).');
  }
  if (chave && !FORMATO_CHAVE.test(chave)) {
    avisos.push('GESTAO_SITE_KEY não tem o formato de uma chave do Gestão (começa com ast_site_).');
  }
  if (!api) avisos.push('GESTAO_API_URL não definida.');
  return { api, chave, configurado: Boolean(api && chave), avisos };
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

// Motivos de falha, para o log da Vercel e para a resposta (nunca inclui a chave).
export const MOTIVOS = {
  CHAVE_RECUSADA: 'O Gestão recusou a chave. Confira GESTAO_SITE_KEY (gerada no painel de PRODUÇÃO) e faça um novo deploy.',
  ENDERECO_INVALIDO: 'Endereço do Gestão errado. GESTAO_API_URL deve terminar em /api/v1.',
  SEM_CONEXAO: 'Não foi possível conectar ao Gestão (endereço inexistente ou API fora do ar).',
  TEMPO_ESGOTADO: 'O Gestão demorou demais para responder (a API do Render pode estar acordando).',
  ERRO_NO_GESTAO: 'O Gestão respondeu com erro. Veja os logs da API no Render.',
  RESPOSTA_INVALIDA: 'O Gestão respondeu algo fora do contrato v1.',
};

function falha(motivo, detalhe) {
  const e = new Error(`${motivo}: ${detalhe}`);
  e.motivo = motivo;
  return e;
}

function classificar(e) {
  if (e.motivo) return e;
  if (e.name === 'TimeoutError' || e.name === 'AbortError') return falha('TEMPO_ESGOTADO', e.message);
  const codigo = e.cause?.code || e.code || '';
  if (['ENOTFOUND', 'EAI_AGAIN', 'ERR_INVALID_URL'].includes(codigo) || e instanceof TypeError && /Invalid URL/i.test(e.message)) {
    return falha('ENDERECO_INVALIDO', codigo || e.message);
  }
  return falha('SEM_CONEXAO', codigo || e.message);
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
      if (r.status === 401) throw falha('CHAVE_RECUSADA', 'HTTP 401');
      if (!r.ok) throw falha('ERRO_NO_GESTAO', `HTTP ${r.status}`);
      try {
        return { dados: await r.json() };
      } catch {
        throw falha('RESPOSTA_INVALIDA', 'JSON inválido');
      }
    } catch (e) {
      ultimoErro = classificar(e);
      // Chave ou endereço errados não melhoram com nova tentativa.
      if (['CHAVE_RECUSADA', 'ENDERECO_INVALIDO'].includes(ultimoErro.motivo) || i === tentativas) break;
      // O plano gratuito do Render "dorme": a primeira chamada pode levar perto de 1 minuto.
      await new Promise((ok) => setTimeout(ok, 3000));
    }
  }
  throw ultimoErro;
}

export async function buscarPortfolio(config, opcoes) {
  const r = await pedir('/portfolio', config, opcoes);
  // A lista sempre existe no Gestão: 404 aqui é endereço errado (ex.: sem /api/v1).
  if (r.naoEncontrado) throw falha('ENDERECO_INVALIDO', 'HTTP 404 em /integrations/site/portfolio');
  if (!Array.isArray(r.dados?.items)) throw falha('RESPOSTA_INVALIDA', 'sem "items"');
  const itens = r.dados.items.map(normalizar).filter(Boolean);
  return { itens, atualizadoEm: r.dados.updatedAt || null };
}

// Resposta de erro das funções: motivo legível no log e no corpo, sem detalhes sensíveis.
export function responderFalha(res, e, mensagem) {
  const motivo = e?.motivo || 'SEM_CONEXAO';
  console.error(`[gestao] ${motivo} — ${MOTIVOS[motivo] ?? ''} (${e?.message ?? e})`);
  res.setHeader('Cache-Control', 'no-store');
  return res.status(motivo === 'TEMPO_ESGOTADO' ? 504 : 502).json({ erro: mensagem, motivo, ajuda: MOTIVOS[motivo] });
}

export async function buscarProjeto(slug, config, opcoes) {
  if (!SLUG.test(slug || '')) return null;
  const r = await pedir(`/portfolio/${encodeURIComponent(slug)}`, config, opcoes);
  return r.naoEncontrado ? null : normalizar(r.dados?.item);
}

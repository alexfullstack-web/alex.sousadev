// GET /api/status — diagnóstico da ligação do site com o Gestão. Não mostra a chave.
// Abra no navegador: https://site.alexsousatech.com.br/api/status
import { buscarPortfolio, FORMATO_CHAVE, lerConfig, MOTIVOS } from './_gestao.js';

async function tempoDe(fn) {
  const t = Date.now();
  try {
    return { ...(await fn()), ms: Date.now() - t };
  } catch (e) {
    return { ok: false, motivo: e.motivo || 'SEM_CONEXAO', ajuda: MOTIVOS[e.motivo] ?? e.message, ms: Date.now() - t };
  }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex');
  const config = lerConfig();
  const host = req.headers['x-forwarded-host'] || req.headers.host || '';
  const protocolo = req.headers['x-forwarded-proto'] || (/^(localhost|127\.0\.0\.1)(:|$)/.test(host) ? 'http' : 'https');
  const origem = `${protocolo}://${host}`;

  const resultado = {
    gestao: {
      endereco: config.api || null,
      chave: !config.chave ? 'ausente' : FORMATO_CHAVE.test(config.chave) ? 'configurada (formato ok)' : 'formato inválido',
      avisos: config.avisos,
    },
  };

  if (config.api) {
    // 1) API no ar? (o Render gratuito pode levar até 1 minuto para acordar)
    resultado.api = await tempoDe(async () => {
      const r = await fetch(`${config.api}/health`, { signal: AbortSignal.timeout(50000) });
      return { ok: r.ok, http: r.status };
    });
    // 2) Projetos do portfólio com a chave
    resultado.portfolio = config.chave
      ? await tempoDe(async () => ({ ok: true, projetos: (await buscarPortfolio(config, { tempo: 25000 })).itens.length }))
      : { ok: false, motivo: 'NAO_CONFIGURADO', ajuda: 'Defina GESTAO_SITE_KEY na Vercel e faça um novo deploy.' };
    // 3) Formulário de orçamento: o Gestão aceita este domínio? (PUBLIC_FORM_ORIGINS no Render)
    resultado.formulario = await tempoDe(async () => {
      const r = await fetch(`${config.api}/public/service-requests`, {
        method: 'OPTIONS',
        headers: { Origin: origem, 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type' },
        signal: AbortSignal.timeout(25000),
      });
      const aceita = r.headers.get('access-control-allow-origin') === origem;
      return aceita
        ? { ok: true, origem }
        : { ok: false, origem, ajuda: `No Render (API), inclua ${origem} em PUBLIC_FORM_ORIGINS e reinicie a API.` };
    });
  }

  const tudoOk = Boolean(resultado.api?.ok && resultado.portfolio?.ok && resultado.formulario?.ok);
  return res.status(tudoOk ? 200 : 503).json({ ok: tudoOk, ...resultado });
}

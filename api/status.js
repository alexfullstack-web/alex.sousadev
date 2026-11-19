// GET /api/status — diagnóstico da ligação do site com o Gestão. Não mostra a chave.
// Abra no navegador: https://site.alexsousatech.com.br/api/status
import { classificar, lerConfig, MOTIVOS } from './_gestao.js';

async function tempoDe(fn) {
  const t = Date.now();
  try {
    return { ...(await fn()), ms: Date.now() - t };
  } catch (erro) {
    const e = classificar(erro);
    return { ok: false, motivo: e.motivo, ajuda: MOTIVOS[e.motivo] ?? e.message, ms: Date.now() - t };
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
      avisos: config.avisos,
    },
  };

  if (config.api) {
    // 1) API no ar? (o Render gratuito pode levar até 1 minuto para acordar)
    resultado.api = await tempoDe(async () => {
      const r = await fetch(`${config.api}/health`, { signal: AbortSignal.timeout(50000) });
      return { ok: r.ok, http: r.status };
    });
    // 2) Planos da área do cliente: o Gestão aceita este domínio? (CUSTOMER_ORIGINS no Render)
    resultado.planos = await tempoDe(async () => {
      const r = await fetch(`${config.api}/customer/catalog`, { headers: { Origin: origem, Accept: 'application/json' }, signal: AbortSignal.timeout(25000) });
      const aceita = r.headers.get('access-control-allow-origin') === origem;
      if (!r.ok || !aceita) return { ok: false, origem, http: r.status, ajuda: `No Render (API), inclua ${origem} em CUSTOMER_ORIGINS e reinicie a API.` };
      const corpo = await r.json();
      return { ok: true, planos: Array.isArray(corpo?.data) ? corpo.data.length : 0 };
    });
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

  const tudoOk = Boolean(resultado.api?.ok && resultado.planos?.ok && resultado.formulario?.ok);
  return res.status(tudoOk ? 200 : 503).json({ ok: tudoOk, ...resultado });
}

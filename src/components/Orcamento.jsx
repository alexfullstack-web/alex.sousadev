import { useEffect, useRef, useState } from 'react';
import { CONTACT } from '../data/site.js';
import { buscarSite, enviarPedido } from '../lib/api.js';
import { SectionHead, Reveal } from './Sections.jsx';

/* Pedido de orçamento: vai direto para o Sistema de Gestão (vira cliente + oportunidade no CRM, com protocolo).
   Se o sistema estiver fora do ar ou o formulário desativado, o site mostra isso e oferece os contatos diretos. */

const mascaraTelefone = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};
const novaChave = () => (crypto.randomUUID ? crypto.randomUUID() : '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) => (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)));
const VAZIO = { nome: '', empresa: '', email: '', whatsapp: '', servicoId: '', descricao: '', orcamento: '', prazo: '', melhorHorario: '', consentimento: false, site_url: '' };

export default function Orcamento() {
  const [site, setSite] = useState(null); // null = carregando; { ativo:false } ou dados
  const [falhou, setFalhou] = useState(false);
  const [f, setF] = useState(VAZIO);
  const [erros, setErros] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [ok, setOk] = useState(null);
  const chave = useRef(novaChave());

  useEffect(() => {
    buscarSite().then(setSite).catch(() => setFalhou(true));
  }, []);
  const muda = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.type === 'checkbox' ? e.target.checked : k === 'whatsapp' ? mascaraTelefone(e.target.value) : e.target.value }));

  function validar() {
    const e = {};
    if (f.nome.trim().length < 2) e.nome = 'Informe seu nome.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = 'E-mail inválido.';
    if (f.whatsapp && f.whatsapp.replace(/\D/g, '').length < 10) e.whatsapp = 'Use DDD e número.';
    if (f.descricao.trim().length < 20) e.descricao = 'Conte um pouco mais (pelo menos 20 caracteres).';
    if (!f.consentimento) e.consentimento = 'É preciso concordar com o aviso de privacidade.';
    return e;
  }

  async function enviar(ev) {
    ev.preventDefault();
    const e = validar();
    setErros(e);
    if (Object.keys(e).length) return;
    setEnviando(true);
    try {
      const r = await enviarPedido({
        acao: 'SOLICITAR_ORCAMENTO',
        nome: f.nome,
        empresa: f.empresa || null,
        email: f.email,
        whatsapp: f.whatsapp || null,
        servicoId: f.servicoId || null,
        descricao: f.descricao,
        orcamento: f.orcamento || null,
        prazo: f.prazo || null,
        melhorHorario: f.melhorHorario || null,
        consentimento: true,
        versaoAviso: site.avisoPrivacidade.versao,
        chave: chave.current,
        formToken: site.formToken,
        ...(f.site_url ? { site_url: f.site_url } : {}),
      });
      setOk(r);
      setF(VAZIO);
      chave.current = novaChave();
    } catch (err) {
      setErros({ ...err.campos, geral: err.message });
    } finally {
      setEnviando(false);
    }
  }

  const contatos = (
    <p className="orcamento__alternativa">
      Fale direto: <a href={CONTACT.whatsapp} target="_blank" rel="noopener">WhatsApp {CONTACT.whatsappLabel}</a> · <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
    </p>
  );
  const op = site?.opcoes || {};

  return (
    <section className="section orcamento" id="orcamento">
      <SectionHead kicker="// 07 — Orçamento" title="Conte sua ideia" lede="Descreva o que você precisa. O pedido chega organizado no meu sistema e eu respondo pessoalmente." center />
      <Reveal className="orcamento__card">
        {falhou ? (
          <div className="orcamento__aviso">
            <p>O formulário está indisponível agora (o sistema não respondeu).</p>
            {contatos}
          </div>
        ) : !site ? (
          <p className="orcamento__aviso">Carregando formulário...</p>
        ) : !site.ativo ? (
          <div className="orcamento__aviso">
            <p>O formulário de orçamento está desativado no momento.</p>
            {contatos}
          </div>
        ) : ok ? (
          <div className="orcamento__aviso orcamento__ok" role="status">
            <p>
              Pedido recebido! Protocolo <strong>{ok.protocolo}</strong>.
            </p>
            <p>Vou responder pelo contato informado. Guarde o protocolo se precisar falar sobre este pedido.</p>
            <button type="button" className="ast-btn ast-btn--ghost" onClick={() => setOk(null)}>
              Enviar outro pedido
            </button>
          </div>
        ) : (
          <form className="orcamento__form" onSubmit={enviar} noValidate>
            <label>
              Nome *<input value={f.nome} onChange={muda('nome')} maxLength={120} autoComplete="name" aria-invalid={Boolean(erros.nome)} />
              {erros.nome && <small>{erros.nome}</small>}
            </label>
            <label>
              Empresa<input value={f.empresa} onChange={muda('empresa')} maxLength={160} autoComplete="organization" />
            </label>
            <label>
              E-mail *<input type="email" value={f.email} onChange={muda('email')} maxLength={254} autoComplete="email" aria-invalid={Boolean(erros.email)} />
              {erros.email && <small>{erros.email}</small>}
            </label>
            <label>
              WhatsApp<input value={f.whatsapp} onChange={muda('whatsapp')} inputMode="tel" placeholder="(00) 00000-0000" autoComplete="tel" aria-invalid={Boolean(erros.whatsapp)} />
              {erros.whatsapp && <small>{erros.whatsapp}</small>}
            </label>
            {site.servicos?.length > 0 && (
              <label>
                Serviço
                <select value={f.servicoId} onChange={muda('servicoId')}>
                  <option value="">Ainda não sei</option>
                  {site.servicos.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nome}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label>
              Investimento previsto
              <select value={f.orcamento} onChange={muda('orcamento')}>
                <option value="">Prefiro não dizer</option>
                {Object.entries(op.orcamentos || {}).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Prazo
              <select value={f.prazo} onChange={muda('prazo')}>
                <option value="">Sem prazo definido</option>
                {Object.entries(op.prazos || {}).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Melhor horário
              <select value={f.melhorHorario} onChange={muda('melhorHorario')}>
                <option value="">Qualquer</option>
                {Object.entries(op.horarios || {}).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
            <label className="orcamento__largo">
              O que você precisa? *<textarea rows={5} value={f.descricao} onChange={muda('descricao')} maxLength={4000} aria-invalid={Boolean(erros.descricao)} />
              {erros.descricao && <small>{erros.descricao}</small>}
            </label>
            {/* armadilha para robôs: invisível para pessoas */}
            <label className="orcamento__isca" aria-hidden="true">
              Site<input tabIndex={-1} autoComplete="off" value={f.site_url} onChange={muda('site_url')} />
            </label>
            <details className="orcamento__largo orcamento__aviso-privacidade">
              <summary>Aviso de privacidade</summary>
              <p>{site.avisoPrivacidade.texto}</p>
            </details>
            <label className="orcamento__largo orcamento__check">
              <input type="checkbox" checked={f.consentimento} onChange={muda('consentimento')} /> Li o aviso de privacidade e concordo com o uso dos meus dados para responder este pedido. *
              {erros.consentimento && <small>{erros.consentimento}</small>}
            </label>
            {erros.geral && (
              <p className="orcamento__erro orcamento__largo" role="alert">
                {erros.geral}
              </p>
            )}
            <div className="orcamento__largo">
              <button type="submit" className="ast-btn ast-btn--primary" disabled={enviando}>
                {enviando ? 'Enviando...' : 'Enviar pedido'}
              </button>
            </div>
          </form>
        )}
      </Reveal>
    </section>
  );
}

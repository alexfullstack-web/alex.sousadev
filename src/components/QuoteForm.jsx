// Formulário de orçamento. Envia para o Atendimento do Alex Sousa Tech Gestão
// (rota pública com anti-spam) e só confirma depois da resposta do servidor.
// Envio repetido (clique duplo, nova tentativa) não duplica o pedido: o Gestão ignora o mesmo
// e-mail com a mesma mensagem por 10 minutos.
import { useCallback, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, CheckCircle2, FolderKanban, Loader2, Mail, MessageCircle, Phone, RotateCcw, Send, ShieldCheck, UserRound } from 'lucide-react';
import Aviso from './ui/Aviso.jsx';
import { OPCOES_ORCAMENTO, linkWhatsapp } from '../data/empresa.js';
import { enviarPedido } from '../lib/gestao.js';
import Turnstile, { precisaTurnstile } from './Turnstile.jsx';

const VAZIO = { nome: '', email: '', whatsapp: '', empresa: '', tipo: '', nomeProjeto: '', descricao: '', funcionalidades: '', faixa: '', prazo: '', preferencia: 'WHATSAPP', consentimento: false, website: '' };

// Campo do Gestão → campo do formulário (para mostrar erros do servidor no lugar certo).
const CAMPOS_API = { name: 'nome', email: 'email', phone: 'whatsapp', service: 'tipo', message: 'descricao', company: 'empresa', projectName: 'nomeProjeto', features: 'funcionalidades', budgetRange: 'faixa', deadline: 'prazo', contactPreference: 'preferencia' };

export function validarPedido(v) {
  const e = {};
  if (v.nome.trim().length < 3 || !/\s/.test(v.nome.trim())) e.nome = 'Informe nome e sobrenome.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) e.email = 'Informe um e-mail válido.';
  const zap = v.whatsapp.replace(/\D/g, '');
  if (zap.length < 10 || zap.length > 11) e.whatsapp = 'Informe o WhatsApp com DDD.';
  if (!v.tipo) e.tipo = 'Escolha o tipo de projeto.';
  if (v.descricao.trim().length < 20) e.descricao = 'Descreva a necessidade com pelo menos 20 caracteres.';
  if (!v.faixa) e.faixa = 'Escolha uma faixa (ou "Ainda não sei").';
  if (!v.prazo) e.prazo = 'Escolha o prazo desejado.';
  if (!v.consentimento) e.consentimento = 'Para enviar, autorize o uso dos dados para responder ao pedido.';
  return e;
}

export function mascaraZap(t) {
  const d = t.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`;
}

export default function QuoteForm({ tipoInicial = '' }) {
  const [v, setV] = useState(() => ({ ...VAZIO, tipo: OPCOES_ORCAMENTO.tipos.includes(tipoInicial) ? tipoInicial : '' }));
  const [erros, setErros] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [erroGeral, setErroGeral] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [captcha, setCaptcha] = useState('');
  const [captchaVersao, setCaptchaVersao] = useState(0);
  const inicio = useRef(Date.now()); // o Gestão recusa envios rápidos demais (robôs)
  const onToken = useCallback((t) => setCaptcha(t), []);

  const resumo = useMemo(
    () =>
      [
        'Olá! Acabei de enviar um pedido de orçamento pelo site da Alex Sousa Tech.',
        '',
        `Nome: ${v.nome.trim()}`,
        v.empresa.trim() && `Empresa: ${v.empresa.trim()}`,
        `Tipo de projeto: ${v.tipo}`,
        v.nomeProjeto.trim() && `Projeto: ${v.nomeProjeto.trim()}`,
        `Necessidade: ${v.descricao.trim()}`,
      ]
        .filter((l) => l !== false && l !== '')
        .join('\n'),
    [v],
  );

  const set = (campo, valor) => {
    setV((x) => ({ ...x, [campo]: valor }));
    if (erros[campo]) setErros((e) => ({ ...e, [campo]: undefined }));
  };

  async function enviar(e) {
    e.preventDefault();
    if (enviando) return;
    const encontrados = validarPedido(v);
    if (precisaTurnstile && !captcha) encontrados.captcha = 'Confirme a verificação de segurança.';
    setErros(encontrados);
    const primeiro = Object.keys(encontrados)[0];
    if (primeiro) {
      document.getElementById(`orc-${primeiro}`)?.focus();
      return;
    }
    setEnviando(true);
    setErroGeral('');
    try {
      await enviarPedido({
        name: v.nome.trim(),
        email: v.email.trim(),
        phone: v.whatsapp,
        service: v.tipo,
        message: v.descricao.trim(),
        company: v.empresa.trim() || null,
        projectName: v.nomeProjeto.trim() || null,
        features: v.funcionalidades.trim() || null,
        budgetRange: v.faixa,
        deadline: v.prazo,
        contactPreference: v.preferencia,
        consent: v.consentimento,
        sourcePage: typeof window !== 'undefined' ? window.location.href.split('#')[0] : null,
        website: v.website,
        startedAt: inicio.current,
        ...(precisaTurnstile ? { captchaToken: captcha } : {}),
      });
      setEnviado(true);
    } catch (err) {
      const campos = Object.fromEntries(Object.entries(err.campos || {}).map(([k, msg]) => [CAMPOS_API[k] || k, msg]));
      if (Object.keys(campos).length) setErros(campos);
      setErroGeral(err.message || 'Não foi possível enviar o pedido.');
      if (err.codigo === 'CAPTCHA_FAILED') setCaptchaVersao((n) => n + 1);
    } finally {
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <div className="orc__form orc-sucesso" role="status" aria-live="polite">
        <div className="orc-sucesso__icone">
          <span className="orc-sucesso__anel" aria-hidden="true" />
          <CheckCircle2 size={40} aria-hidden="true" />
        </div>
        <h2>Pedido enviado</h2>
        <p>
          Recebemos o seu pedido. Vamos analisar a necessidade e responder pelo{' '}
          {v.preferencia === 'EMAIL' ? 'e-mail' : v.preferencia === 'PHONE' ? 'telefone' : 'WhatsApp'} informado. Valor e prazo são definidos depois de entender o
          projeto.
        </p>
        <div className="orc-sucesso__acoes">
          <a className="btn btn--primario" href={linkWhatsapp(resumo)} target="_blank" rel="noopener noreferrer">
            <MessageCircle size={18} aria-hidden="true" /> Adiantar pelo WhatsApp
          </a>
          <button
            type="button"
            className="btn btn--contorno"
            onClick={() => {
              setEnviado(false);
              setV({ ...VAZIO });
              inicio.current = Date.now();
            }}
          >
            <RotateCcw size={17} aria-hidden="true" /> Enviar outro pedido
          </button>
        </div>
      </div>
    );
  }

  const campo = (id, rotulo, props = {}, Tag = 'input') => {
    const { largo, mascara, icone: Icone, ...resto } = props;
    return (
      <div className={`campo${largo ? ' campo--largo' : ''}`}>
        <label htmlFor={`orc-${id}`}>{rotulo}</label>
        <div className={`campo__controle${Icone ? ' campo__controle--icone' : ''}`}>
          {Icone && <Icone size={18} className="campo__icone" aria-hidden="true" />}
          <Tag
            id={`orc-${id}`}
            value={v[id]}
            onChange={(e) => set(id, mascara ? mascara(e.target.value) : e.target.value)}
            aria-invalid={Boolean(erros[id])}
            aria-describedby={erros[id] ? `orc-${id}-erro` : undefined}
            {...resto}
          />
        </div>
        {erros[id] && (
          <p className="campo__erro" id={`orc-${id}-erro`}>
            {erros[id]}
          </p>
        )}
      </div>
    );
  };
  const escolha = (id, rotulo, opcoes, placeholder) => (
    <div className="campo">
      <label htmlFor={`orc-${id}`}>{rotulo}</label>
      <select id={`orc-${id}`} value={v[id]} onChange={(e) => set(id, e.target.value)} aria-invalid={Boolean(erros[id])} aria-describedby={erros[id] ? `orc-${id}-erro` : undefined}>
        <option value="">{placeholder}</option>
        {opcoes.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      {erros[id] && (
        <p className="campo__erro" id={`orc-${id}-erro`}>
          {erros[id]}
        </p>
      )}
    </div>
  );

  return (
    <form className="orc__form" onSubmit={enviar} noValidate aria-busy={enviando}>
      {enviando && <div className="barra-carregando orc__barra" aria-hidden="true" />}
      <fieldset disabled={enviando} className="orc__etapa">
        <legend>
          <span className="orc__etapa-num num">1</span> Seus dados
        </legend>
        <div className="form-grade">
          {campo('nome', 'Nome completo *', { autoComplete: 'name', maxLength: 120, icone: UserRound })}
          {campo('email', 'E-mail *', { type: 'email', autoComplete: 'email', maxLength: 160, inputMode: 'email', icone: Mail })}
          {campo('whatsapp', 'WhatsApp *', { type: 'tel', autoComplete: 'tel', inputMode: 'tel', placeholder: '(00) 00000-0000', mascara: mascaraZap, icone: Phone })}
          {campo('empresa', 'Empresa', { autoComplete: 'organization', maxLength: 120, placeholder: 'Se houver', icone: Building2 })}
        </div>
      </fieldset>
      <fieldset disabled={enviando} className="orc__etapa">
        <legend>
          <span className="orc__etapa-num num">2</span> O projeto
        </legend>
        <div className="form-grade">
          {escolha('tipo', 'Tipo de projeto *', OPCOES_ORCAMENTO.tipos, 'Escolha o tipo')}
          {campo('nomeProjeto', 'Nome do projeto', { maxLength: 120, placeholder: 'Se já tiver um', icone: FolderKanban })}
          {campo('descricao', 'O que você precisa? *', { largo: true, rows: 5, maxLength: 3000, placeholder: 'Conte o objetivo, para quem é e qual problema o projeto resolve.' }, 'textarea')}
          {campo('funcionalidades', 'Funcionalidades desejadas', { largo: true, rows: 3, maxLength: 2000, placeholder: 'Ex.: agendamento, pagamentos, área do cliente, painel administrativo' }, 'textarea')}
          {escolha('faixa', 'Faixa de investimento *', OPCOES_ORCAMENTO.faixas, 'Escolha uma faixa')}
          {escolha('prazo', 'Prazo desejado *', OPCOES_ORCAMENTO.prazos, 'Escolha o prazo')}
        </div>
        {/* Campo-isca: pessoas não veem; robôs preenchem e o pedido é descartado. */}
        <div className="isca" aria-hidden="true">
          <label htmlFor="orc-website">Seu site</label>
          <input id="orc-website" tabIndex={-1} autoComplete="off" value={v.website} onChange={(e) => set('website', e.target.value)} />
        </div>
      </fieldset>
      <fieldset disabled={enviando} className="orc__etapa">
        <legend>
          <span className="orc__etapa-num num">3</span> Como prefere receber a resposta?
        </legend>
        <div className="opcoes" role="radiogroup" aria-label="Forma de contato">
          {OPCOES_ORCAMENTO.preferencias.map((p) => (
            <label key={p.valor} className={`opcao${v.preferencia === p.valor ? ' opcao--ativa' : ''}`}>
              <input type="radio" name="preferencia" value={p.valor} checked={v.preferencia === p.valor} onChange={() => set('preferencia', p.valor)} />
              {p.valor === 'WHATSAPP' ? <MessageCircle size={17} aria-hidden="true" /> : p.valor === 'EMAIL' ? <Mail size={17} aria-hidden="true" /> : <Phone size={17} aria-hidden="true" />}
              {p.rotulo}
            </label>
          ))}
        </div>
        <label className={`check orc__consentimento${erros.consentimento ? ' check--erro' : ''}`}>
          <input id="orc-consentimento" type="checkbox" checked={v.consentimento} onChange={(e) => set('consentimento', e.target.checked)} aria-describedby={erros.consentimento ? 'orc-consentimento-erro' : undefined} />
          <span>
            Autorizo a Alex Sousa Tech a usar estes dados só para responder a este pedido. <Link to="/politica-de-privacidade">Política de privacidade</Link>
          </span>
        </label>
        {erros.consentimento && (
          <p className="campo__erro" id="orc-consentimento-erro">
            {erros.consentimento}
          </p>
        )}
        <Turnstile onToken={onToken} chave={captchaVersao} />
        {erros.captcha && <p className="campo__erro">{erros.captcha}</p>}
      </fieldset>
      <Aviso>{erroGeral}</Aviso>
      <div className="orc__acoes">
        <button type="submit" className="btn btn--primario btn--g" disabled={enviando}>
          {enviando ? <Loader2 size={18} className="girando" aria-hidden="true" /> : <Send size={18} aria-hidden="true" />}
          {enviando ? 'Enviando…' : 'Enviar pedido de orçamento'}
        </button>
        <p className="orc__nota">
          <ShieldCheck size={16} aria-hidden="true" /> Sem cadastro. Valor e prazo são definidos depois de entender o projeto: nenhum preço é calculado automaticamente.
        </p>
      </div>
    </form>
  );
}

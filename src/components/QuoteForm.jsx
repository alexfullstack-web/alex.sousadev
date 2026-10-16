// Formulário de orçamento. Três caminhos:
//  - Registrar no sistema: envia ao Business OS e só confirma depois da resposta da API
//    (protocolo). Reenvio usa a mesma chave, então não duplica.
//  - Solicitar contato da equipe: igual, com a preferência marcada.
//  - Continuar pelo WhatsApp: monta um resumo para a pessoa revisar e abrir no WhatsApp. NÃO é
//    registrado no sistema (a não ser que ela marque "também registrar").
import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ClipboardCheck, Headset, Loader2, MessageCircle, Send } from 'lucide-react';
import { local, mensagemDeErro, site } from '../api.js';
import { linkWhatsapp, useSite } from '../context/SiteContext.jsx';
import Turnstile, { precisaTurnstile } from './Turnstile.jsx';

export const CHAVE_PEDIDOS = 'ast.orcamentos';
const VAZIO = { nome: '', email: '', whatsapp: '', empresa: '', tipo: '', nomeProjeto: '', descricao: '', funcionalidades: '', faixa: '', prazo: '', preferencia: 'SISTEMA', consentimento: false, tambemRegistrar: false, site: '' };
const novaChave = () => (crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => ((c === 'x' ? Math.random() * 16 : (Math.random() * 4) + 8) | 0).toString(16)));
const ICONES = { SISTEMA: ClipboardCheck, WHATSAPP: MessageCircle, CONTATO_EQUIPE: Headset };
const DESCRICOES = {
  SISTEMA: 'Você recebe um protocolo e acompanha o andamento por aqui.',
  WHATSAPP: 'Montamos um resumo para você revisar e enviar pelo WhatsApp.',
  CONTATO_EQUIPE: 'Registramos o pedido e a equipe chama você pelo contato informado.',
};

function validar(v) {
  const e = {};
  if (v.nome.trim().length < 3 || !/\s/.test(v.nome.trim())) e.nome = 'Informe nome e sobrenome.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) e.email = 'Informe um e-mail válido.';
  const zap = v.whatsapp.replace(/\D/g, '');
  if (zap.length < 10 || zap.length > 13) e.whatsapp = 'Informe o WhatsApp com DDD.';
  if (!v.tipo) e.tipo = 'Escolha o tipo de projeto.';
  if (v.descricao.trim().length < 20) e.descricao = 'Descreva a necessidade com pelo menos 20 caracteres.';
  if (!v.faixa) e.faixa = 'Escolha uma faixa (ou "Ainda não sei").';
  if (!v.prazo) e.prazo = 'Escolha o prazo desejado.';
  return e;
}

function mascaraZap(t) {
  const d = t.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`;
}

export default function QuoteForm({ tipoInicial = '', onRegistrado }) {
  const { dados } = useSite();
  const opcoes = dados?.orcamentos?.opcoes;
  const ativo = dados?.orcamentos?.ativo;
  const zap = dados?.whatsapp;
  const [v, setV] = useState(() => ({ ...VAZIO, tipo: tipoInicial }));
  const [erros, setErros] = useState({});
  const [chave, setChave] = useState(novaChave);
  const [enviando, setEnviando] = useState(false);
  const [erroGeral, setErroGeral] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [captchaVersao, setCaptchaVersao] = useState(0);
  const [registrado, setRegistrado] = useState(null);
  const onToken = useCallback((t) => setCaptcha(t), []);
  const rotulo = (lista, valor) => opcoes?.[lista]?.find((o) => o.valor === valor)?.rotulo || '';

  const resumo = useMemo(() => {
    const se = (cond, t) => (cond ? t : null);
    return [
      'Olá! Vim pelo portfólio da Alex Sousa Tech e gostaria de um orçamento.',
      '',
      `Nome: ${v.nome.trim()}`,
      se(v.empresa.trim(), `Empresa: ${v.empresa.trim()}`),
      `E-mail: ${v.email.trim()}`,
      `Tipo de projeto: ${rotulo('tipos', v.tipo)}`,
      se(v.nomeProjeto.trim(), `Projeto: ${v.nomeProjeto.trim()}`),
      `Necessidade: ${v.descricao.trim()}`,
      se(v.funcionalidades.trim(), `Funcionalidades: ${v.funcionalidades.trim()}`),
      `Faixa de orçamento: ${rotulo('faixas', v.faixa)}`,
      `Prazo desejado: ${rotulo('prazos', v.prazo)}`,
      se(registrado, `Protocolo: ${registrado?.protocolo}`),
    ]
      .filter((l) => l !== null)
      .join('\n');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v, registrado, opcoes]);

  if (!opcoes) return null;
  if (!ativo) {
    return (
      <div className="orc-desligado" role="note">
        <p>Os pedidos de orçamento pelo site estão pausados no momento.</p>
        <div className="orc-desligado__acoes">
          {zap?.ativo && (
            <a className="botao botao--primario" href={zap.link} target="_blank" rel="noopener noreferrer">
              <MessageCircle size={17} aria-hidden="true" /> Falar pelo WhatsApp
            </a>
          )}
        </div>
      </div>
    );
  }

  const set = (campo, valor) => {
    setV((x) => ({ ...x, [campo]: valor }));
    if (erros[campo]) setErros((e) => ({ ...e, [campo]: undefined }));
  };
  const vaiRegistrar = v.preferencia !== 'WHATSAPP' || v.tambemRegistrar;

  async function registrar() {
    setEnviando(true);
    setErroGeral('');
    try {
      const r = await site.enviarOrcamento({
        chave,
        nome: v.nome.trim(),
        email: v.email.trim(),
        whatsapp: v.whatsapp,
        empresa: v.empresa.trim() || undefined,
        tipo: v.tipo,
        nomeProjeto: v.nomeProjeto.trim() || undefined,
        descricao: v.descricao.trim(),
        funcionalidades: v.funcionalidades.trim() || undefined,
        faixa: v.faixa,
        prazo: v.prazo,
        preferencia: v.preferencia,
        consentimento: v.consentimento,
        site: v.site,
        ...(precisaTurnstile ? { turnstileToken: captcha } : {}),
      });
      const lista = local.ler(CHAVE_PEDIDOS, []).filter((p) => p.protocolo !== r.protocolo);
      local.salvar(CHAVE_PEDIDOS, [{ protocolo: r.protocolo, token: r.token, tipo: rotulo('tipos', v.tipo), em: r.recebidoEm }, ...lista].slice(0, 10));
      setRegistrado(r);
      onRegistrado?.(r);
      return r;
    } catch (e) {
      setErroGeral(mensagemDeErro(e, 'Não foi possível registrar o pedido.'));
      if (e?.response?.data?.turnstile) setCaptchaVersao((n) => n + 1);
      return null;
    } finally {
      setEnviando(false);
    }
  }

  async function enviar(e) {
    e.preventDefault();
    if (enviando) return;
    const encontrados = validar(v);
    if (vaiRegistrar && !v.consentimento) encontrados.consentimento = 'Para registrar o pedido, autorize o uso dos dados para este atendimento.';
    if (vaiRegistrar && precisaTurnstile && !captcha) encontrados.captcha = 'Confirme a verificação de segurança.';
    setErros(encontrados);
    const primeiro = Object.keys(encontrados)[0];
    if (primeiro) {
      document.getElementById(`orc-${primeiro}`)?.focus();
      return;
    }
    if (!vaiRegistrar) return; // só WhatsApp: o botão de abrir o WhatsApp aparece abaixo
    await registrar();
  }

  if (registrado) {
    const comZap = v.preferencia === 'WHATSAPP' && zap?.ativo;
    return (
      <div className="orc-sucesso" role="status" aria-live="polite">
        <CheckCircle2 size={34} aria-hidden="true" />
        <h3>Pedido registrado</h3>
        <p className="orc-sucesso__protocolo">
          Protocolo <strong>{registrado.protocolo}</strong>
        </p>
        <p>
          {v.preferencia === 'CONTATO_EQUIPE'
            ? 'A equipe vai entrar em contato pelo e-mail ou WhatsApp informado.'
            : 'A equipe analisa o pedido e define valor e prazo depois de entender o projeto. Você pode acompanhar a situação nesta página, neste mesmo navegador.'}
        </p>
        <div className="orc-sucesso__acoes">
          {comZap && (
            <a className="botao botao--primario" href={linkWhatsapp(zap.numero, resumo)} target="_blank" rel="noopener noreferrer">
              <MessageCircle size={17} aria-hidden="true" /> Continuar pelo WhatsApp
            </a>
          )}
          <button
            type="button"
            className="botao botao--contorno"
            onClick={() => {
              setRegistrado(null);
              setV({ ...VAZIO });
              setChave(novaChave());
            }}
          >
            Fazer outro pedido
          </button>
        </div>
      </div>
    );
  }

  const campo = (id, rotuloCampo, props = {}, tag = 'input') => {
    const Tag = tag;
    return (
      <div className={`campo${props.largo ? ' campo--largo' : ''}`}>
        <label htmlFor={`orc-${id}`}>{rotuloCampo}</label>
        <Tag id={`orc-${id}`} value={v[id]} onChange={(e) => set(id, props.mascara ? props.mascara(e.target.value) : e.target.value)} aria-invalid={Boolean(erros[id])} aria-describedby={erros[id] ? `orc-${id}-erro` : undefined} {...Object.fromEntries(Object.entries(props).filter(([k]) => !['largo', 'mascara'].includes(k)))} />
        {erros[id] && (
          <p className="campo__erro" id={`orc-${id}-erro`}>
            {erros[id]}
          </p>
        )}
      </div>
    );
  };
  const escolha = (id, rotuloCampo, lista, placeholder) => (
    <div className="campo">
      <label htmlFor={`orc-${id}`}>{rotuloCampo}</label>
      <select id={`orc-${id}`} value={v[id]} onChange={(e) => set(id, e.target.value)} aria-invalid={Boolean(erros[id])}>
        <option value="">{placeholder}</option>
        {opcoes[lista].map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.rotulo}
          </option>
        ))}
      </select>
      {erros[id] && <p className="campo__erro">{erros[id]}</p>}
    </div>
  );

  return (
    <form className="orc-form" onSubmit={enviar} noValidate>
      <fieldset disabled={enviando}>
        <legend>Seus dados</legend>
        <div className="orc-grade">
          {campo('nome', 'Nome completo *', { autoComplete: 'name', maxLength: 100, required: true })}
          {campo('email', 'E-mail *', { type: 'email', autoComplete: 'email', maxLength: 160, required: true, inputMode: 'email' })}
          {campo('whatsapp', 'WhatsApp *', { type: 'tel', autoComplete: 'tel', inputMode: 'tel', placeholder: '(00) 00000-0000', mascara: mascaraZap, required: true })}
          {campo('empresa', 'Nome da empresa', { autoComplete: 'organization', maxLength: 120 })}
        </div>
      </fieldset>
      <fieldset disabled={enviando}>
        <legend>O projeto</legend>
        <div className="orc-grade">
          {escolha('tipo', 'Tipo de projeto *', 'tipos', 'Escolha o tipo')}
          {campo('nomeProjeto', 'Nome do projeto', { maxLength: 120, placeholder: 'Se já tiver um' })}
          {campo('descricao', 'Descrição da necessidade *', { largo: true, rows: 4, maxLength: 4000, placeholder: 'O que você precisa, para quem é e qual problema resolve.' }, 'textarea')}
          {campo('funcionalidades', 'Funcionalidades desejadas', { largo: true, rows: 3, maxLength: 4000, placeholder: 'Ex.: agendamento, pagamentos, área do cliente, painel administrativo…' }, 'textarea')}
          {escolha('faixa', 'Faixa de orçamento *', 'faixas', 'Escolha uma faixa')}
          {escolha('prazo', 'Prazo desejado *', 'prazos', 'Escolha o prazo')}
        </div>
        {/* campo-isca: pessoas não veem; robôs preenchem */}
        <div className="isca" aria-hidden="true">
          <label htmlFor="orc-site">Seu site</label>
          <input id="orc-site" tabIndex={-1} autoComplete="off" value={v.site} onChange={(e) => set('site', e.target.value)} />
        </div>
      </fieldset>
      <fieldset disabled={enviando}>
        <legend>Como prefere continuar</legend>
        <div className="orc-preferencias" role="radiogroup" aria-label="Forma de atendimento">
          {opcoes.preferencias
            .filter((p) => p.valor !== 'WHATSAPP' || zap?.ativo)
            .map((p) => {
              const I = ICONES[p.valor];
              return (
                <label key={p.valor} className={`orc-pref${v.preferencia === p.valor ? ' orc-pref--ativa' : ''}`}>
                  <input type="radio" name="preferencia" value={p.valor} checked={v.preferencia === p.valor} onChange={() => set('preferencia', p.valor)} />
                  <I size={20} aria-hidden="true" />
                  <span className="orc-pref__titulo">{p.rotulo}</span>
                  <span className="orc-pref__desc">{DESCRICOES[p.valor]}</span>
                </label>
              );
            })}
        </div>
        {v.preferencia === 'WHATSAPP' && (
          <div className="orc-zap">
            <label htmlFor="orc-resumo">Resumo que vai para o WhatsApp (você pode revisar antes de enviar)</label>
            <textarea id="orc-resumo" readOnly rows={7} value={resumo} />
            <label className="orc-check">
              <input type="checkbox" checked={v.tambemRegistrar} onChange={(e) => set('tambemRegistrar', e.target.checked)} /> Também registrar o pedido no sistema (gera um protocolo)
            </label>
            <p className="orc-nota">Abrir o WhatsApp não registra o pedido no sistema: você conversa direto com a equipe.</p>
          </div>
        )}
        {vaiRegistrar && (
          <label className={`orc-check${erros.consentimento ? ' orc-check--erro' : ''}`}>
            <input id="orc-consentimento" type="checkbox" checked={v.consentimento} onChange={(e) => set('consentimento', e.target.checked)} />
            <span>
              Autorizo o uso destes dados pela Alex Sousa Tech só para responder a este pedido de orçamento. <Link to="/privacidade">Política de privacidade</Link>
            </span>
          </label>
        )}
        {erros.consentimento && <p className="campo__erro">{erros.consentimento}</p>}
        {vaiRegistrar && <Turnstile onToken={onToken} chave={captchaVersao} />}
        {erros.captcha && <p className="campo__erro">{erros.captcha}</p>}
      </fieldset>
      {erroGeral && (
        <p className="orc-erro" role="alert">
          {erroGeral}
        </p>
      )}
      <div className="orc-acoes">
        {v.preferencia === 'WHATSAPP' && !v.tambemRegistrar ? (
          <a
            className={`botao botao--primario${Object.keys(validar(v)).length ? ' botao--inativo' : ''}`}
            href={linkWhatsapp(zap?.numero, resumo)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              const encontrados = validar(v);
              setErros(encontrados);
              if (Object.keys(encontrados).length) {
                e.preventDefault();
                document.getElementById(`orc-${Object.keys(encontrados)[0]}`)?.focus();
              }
            }}
          >
            <MessageCircle size={17} aria-hidden="true" /> Abrir o WhatsApp com o resumo
          </a>
        ) : (
          <button type="submit" className="botao botao--primario" disabled={enviando}>
            {enviando ? <Loader2 size={17} className="girando" aria-hidden="true" /> : <Send size={17} aria-hidden="true" />}
            {enviando ? 'Registrando…' : v.preferencia === 'CONTATO_EQUIPE' ? 'Enviar e pedir contato' : 'Registrar pedido'}
          </button>
        )}
        <p className="orc-nota">Valor e prazo são definidos pela equipe depois de entender o projeto. Nenhum preço é calculado automaticamente.</p>
      </div>
    </form>
  );
}

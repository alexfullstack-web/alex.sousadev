// João Pedro IA — widget flutuante (canto inferior direito).
// A conversa acontece na Central de Atendimento do Business OS (origem PORTFOLIO): o token da
// conversa fica só neste navegador; quando a pessoa pede atendimento humano, a conversa vira
// um protocolo na fila da equipe e as respostas chegam aqui.
// Sem IA configurada no servidor, o widget NÃO simula respostas: avisa e oferece formulário,
// WhatsApp e falar com a equipe.
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bot, Headset, Info, Loader2, MessageCircle, RotateCcw, Send, UserRound, X } from 'lucide-react';
import { chat, local, mensagemDeErro } from '../api.js';
import { useSite } from '../context/SiteContext.jsx';
import Turnstile, { precisaTurnstile } from './Turnstile.jsx';

const CHAVE = 'ast.joaopedro';
const SAUDACAO = 'Olá! Sou o João Pedro IA, assistente da Alex Sousa Tech. Posso ajudar você a conhecer nossos projetos, escolher um serviço ou solicitar um orçamento. Como posso ajudar?';
const SUGESTOES = ['Que tipos de projeto vocês fazem?', 'Quero um site para minha empresa', 'Como funciona o orçamento?'];
const STATUS = { NOVO: 'Na fila da equipe', EM_ATENDIMENTO: 'Em atendimento', AGUARDANDO_CLIENTE: 'Aguardando sua resposta', RESOLVIDO: 'Encerrado', ARQUIVADO: 'Encerrado' };
const hora = (d) => new Date(d).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

// Markdown mínimo e seguro (só **negrito** e quebras de linha; nada de HTML).
function Texto({ t }) {
  return String(t)
    .split('\n')
    .map((linha, i) => (
      <p key={i}>
        {linha.split(/(\*\*[^*]+\*\*)/g).map((parte, j) => (parte.startsWith('**') && parte.endsWith('**') ? <strong key={j}>{parte.slice(2, -2)}</strong> : parte))}
      </p>
    ));
}

function FormEquipe({ onEnviar, enviando, erro, onCancelar }) {
  const [v, setV] = useState({ nome: '', contato: '', assunto: '', mensagem: '' });
  const [captcha, setCaptcha] = useState('');
  const [aviso, setAviso] = useState('');
  const onToken = useCallback((t) => setCaptcha(t), []);
  function enviar(e) {
    e.preventDefault();
    if (v.nome.trim().length < 2) return setAviso('Informe seu nome.');
    const c = v.contato.trim();
    const email = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c);
    const fone = c.replace(/\D/g, '').length >= 10 && /^[\d\s()+-]+$/.test(c);
    if (!email && !fone) return setAviso('Informe um e-mail válido ou um telefone com DDD.');
    if (v.assunto.trim().length < 3) return setAviso('Conte em poucas palavras o assunto.');
    if (precisaTurnstile && !captcha) return setAviso('Confirme a verificação de segurança.');
    setAviso('');
    onEnviar({ ...v, nome: v.nome.trim(), contato: c, assunto: v.assunto.trim(), mensagem: v.mensagem.trim() || undefined }, captcha);
  }
  return (
    <form className="jp-equipe" onSubmit={enviar} noValidate>
      <p className="jp-equipe__intro">Uma pessoa da equipe responde por aqui. Deixe um contato para o caso de você sair da página.</p>
      <label>
        <span>Seu nome</span>
        <input value={v.nome} maxLength={80} onChange={(e) => setV({ ...v, nome: e.target.value })} autoComplete="name" required />
      </label>
      <label>
        <span>E-mail ou WhatsApp</span>
        <input value={v.contato} maxLength={120} onChange={(e) => setV({ ...v, contato: e.target.value })} autoComplete="email" required />
      </label>
      <label>
        <span>Assunto</span>
        <input value={v.assunto} maxLength={120} onChange={(e) => setV({ ...v, assunto: e.target.value })} placeholder="Ex.: site para minha clínica" required />
      </label>
      <label>
        <span>Mensagem (opcional)</span>
        <textarea rows={3} value={v.mensagem} maxLength={2000} onChange={(e) => setV({ ...v, mensagem: e.target.value })} />
      </label>
      <Turnstile onToken={onToken} />
      {(aviso || erro) && (
        <p className="jp-erro" role="alert">
          {aviso || erro}
        </p>
      )}
      <p className="jp-lgpd">Seus dados são usados só para responder a este atendimento. <Link to="/privacidade">Privacidade</Link></p>
      <div className="jp-equipe__acoes">
        {onCancelar && (
          <button type="button" className="botao botao--fantasma botao--p" onClick={onCancelar} disabled={enviando}>
            Voltar
          </button>
        )}
        <button type="submit" className="botao botao--primario botao--p" disabled={enviando}>
          {enviando ? <Loader2 size={15} className="girando" aria-hidden="true" /> : <Headset size={15} aria-hidden="true" />} Chamar a equipe
        </button>
      </div>
    </form>
  );
}

export default function JoaoPedro() {
  const { dados, chatAberto, abrirChat, fecharChat } = useSite();
  const aberto = Boolean(chatAberto);
  const [token, setToken] = useState(() => local.ler(CHAVE));
  const [conversa, setConversa] = useState(null);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [modoEquipe, setModoEquipe] = useState(false);
  const [captcha, setCaptcha] = useState('');
  const fim = useRef(null);
  const campo = useRef(null);
  const assistente = dados?.assistente;
  const iaDisponivel = Boolean(assistente?.iaDisponivel);
  const zap = dados?.whatsapp;
  const onToken = useCallback((t) => setCaptcha(t), []);

  useEffect(() => {
    if (chatAberto === 'equipe') setModoEquipe(true);
  }, [chatAberto]);

  const atualizar = useCallback(async () => {
    if (!token) return;
    try {
      setConversa(await chat.ver(token));
    } catch (e) {
      if (e?.response?.status === 401) {
        local.apagar(CHAVE);
        setToken(null);
        setConversa(null);
      }
    }
  }, [token]);

  useEffect(() => {
    if (aberto) atualizar();
  }, [aberto, atualizar]);
  // com protocolo aberto, confere respostas da equipe a cada 6 s (só com o chat aberto)
  useEffect(() => {
    if (!aberto || !conversa?.protocolo || ['RESOLVIDO', 'ARQUIVADO'].includes(conversa.protocolo.status)) return undefined;
    const t = setInterval(atualizar, 6000);
    return () => clearInterval(t);
  }, [aberto, conversa?.protocolo, atualizar]);
  useEffect(() => {
    fim.current?.scrollIntoView({ block: 'end' });
  }, [conversa?.mensagens?.length, enviando, modoEquipe]);
  useEffect(() => {
    if (!aberto) return undefined;
    const esc = (e) => e.key === 'Escape' && fecharChat();
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [aberto, fecharChat]);

  async function garantirConversa(tokenCaptcha) {
    if (token) return token;
    const r = await chat.iniciar(tokenCaptcha ? { turnstileToken: tokenCaptcha } : {});
    local.salvar(CHAVE, r.token);
    setToken(r.token);
    setConversa(r.conversa);
    return r.token;
  }

  async function enviar(msg) {
    const t = (msg ?? texto).trim();
    if (!t || enviando) return;
    if (!token && precisaTurnstile && !captcha) return setErro('Confirme a verificação de segurança para começar.');
    setEnviando(true);
    setErro('');
    try {
      const tk = await garantirConversa(captcha);
      setTexto('');
      setConversa(await chat.enviar(tk, t));
    } catch (e) {
      setErro(mensagemDeErro(e, 'Não foi possível enviar a mensagem.'));
    } finally {
      setEnviando(false);
      campo.current?.focus();
    }
  }

  async function chamarEquipe(corpo, tokenCaptcha) {
    setEnviando(true);
    setErro('');
    try {
      const tk = await garantirConversa(tokenCaptcha);
      setConversa(await chat.pedirEquipe(tk, corpo));
      setModoEquipe(false);
    } catch (e) {
      setErro(mensagemDeErro(e, 'Não foi possível chamar a equipe.'));
    } finally {
      setEnviando(false);
    }
  }

  function novaConversa() {
    local.apagar(CHAVE);
    setToken(null);
    setConversa(null);
    setModoEquipe(false);
    setErro('');
  }

  if (!dados) return null; // sem o site carregado não há com quem conversar
  const protocolo = conversa?.protocolo;
  const encerrado = protocolo && ['RESOLVIDO', 'ARQUIVADO'].includes(protocolo.status);
  const podeEscrever = !encerrado && (iaDisponivel || protocolo);
  const mensagens = conversa?.mensagens || [{ id: 'oi', tipo: 'MARIANA', autor: 'João Pedro IA', texto: SAUDACAO, em: new Date().toISOString() }];

  return (
    <>
      <button type="button" className={`jp-botao${aberto ? ' jp-botao--aberto' : ''}`} onClick={() => (aberto ? fecharChat() : abrirChat())} aria-expanded={aberto} aria-controls="jp-janela" aria-label={aberto ? 'Fechar conversa com o João Pedro IA' : 'Conversar com o João Pedro IA'}>
        {aberto ? <X size={24} aria-hidden="true" /> : <Bot size={26} aria-hidden="true" />}
        {!aberto && <span className="jp-botao__rotulo">João Pedro IA</span>}
      </button>
      {aberto && (
        <section id="jp-janela" className="jp" role="dialog" aria-modal="false" aria-labelledby="jp-titulo">
          <header className="jp__topo">
            <span className="jp__avatar" aria-hidden="true">
              <Bot size={20} />
            </span>
            <div>
              <h2 id="jp-titulo">João Pedro IA</h2>
              <p>{protocolo ? `Protocolo ${protocolo.numero} · ${STATUS[protocolo.status] || protocolo.status}` : iaDisponivel ? 'Assistente virtual · responde na hora' : 'Assistente indisponível no momento'}</p>
            </div>
            {conversa && (
              <button type="button" className="jp__icone" onClick={novaConversa} aria-label="Começar uma nova conversa" title="Nova conversa">
                <RotateCcw size={17} aria-hidden="true" />
              </button>
            )}
            <button type="button" className="jp__icone" onClick={fecharChat} aria-label="Fechar">
              <X size={19} aria-hidden="true" />
            </button>
          </header>

          <div className="jp__corpo" aria-live="polite">
            {!iaDisponivel && !protocolo && (
              <div className="jp-aviso" role="note">
                <Info size={16} aria-hidden="true" />
                <div>
                  <strong>O João Pedro IA está indisponível agora.</strong>
                  <p>Você pode pedir um orçamento, falar pelo WhatsApp ou chamar uma pessoa da equipe.</p>
                </div>
              </div>
            )}
            <ol className="jp-msgs">
              {mensagens.map((m) =>
                m.tipo === 'SISTEMA' ? (
                  <li key={m.id} className="jp-msg jp-msg--sistema">
                    <Texto t={m.texto} />
                  </li>
                ) : (
                  <li key={m.id} className={`jp-msg jp-msg--${m.tipo === 'USUARIO' ? 'eu' : m.tipo === 'ATENDENTE' ? 'equipe' : 'ia'}`}>
                    <span className="jp-msg__autor">
                      {m.tipo === 'USUARIO' ? <UserRound size={12} aria-hidden="true" /> : m.tipo === 'ATENDENTE' ? <Headset size={12} aria-hidden="true" /> : <Bot size={12} aria-hidden="true" />}
                      {m.tipo === 'USUARIO' ? 'Você' : m.tipo === 'ATENDENTE' ? `${m.autor} · equipe` : 'João Pedro IA'}
                    </span>
                    <div className="jp-msg__texto">
                      <Texto t={m.texto} />
                    </div>
                    <time dateTime={m.em}>{hora(m.em)}</time>
                  </li>
                ),
              )}
              {enviando && !modoEquipe && (
                <li className="jp-msg jp-msg--ia jp-msg--digitando" aria-label="Respondendo">
                  <span />
                  <span />
                  <span />
                </li>
              )}
            </ol>
            {!conversa && iaDisponivel && !modoEquipe && (
              <ul className="jp-sugestoes" aria-label="Sugestões">
                {SUGESTOES.map((s) => (
                  <li key={s}>
                    <button type="button" onClick={() => enviar(s)} disabled={enviando}>
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {modoEquipe && !protocolo && <FormEquipe onEnviar={chamarEquipe} enviando={enviando} erro={erro} onCancelar={iaDisponivel ? () => setModoEquipe(false) : null} />}
            {protocolo && !encerrado && <p className="jp-info">Você pode fechar esta janela: a conversa fica salva neste navegador.</p>}
            {encerrado && (
              <p className="jp-info">
                Atendimento encerrado.{' '}
                <button type="button" className="jp-link" onClick={novaConversa}>
                  Começar nova conversa
                </button>
              </p>
            )}
            <span ref={fim} />
          </div>

          {!modoEquipe && (
            <div className="jp__acoes">
              {!protocolo && (
                <button type="button" className="jp-chip" onClick={() => setModoEquipe(true)}>
                  <Headset size={14} aria-hidden="true" /> Falar com a equipe
                </button>
              )}
              <Link to="/orcamento" className="jp-chip" onClick={fecharChat}>
                <Send size={14} aria-hidden="true" /> Solicitar orçamento
              </Link>
              {zap?.ativo && (
                <a className="jp-chip" href={zap.link} target="_blank" rel="noopener noreferrer">
                  <MessageCircle size={14} aria-hidden="true" /> WhatsApp
                </a>
              )}
            </div>
          )}

          {!modoEquipe && podeEscrever && (
            <form
              className="jp__compor"
              onSubmit={(e) => {
                e.preventDefault();
                enviar();
              }}
            >
              {!token && <Turnstile onToken={onToken} />}
              {erro && (
                <p className="jp-erro" role="alert">
                  {erro}
                </p>
              )}
              <div className="jp__linha">
                <label htmlFor="jp-texto" className="sr-only">
                  Mensagem para o João Pedro IA
                </label>
                <textarea
                  id="jp-texto"
                  ref={campo}
                  rows={1}
                  value={texto}
                  maxLength={2000}
                  placeholder={protocolo ? 'Escreva para a equipe…' : 'Pergunte sobre serviços ou projetos…'}
                  onChange={(e) => setTexto(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      enviar();
                    }
                  }}
                />
                <button type="submit" className="jp__enviar" disabled={!texto.trim() || enviando} aria-label="Enviar mensagem">
                  {enviando ? <Loader2 size={18} className="girando" aria-hidden="true" /> : <Send size={18} aria-hidden="true" />}
                </button>
              </div>
              <p className="jp-lgpd">Assistente virtual: não informa preços nem prazos — quem define é a equipe.</p>
            </form>
          )}
          {!modoEquipe && !podeEscrever && !encerrado && erro && (
            <p className="jp-erro jp-erro--fora" role="alert">
              {erro}
            </p>
          )}
        </section>
      )}
    </>
  );
}

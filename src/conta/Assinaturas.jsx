import { useCallback, useEffect, useState } from 'react';
import { ExternalLink, Loader2, MessageCircle } from 'lucide-react';
import { linkWhatsapp } from '../data/empresa.js';
import * as api from './api.js';
import { useConta } from './ContaContext.jsx';

// Minhas assinaturas e Minhas plataformas. Tudo vem do servidor: o site nunca decide
// sozinho se uma plataforma está liberada ou se um pagamento foi feito.

const CICLO = { MONTHLY: 'por mês', QUARTERLY: 'por trimestre', SEMIANNUAL: 'por semestre', YEARLY: 'por ano' };
const STATUS = {
  AWAITING_PAYMENT: { rotulo: 'Aguardando pagamento', tom: 'info' },
  ACTIVE: { rotulo: 'Ativa', tom: 'ok' },
  PAYMENT_PENDING: { rotulo: 'Pagamento em análise', tom: 'info' },
  OVERDUE: { rotulo: 'Em atraso', tom: 'alerta' },
  SUSPENDED: { rotulo: 'Suspensa', tom: 'erro' },
  CANCELED: { rotulo: 'Cancelada', tom: 'neutro' },
  ENDED: { rotulo: 'Encerrada', tom: 'neutro' },
};
const FINAIS = ['CANCELED', 'ENDED'];
const real = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const data = (iso) => (iso ? String(iso).slice(0, 10).split('-').reverse().join('/') : '—');

function Selo({ tom, children }) {
  return <span className={`selo selo--${tom}`}>{children}</span>;
}

function useCarregar(fn) {
  const { perdeuSessao } = useConta();
  const [estado, setEstado] = useState({ carregando: true, erro: '', dados: null });
  const carregar = useCallback(async () => {
    setEstado((s) => ({ ...s, carregando: true, erro: '' }));
    try {
      setEstado({ carregando: false, erro: '', dados: await fn() });
    } catch (e) {
      if (e.status === 401 || e.status === 403) return perdeuSessao();
      setEstado((s) => ({ ...s, carregando: false, erro: e.message }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    carregar();
  }, [carregar]);
  return [estado, carregar];
}

function Carregando({ texto }) {
  return (
    <p className="conta__texto" role="status">
      <Loader2 className="girando" size={18} aria-hidden="true" /> {texto}
    </p>
  );
}

// O que o cliente precisa saber sobre cada assinatura, na linguagem dele.
function situacao(s) {
  if (s.status === 'AWAITING_PAYMENT') return 'Assim que o pagamento for confirmado, as plataformas deste plano são liberadas automaticamente.';
  if (s.status === 'PAYMENT_PENDING') return 'Recebemos o pedido de pagamento da renovação e estamos aguardando a confirmação.';
  if (s.status === 'OVERDUE') return s.access.granted ? `O pagamento venceu em ${data(s.currentPeriodEnd)}. Regularize até ${data(s.access.until)} para não perder o acesso.` : 'O pagamento está em atraso e o acesso foi interrompido. Regularize para reativar.';
  if (s.status === 'SUSPENDED') return s.suspendedForPayment ? 'Suspensa por falta de pagamento. Regularize o pagamento para reativar o acesso automaticamente.' : 'Suspensa. Fale com a gente para entender e resolver.';
  if (s.status === 'ACTIVE') {
    if (s.cancelAtPeriodEnd) return `Cancelamento agendado. Você continua com acesso até ${data(s.currentPeriodEnd)}.`;
    if (s.inTrial) return `Período de teste até ${data(s.trialEndsAt)}.`;
    if (!s.access.granted) return 'O pagamento está em atraso e o acesso foi interrompido. Regularize para reativar.';
    return s.access.reason === 'GRACE_PERIOD' ? `O pagamento venceu em ${data(s.currentPeriodEnd)}. Regularize até ${data(s.access.until)}.` : `Em dia. Próximo vencimento: ${data(s.currentPeriodEnd)}.`;
  }
  return null;
}

function CartaoAssinatura({ s, onMudou }) {
  const { cliente, perdeuSessao } = useConta();
  const [confirmando, setConfirmando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const st = STATUS[s.status];
  const final = FINAIS.includes(s.status);
  const precisaPagar = ['OVERDUE'].includes(s.status) || (s.status === 'SUSPENDED' && s.suspendedForPayment) || (s.status === 'ACTIVE' && !s.access.granted);

  async function agir(fn) {
    setErro('');
    setEnviando(true);
    try {
      await fn(s.id);
      setConfirmando(false);
      onMudou();
    } catch (e) {
      if (e.status === 401 || e.status === 403) return perdeuSessao();
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  }

  const imediato = !['ACTIVE', 'PAYMENT_PENDING'].includes(s.status);
  return (
    <article className={`assinatura${final ? ' assinatura--final' : ''}`} aria-labelledby={`ass-${s.id}`}>
      <header className="assinatura__topo">
        <h3 id={`ass-${s.id}`}>{s.planName}</h3>
        <Selo tom={st.tom}>{s.inTrial && s.status === 'ACTIVE' ? 'Em teste' : st.rotulo}</Selo>
      </header>
      <p className="assinatura__preco">
        <strong className="num">{real(s.price)}</strong> {CICLO[s.billingCycle]}
      </p>
      <ul className="assinatura__plataformas" aria-label="Plataformas incluídas">
        {s.platforms.map((p) => (
          <li key={p.id}>{p.name}</li>
        ))}
      </ul>
      {!final && situacao(s) && <p className={`assinatura__situacao${precisaPagar ? ' assinatura__situacao--alerta' : ''}`}>{situacao(s)}</p>}
      {final && <p className="conta__dica">{s.status === 'ENDED' ? 'Encerrada no fim do período.' : 'Cancelada.'}</p>}

      {erro && (
        <p className="orc-erro" role="alert">
          {erro}
        </p>
      )}

      {!final && (
        <div className="assinatura__acoes">
          {precisaPagar && (
            <a className="botao botao--primario botao--p" href={linkWhatsapp(`Olá! Sou ${cliente.name} e quero regularizar o pagamento da assinatura ${s.planName}.`)} target="_blank" rel="noopener noreferrer">
              <MessageCircle size={16} aria-hidden="true" /> Regularizar pelo WhatsApp
            </a>
          )}
          {s.cancelAtPeriodEnd ? (
            <button type="button" className="botao botao--contorno botao--p" disabled={enviando} onClick={() => agir(api.manterAssinatura)}>
              Manter assinatura
            </button>
          ) : confirmando ? (
            <div className="assinatura__confirmar" role="group" aria-label="Confirmar cancelamento">
              <p>{imediato ? 'Cancelar agora? Esta contratação será encerrada.' : `Cancelar? Você mantém o acesso até ${data(s.currentPeriodEnd)}.`}</p>
              <button type="button" className="botao botao--contorno botao--p" disabled={enviando} onClick={() => setConfirmando(false)}>
                Voltar
              </button>
              <button type="button" className="botao botao--perigo botao--p" disabled={enviando} onClick={() => agir(api.cancelarAssinatura)}>
                {enviando ? <Loader2 className="girando" size={16} aria-hidden="true" /> : null} Confirmar cancelamento
              </button>
            </div>
          ) : (
            <button type="button" className="botao botao--fantasma botao--p" onClick={() => setConfirmando(true)}>
              Cancelar assinatura
            </button>
          )}
        </div>
      )}
    </article>
  );
}

function Catalogo({ assinaturas, onContratou, irParaDados }) {
  const { cliente, perdeuSessao } = useConta();
  const [{ carregando, erro, dados }, recarregar] = useCarregar(api.catalogo);
  const [escolhido, setEscolhido] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [falha, setFalha] = useState(null); // { planId, mensagem, codigo }

  if (carregando && !dados) return <Carregando texto="Carregando planos..." />;
  if (erro)
    return (
      <p className="orc-erro" role="alert">
        {erro}{' '}
        <button type="button" className="conta__link" onClick={recarregar}>
          Tentar de novo
        </button>
      </p>
    );
  const planos = dados?.data ?? [];
  if (!planos.length) return null;
  const emAndamento = new Set(assinaturas.filter((s) => !FINAIS.includes(s.status)).map((s) => s.planId));

  async function contratar(plano) {
    setFalha(null);
    setEnviando(true);
    try {
      await api.contratar(plano.id);
      setEscolhido(null);
      onContratou();
    } catch (e) {
      if (e.status === 401 || e.status === 403) return perdeuSessao();
      setFalha({ planId: plano.id, mensagem: e.message, codigo: e.codigo });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="planos" aria-labelledby="planos-titulo">
      <h3 id="planos-titulo">Planos disponíveis</h3>
      <div className="planos__grade">
        {planos.map((p) => (
          <article key={p.id} className="plano">
            <h4>{p.name}</h4>
            <p className="plano__preco">
              <strong className="num">{real(p.price)}</strong> {CICLO[p.billingCycle]}
            </p>
            {p.description && <p className="conta__dica">{p.description}</p>}
            <ul className="assinatura__plataformas" aria-label="Plataformas incluídas">
              {p.platforms.map((x) => (
                <li key={x.id}>{x.name}</li>
              ))}
            </ul>
            {p.trialDays > 0 && <p className="conta__dica">Teste grátis de {p.trialDays} dias na primeira contratação deste plano.</p>}

            {falha?.planId === p.id && (
              <p className="orc-erro" role="alert">
                {falha.mensagem}{' '}
                {falha.codigo === 'CPF_REQUIRED' && (
                  <button type="button" className="conta__link" onClick={irParaDados}>
                    Informar CPF
                  </button>
                )}
              </p>
            )}

            {emAndamento.has(p.id) ? (
              <p className="conta__dica">Você já tem este plano.</p>
            ) : !dados.checkoutEnabled ? (
              <a className="botao botao--contorno botao--p" href={linkWhatsapp(`Olá! Sou ${cliente.name} e quero contratar o plano ${p.name}.`)} target="_blank" rel="noopener noreferrer">
                <MessageCircle size={16} aria-hidden="true" /> Quero contratar
              </a>
            ) : escolhido === p.id ? (
              <div className="assinatura__confirmar" role="group" aria-label={`Confirmar contratação do plano ${p.name}`}>
                <p>{p.trialDays > 0 ? 'Contratar este plano?' : 'Contratar este plano? As plataformas são liberadas assim que o pagamento for confirmado.'}</p>
                <button type="button" className="botao botao--contorno botao--p" disabled={enviando} onClick={() => setEscolhido(null)}>
                  Voltar
                </button>
                <button type="button" className="botao botao--primario botao--p" disabled={enviando} onClick={() => contratar(p)}>
                  {enviando ? <Loader2 className="girando" size={16} aria-hidden="true" /> : null} Confirmar contratação
                </button>
              </div>
            ) : (
              <button type="button" className="botao botao--primario botao--p" onClick={() => setEscolhido(p.id)}>
                Contratar
              </button>
            )}
          </article>
        ))}
      </div>
      {!dados.checkoutEnabled && <p className="conta__dica">A contratação com pagamento pelo site estará disponível em breve. Por enquanto, fale com a gente pelo WhatsApp.</p>}
    </section>
  );
}

export function MinhasAssinaturas({ irParaDados }) {
  const [{ carregando, erro, dados }, recarregar] = useCarregar(api.minhasAssinaturas);
  const lista = dados ?? [];
  const atuais = lista.filter((s) => !FINAIS.includes(s.status));
  const anteriores = lista.filter((s) => FINAIS.includes(s.status));

  return (
    <>
      <h2>Minhas assinaturas</h2>
      {carregando && !dados ? (
        <Carregando texto="Carregando assinaturas..." />
      ) : erro ? (
        <p className="orc-erro" role="alert">
          {erro}{' '}
          <button type="button" className="conta__link" onClick={recarregar}>
            Tentar de novo
          </button>
        </p>
      ) : (
        <>
          {!atuais.length ? (
            <p className="conta__texto">Você ainda não tem assinaturas em andamento.</p>
          ) : (
            <div className="assinaturas">
              {atuais.map((s) => (
                <CartaoAssinatura key={s.id} s={s} onMudou={recarregar} />
              ))}
            </div>
          )}
          {anteriores.length > 0 && (
            <details className="assinaturas__anteriores">
              <summary>Assinaturas anteriores ({anteriores.length})</summary>
              <div className="assinaturas">
                {anteriores.map((s) => (
                  <CartaoAssinatura key={s.id} s={s} onMudou={recarregar} />
                ))}
              </div>
            </details>
          )}
          <Catalogo assinaturas={lista} onContratou={recarregar} irParaDados={irParaDados} />
        </>
      )}
    </>
  );
}

const MOTIVO = {
  SUBSCRIPTION: 'Liberada pela sua assinatura',
  TRIAL: 'Liberada no período de teste',
  GRACE_PERIOD: 'Liberada, mas o pagamento venceu: regularize para não perder o acesso',
  MANUAL_GRANT: 'Liberada pela Alex Sousa Tech',
  PAYMENT_REQUIRED: 'Sem acesso: regularize o pagamento para reativar',
  SUSPENDED: 'Sem acesso: assinatura suspensa. Fale com a gente',
  AWAITING_PAYMENT: 'Será liberada quando o pagamento for confirmado',
  ENDED: 'Sem acesso: assinatura encerrada',
  NO_SUBSCRIPTION: 'Não incluída nos seus planos',
  NO_ACCESS: 'Sem acesso no momento. Fale com a gente',
};

export function MinhasPlataformas() {
  const { cliente } = useConta();
  const [{ carregando, erro, dados }, recarregar] = useCarregar(api.minhasPlataformas);
  const lista = dados ?? [];
  return (
    <>
      <h2>Minhas plataformas</h2>
      {carregando && !dados ? (
        <Carregando texto="Carregando plataformas..." />
      ) : erro ? (
        <p className="orc-erro" role="alert">
          {erro}{' '}
          <button type="button" className="conta__link" onClick={recarregar}>
            Tentar de novo
          </button>
        </p>
      ) : !lista.length ? (
        <p className="conta__texto">Nenhuma plataforma disponível no momento.</p>
      ) : (
        <ul className="plataformas">
          {lista.map((a) => {
            const pagar = ['PAYMENT_REQUIRED', 'GRACE_PERIOD'].includes(a.reason);
            return (
              <li key={a.platform.slug} className={`plataforma${a.access ? ' plataforma--liberada' : ''}`}>
                <div className="plataforma__info">
                  <h3>{a.platform.name}</h3>
                  {a.platform.description && <p className="conta__dica">{a.platform.description}</p>}
                  <p className={`plataforma__motivo${pagar ? ' assinatura__situacao--alerta' : ''}`}>
                    {MOTIVO[a.reason] ?? MOTIVO.NO_ACCESS}
                    {a.access && a.until && a.reason !== 'GRACE_PERIOD' ? `, até ${data(a.until)}.` : '.'}
                  </p>
                </div>
                <div className="plataforma__acoes">
                  <Selo tom={a.access ? 'ok' : 'neutro'}>{a.access ? 'Liberada' : 'Sem acesso'}</Selo>
                  {a.access && a.platform.url && (
                    <a className="botao botao--contorno botao--p" href={a.platform.url} target="_blank" rel="noopener noreferrer">
                      Acessar <ExternalLink size={15} aria-hidden="true" />
                    </a>
                  )}
                  {pagar && (
                    <a className="botao botao--primario botao--p" href={linkWhatsapp(`Olá! Sou ${cliente.name} e quero regularizar o pagamento da plataforma ${a.platform.name}.`)} target="_blank" rel="noopener noreferrer">
                      <MessageCircle size={16} aria-hidden="true" /> Regularizar
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

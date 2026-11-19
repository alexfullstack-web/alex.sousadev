import { useEffect, useState } from 'react';
import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Boxes, Check, KeyRound, Loader2, LogIn, LogOut, Mail, MessageCircle, Repeat, Save, ShieldCheck, UserPlus, UserRound } from 'lucide-react';
import { CONTATO, linkWhatsapp } from '../data/empresa.js';
import { CAMINHO_PRIVACIDADE, CAMINHO_TERMOS } from '../data/legal.js';
import { useSeo } from '../hooks/useSeo.js';
import * as api from './api.js';
import { MinhasAssinaturas, MinhasPlataformas } from './Assinaturas.jsx';
import { ContaProvider, useConta } from './ContaContext.jsx';

// ---------------------------------------------------------------------------
// Utilidades de formulário (a validação de verdade é sempre no servidor)
// ---------------------------------------------------------------------------
const digitos = (v) => String(v ?? '').replace(/\D/g, '');
export function mascaraTelefone(v) {
  const d = digitos(v).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}
export function mascaraCPF(v) {
  const d = digitos(v).slice(0, 11);
  return d.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}
export const REGRAS_SENHA = [
  { teste: (s) => s.length >= 10, texto: 'Pelo menos 10 caracteres' },
  { teste: (s) => /[a-z]/.test(s), texto: 'Uma letra minúscula' },
  { teste: (s) => /[A-Z]/.test(s), texto: 'Uma letra maiúscula' },
  { teste: (s) => /\d/.test(s), texto: 'Um número' },
];

function Campo({ id, rotulo, erro, dica, largo, ...props }) {
  const ids = [erro && `${id}-erro`, dica && `${id}-dica`].filter(Boolean).join(' ') || undefined;
  return (
    <div className={`campo${largo ? ' campo--largo' : ''}`}>
      <label htmlFor={id}>{rotulo}</label>
      <input id={id} aria-invalid={Boolean(erro)} aria-describedby={ids} {...props} />
      {dica && !erro && (
        <p className="conta__dica" id={`${id}-dica`}>
          {dica}
        </p>
      )}
      {erro && (
        <p className="campo__erro" id={`${id}-erro`}>
          {erro}
        </p>
      )}
    </div>
  );
}

function RegrasSenha({ senha }) {
  return (
    <ul className="conta__regras" aria-label="Requisitos da senha">
      {REGRAS_SENHA.map((r) => (
        <li key={r.texto} className={r.teste(senha) ? 'ok' : undefined}>
          <Check size={14} aria-hidden="true" /> {r.texto}
        </li>
      ))}
    </ul>
  );
}

function Aviso({ tipo = 'erro', children }) {
  if (!children) return null;
  return (
    <p className={tipo === 'erro' ? 'orc-erro' : 'conta__ok'} role={tipo === 'erro' ? 'alert' : 'status'}>
      {children}
    </p>
  );
}

function BotaoEnviar({ enviando, icone: Icone, children, textoEnviando = 'Enviando…' }) {
  return (
    <button type="submit" className="botao botao--primario conta__enviar" disabled={enviando}>
      {enviando ? <Loader2 size={18} className="girando" aria-hidden="true" /> : <Icone size={18} aria-hidden="true" />}
      {enviando ? textoEnviando : children}
    </button>
  );
}

function Moldura({ titulo, texto, children, rodape }) {
  return (
    <section className="conta" aria-labelledby="conta-titulo">
      <div className="conta__cartao">
        <h1 id="conta-titulo">{titulo}</h1>
        {texto && <p className="conta__texto">{texto}</p>}
        {children}
      </div>
      {rodape && <div className="conta__rodape">{rodape}</div>}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Rotas /conta: a sessão só é carregada aqui dentro
// ---------------------------------------------------------------------------
export function ContaLayout() {
  return (
    <ContaProvider>
      <Outlet />
    </ContaProvider>
  );
}

function SoAnonimo({ children }) {
  const { estado } = useConta();
  if (estado === 'carregando') return <Carregando />;
  if (estado === 'logado') return <Navigate to="/conta" replace />;
  return children;
}

function Carregando() {
  return (
    <section className="conta" aria-busy="true">
      <div className="conta__cartao conta__cartao--carregando">
        <Loader2 size={22} className="girando" aria-hidden="true" /> Carregando sua conta…
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Entrar
// ---------------------------------------------------------------------------
export function Entrar() {
  useSeo({ titulo: 'Entrar na área do cliente', caminho: '/conta/entrar', noindex: true, descricao: 'Acesse sua conta na área do cliente da Alex Sousa Tech.' });
  const { entrar } = useConta();
  const navigate = useNavigate();
  const [v, setV] = useState({ email: '', password: '' });
  const [erros, setErros] = useState({});
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    const f = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) f.email = 'Informe um e-mail válido.';
    if (!v.password) f.password = 'Informe a senha.';
    setErros(f);
    setErro('');
    if (Object.keys(f).length) return;
    setEnviando(true);
    try {
      await entrar({ email: v.email.trim(), password: v.password });
      navigate('/conta', { replace: true });
    } catch (err) {
      setErro(err.message);
      setV((x) => ({ ...x, password: '' }));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <SoAnonimo>
      <Moldura
        titulo="Área do cliente"
        texto="Entre com o e-mail e a senha da sua conta."
        rodape={
          <p>
            Ainda não tem conta? <Link to="/conta/cadastro">Criar conta</Link>
          </p>
        }
      >
        <form className="conta__form" onSubmit={enviar} noValidate>
          <fieldset disabled={enviando}>
            <Campo id="entrar-email" rotulo="E-mail" type="email" autoComplete="email" inputMode="email" value={v.email} erro={erros.email} onChange={(e) => setV({ ...v, email: e.target.value })} />
            <Campo id="entrar-senha" rotulo="Senha" type="password" autoComplete="current-password" value={v.password} erro={erros.password} onChange={(e) => setV({ ...v, password: e.target.value })} />
          </fieldset>
          <Aviso>{erro}</Aviso>
          <BotaoEnviar enviando={enviando} icone={LogIn} textoEnviando="Entrando…">
            Entrar
          </BotaoEnviar>
          <Link to="/conta/esqueci-senha" className="conta__link">
            Esqueci minha senha
          </Link>
        </form>
      </Moldura>
    </SoAnonimo>
  );
}

// ---------------------------------------------------------------------------
// Cadastro
// ---------------------------------------------------------------------------
export function Cadastro() {
  useSeo({ titulo: 'Criar conta', caminho: '/conta/cadastro', noindex: true, descricao: 'Crie sua conta na área do cliente da Alex Sousa Tech.' });
  const { cadastrar } = useConta();
  const [v, setV] = useState({ name: '', email: '', phone: '', cpf: '', password: '', confirmPassword: '', acceptTerms: false });
  const [erros, setErros] = useState({});
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const muda = (campo, fn = (x) => x) => (e) => {
    const valor = fn(e.target.type === 'checkbox' ? e.target.checked : e.target.value);
    setV((x) => ({ ...x, [campo]: valor }));
    setErros((x) => ({ ...x, [campo]: undefined }));
  };

  async function enviar(e) {
    e.preventDefault();
    const f = {};
    if (!/\S+\s+\S+/.test(v.name.trim())) f.name = 'Informe nome e sobrenome.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) f.email = 'Informe um e-mail válido.';
    if (!/^[1-9]{2}\d{8,9}$/.test(digitos(v.phone))) f.phone = 'Telefone com DDD.';
    if (v.cpf && digitos(v.cpf).length !== 11) f.cpf = 'CPF com 11 dígitos.';
    if (!REGRAS_SENHA.every((r) => r.teste(v.password))) f.password = 'A senha não atende aos requisitos.';
    if (v.password !== v.confirmPassword) f.confirmPassword = 'A confirmação não confere com a senha.';
    if (!v.acceptTerms) f.acceptTerms = 'É preciso aceitar os Termos de Uso e a Política de Privacidade.';
    setErros(f);
    setErro('');
    if (Object.keys(f).length) return;
    setEnviando(true);
    try {
      // Com a sessão aberta, SoAnonimo leva para /conta.
      await cadastrar({ ...v, name: v.name.trim(), email: v.email.trim(), cpf: v.cpf || undefined });
    } catch (err) {
      if (Object.keys(err.campos ?? {}).length) setErros(err.campos);
      else setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <SoAnonimo>
      <Moldura
        titulo="Criar conta"
        texto="Com a conta você acompanha seus dados e, quando estiverem disponíveis, suas assinaturas e pagamentos."
        rodape={
          <p>
            Já tem conta? <Link to="/conta/entrar">Entrar</Link>
          </p>
        }
      >
        <form className="conta__form" onSubmit={enviar} noValidate>
          <fieldset disabled={enviando} className="orc-grade">
            <Campo id="cad-nome" rotulo="Nome completo *" largo autoComplete="name" maxLength={120} value={v.name} erro={erros.name} onChange={muda('name')} />
            <Campo id="cad-email" rotulo="E-mail *" type="email" autoComplete="email" inputMode="email" maxLength={160} value={v.email} erro={erros.email} onChange={muda('email')} />
            <Campo id="cad-telefone" rotulo="Telefone *" type="tel" autoComplete="tel" inputMode="tel" placeholder="(00) 00000-0000" value={v.phone} erro={erros.phone} onChange={muda('phone', mascaraTelefone)} />
            <Campo id="cad-cpf" rotulo="CPF" largo inputMode="numeric" placeholder="000.000.000-00" value={v.cpf} erro={erros.cpf} dica="Opcional agora. Será pedido para gerar cobranças." onChange={muda('cpf', mascaraCPF)} />
            <Campo id="cad-senha" rotulo="Senha *" type="password" autoComplete="new-password" value={v.password} erro={erros.password} onChange={muda('password')} />
            <Campo id="cad-confirmar" rotulo="Confirme a senha *" type="password" autoComplete="new-password" value={v.confirmPassword} erro={erros.confirmPassword} onChange={muda('confirmPassword')} />
            <div className="campo--largo">
              <RegrasSenha senha={v.password} />
            </div>
            <div className="campo--largo">
              <label className={`orc-check${erros.acceptTerms ? ' orc-check--erro' : ''}`}>
                <input id="cad-termos" type="checkbox" checked={v.acceptTerms} onChange={muda('acceptTerms')} aria-describedby={erros.acceptTerms ? 'cad-termos-erro' : undefined} />
                <span>
                  Li e aceito os{' '}
                  <Link to={CAMINHO_TERMOS} target="_blank">
                    Termos de Uso
                  </Link>{' '}
                  e a{' '}
                  <Link to={CAMINHO_PRIVACIDADE} target="_blank">
                    Política de Privacidade
                  </Link>
                  .
                </span>
              </label>
              {erros.acceptTerms && (
                <p className="campo__erro" id="cad-termos-erro">
                  {erros.acceptTerms}
                </p>
              )}
            </div>
          </fieldset>
          <Aviso>{erro}</Aviso>
          <BotaoEnviar enviando={enviando} icone={UserPlus} textoEnviando="Criando…">
            Criar conta
          </BotaoEnviar>
        </form>
      </Moldura>
    </SoAnonimo>
  );
}

// ---------------------------------------------------------------------------
// Esqueci a senha / Redefinir
// ---------------------------------------------------------------------------
export function EsqueciSenha() {
  useSeo({ titulo: 'Recuperar senha', caminho: '/conta/esqueci-senha', noindex: true, descricao: 'Receba um link para criar uma nova senha.' });
  const [email, setEmail] = useState('');
  const [erroCampo, setErroCampo] = useState('');
  const [erro, setErro] = useState('');
  const [ok, setOk] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setErro('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) return setErroCampo('Informe um e-mail válido.');
    setErroCampo('');
    setEnviando(true);
    try {
      const r = await api.pedirRedefinicao(email.trim());
      setOk(r.message);
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Moldura titulo="Recuperar senha" texto="Informe o e-mail da sua conta. Enviaremos um link para você criar uma nova senha." rodape={<Link to="/conta/entrar">Voltar para entrar</Link>}>
      {ok ? (
        <Aviso tipo="ok">{ok} O link vale por 30 minutos. Confira também a caixa de spam.</Aviso>
      ) : (
        <form className="conta__form" onSubmit={enviar} noValidate>
          <fieldset disabled={enviando}>
            <Campo id="esqueci-email" rotulo="E-mail" type="email" autoComplete="email" inputMode="email" value={email} erro={erroCampo} onChange={(e) => setEmail(e.target.value)} />
          </fieldset>
          <Aviso>{erro}</Aviso>
          <BotaoEnviar enviando={enviando} icone={Mail}>
            Enviar link
          </BotaoEnviar>
        </form>
      )}
    </Moldura>
  );
}

export function RedefinirSenha() {
  useSeo({ titulo: 'Nova senha', caminho: '/conta/redefinir-senha', noindex: true, descricao: 'Crie uma nova senha para sua conta.' });
  const { hash } = useLocation();
  // O token vem depois do "#" (não chega a servidores nem a outros sites); sai da barra de endereço logo ao abrir.
  const [tokenLink] = useState(() => new URLSearchParams(hash.slice(1)).get('token') || '');
  useEffect(() => {
    if (hash) window.history.replaceState(null, '', window.location.pathname);
  }, [hash]);
  const [v, setV] = useState({ password: '', confirmPassword: '' });
  const [erros, setErros] = useState({});
  const [erro, setErro] = useState('');
  const [ok, setOk] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    const f = {};
    if (!REGRAS_SENHA.every((r) => r.teste(v.password))) f.password = 'A senha não atende aos requisitos.';
    if (v.password !== v.confirmPassword) f.confirmPassword = 'A confirmação não confere com a senha.';
    setErros(f);
    setErro('');
    if (Object.keys(f).length) return;
    setEnviando(true);
    try {
      await api.redefinirSenha({ token: tokenLink, ...v });
      setOk(true);
    } catch (err) {
      if (Object.keys(err.campos ?? {}).length) setErros(err.campos);
      else setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  if (!tokenLink) {
    return (
      <Moldura titulo="Link inválido" texto="Este link de redefinição está incompleto. Peça um novo link." rodape={<Link to="/conta/entrar">Voltar para entrar</Link>}>
        <Link to="/conta/esqueci-senha" className="botao botao--primario conta__enviar">
          Pedir novo link
        </Link>
      </Moldura>
    );
  }
  if (ok) {
    return (
      <Moldura titulo="Senha redefinida" texto="Sua nova senha já vale. Por segurança, as sessões abertas em outros aparelhos foram encerradas.">
        <Link to="/conta/entrar" className="botao botao--primario conta__enviar">
          <LogIn size={18} aria-hidden="true" /> Entrar
        </Link>
      </Moldura>
    );
  }
  return (
    <Moldura titulo="Criar nova senha" rodape={<Link to="/conta/entrar">Voltar para entrar</Link>}>
      <form className="conta__form" onSubmit={enviar} noValidate>
        <fieldset disabled={enviando}>
          <Campo id="nova-senha" rotulo="Nova senha" type="password" autoComplete="new-password" value={v.password} erro={erros.password} onChange={(e) => setV({ ...v, password: e.target.value })} />
          <Campo id="nova-confirmar" rotulo="Confirme a nova senha" type="password" autoComplete="new-password" value={v.confirmPassword} erro={erros.confirmPassword} onChange={(e) => setV({ ...v, confirmPassword: e.target.value })} />
          <RegrasSenha senha={v.password} />
        </fieldset>
        <Aviso>
          {erro}
          {erro && (
            <>
              {' '}
              <Link to="/conta/esqueci-senha">Pedir novo link</Link>
            </>
          )}
        </Aviso>
        <BotaoEnviar enviando={enviando} icone={KeyRound} textoEnviando="Salvando…">
          Salvar nova senha
        </BotaoEnviar>
      </form>
    </Moldura>
  );
}

// ---------------------------------------------------------------------------
// Minha conta
// ---------------------------------------------------------------------------
const ABAS = [
  { id: 'perfil', rotulo: 'Meu perfil', icone: UserRound },
  { id: 'assinaturas', rotulo: 'Minhas assinaturas', icone: Repeat },
  { id: 'plataformas', rotulo: 'Minhas plataformas', icone: Boxes },
  { id: 'dados', rotulo: 'Atualizar dados', icone: Save },
  { id: 'senha', rotulo: 'Senha', icone: ShieldCheck },
  { id: 'contato', rotulo: 'Entrar em contato', icone: MessageCircle },
];

const fmtData = (iso) => (iso ? new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : '—');

export function MinhaConta() {
  useSeo({ titulo: 'Minha conta', caminho: '/conta', noindex: true, descricao: 'Área do cliente da Alex Sousa Tech.' });
  const { estado, cliente, sair, novaConta } = useConta();
  const [aba, setAba] = useState('perfil');
  if (estado === 'carregando') return <Carregando />;
  if (estado !== 'logado') return <Navigate to="/conta/entrar" replace />;

  return (
    <section className="conta conta--painel" aria-labelledby="conta-titulo">
      <header className="conta__topo">
        <div>
          <h1 id="conta-titulo">Olá, {cliente.name.split(' ')[0]}</h1>
          <p className="conta__texto">{novaConta ? 'Sua conta foi criada. Enviamos um e-mail de boas-vindas.' : 'Esta é a sua área do cliente na Alex Sousa Tech.'}</p>
        </div>
        <button type="button" className="botao botao--contorno botao--p" onClick={sair}>
          <LogOut size={16} aria-hidden="true" /> Sair
        </button>
      </header>
      <div className="conta__grade">
        <nav className="conta__abas" aria-label="Seções da conta">
          {ABAS.map(({ id, rotulo, icone: Icone }) => (
            <button key={id} type="button" className={`conta__aba${aba === id ? ' conta__aba--ativa' : ''}`} aria-current={aba === id ? 'page' : undefined} onClick={() => setAba(id)}>
              <Icone size={17} aria-hidden="true" /> {rotulo}
            </button>
          ))}
        </nav>
        <div className="conta__cartao conta__cartao--largo">
          {aba === 'perfil' && <Perfil cliente={cliente} />}
          {aba === 'assinaturas' && <MinhasAssinaturas irParaDados={() => setAba('dados')} />}
          {aba === 'plataformas' && <MinhasPlataformas />}
          {aba === 'dados' && <AtualizarDados />}
          {aba === 'senha' && <TrocarSenha />}
          {aba === 'contato' && <Contato />}
        </div>
      </div>
    </section>
  );
}

function Perfil({ cliente }) {
  return (
    <>
      <h2>Meu perfil</h2>
      <dl className="conta__dados">
        <div>
          <dt>Nome</dt>
          <dd>{cliente.name}</dd>
        </div>
        <div>
          <dt>E-mail</dt>
          <dd>{cliente.email}</dd>
        </div>
        <div>
          <dt>Telefone</dt>
          <dd className="num">{mascaraTelefone(cliente.phone)}</dd>
        </div>
        <div>
          <dt>CPF</dt>
          <dd className="num">{cliente.cpf ? mascaraCPF(cliente.cpf) : 'Não informado'}</dd>
        </div>
        <div>
          <dt>Cliente desde</dt>
          <dd>{fmtData(cliente.createdAt)}</dd>
        </div>
      </dl>
      <p className="conta__dica">Veja seus planos em "Minhas assinaturas" e o que está liberado em "Minhas plataformas".</p>
    </>
  );
}

function AtualizarDados() {
  const { cliente, setCliente, perdeuSessao } = useConta();
  const [v, setV] = useState({ name: cliente.name, phone: mascaraTelefone(cliente.phone), cpf: '', currentPassword: '' });
  const [erros, setErros] = useState({});
  const [erro, setErro] = useState('');
  const [ok, setOk] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setErro('');
    setOk('');
    const corpo = { name: v.name.trim(), phone: v.phone };
    if (!cliente.cpf && v.cpf) Object.assign(corpo, { cpf: v.cpf, currentPassword: v.currentPassword });
    setEnviando(true);
    try {
      const c = await api.atualizarDados(corpo);
      setCliente(c);
      setErros({});
      setV((x) => ({ ...x, cpf: '', currentPassword: '' }));
      setOk('Dados atualizados.');
    } catch (err) {
      if (err.status === 401 || err.status === 403) return perdeuSessao();
      if (Object.keys(err.campos ?? {}).length) setErros(err.campos);
      else setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <h2>Atualizar dados</h2>
      <form className="conta__form" onSubmit={enviar} noValidate>
        <fieldset disabled={enviando} className="orc-grade">
          <Campo id="dados-nome" rotulo="Nome completo" largo autoComplete="name" maxLength={120} value={v.name} erro={erros.name} onChange={(e) => setV({ ...v, name: e.target.value })} />
          <Campo id="dados-telefone" rotulo="Telefone" type="tel" autoComplete="tel" value={v.phone} erro={erros.phone} onChange={(e) => setV({ ...v, phone: mascaraTelefone(e.target.value) })} />
          <div className="campo">
            <span className="conta__rotulo">E-mail</span>
            <p className="conta__fixo">{cliente.email}</p>
            <p className="conta__dica">Para trocar o e-mail, fale com a gente.</p>
          </div>
          {cliente.cpf ? (
            <div className="campo">
              <span className="conta__rotulo">CPF</span>
              <p className="conta__fixo num">{mascaraCPF(cliente.cpf)}</p>
              <p className="conta__dica">Para corrigir o CPF, fale com a gente.</p>
            </div>
          ) : (
            <>
              <Campo id="dados-cpf" rotulo="CPF" inputMode="numeric" placeholder="000.000.000-00" value={v.cpf} erro={erros.cpf} dica="Necessário para cobranças. Só pode ser informado uma vez." onChange={(e) => setV({ ...v, cpf: mascaraCPF(e.target.value) })} />
              {v.cpf && <Campo id="dados-senha" rotulo="Senha atual (para confirmar o CPF)" type="password" autoComplete="current-password" value={v.currentPassword} erro={erros.currentPassword} onChange={(e) => setV({ ...v, currentPassword: e.target.value })} />}
            </>
          )}
        </fieldset>
        <Aviso>{erro}</Aviso>
        <Aviso tipo="ok">{ok}</Aviso>
        <BotaoEnviar enviando={enviando} icone={Save} textoEnviando="Salvando…">
          Salvar dados
        </BotaoEnviar>
      </form>
    </>
  );
}

function TrocarSenha() {
  const { perdeuSessao } = useConta();
  const vazio = { currentPassword: '', newPassword: '', confirmPassword: '' };
  const [v, setV] = useState(vazio);
  const [erros, setErros] = useState({});
  const [erro, setErro] = useState('');
  const [ok, setOk] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    const f = {};
    if (!v.currentPassword) f.currentPassword = 'Informe a senha atual.';
    if (!REGRAS_SENHA.every((r) => r.teste(v.newPassword))) f.newPassword = 'A nova senha não atende aos requisitos.';
    if (v.newPassword !== v.confirmPassword) f.confirmPassword = 'A confirmação não confere com a nova senha.';
    setErros(f);
    setErro('');
    setOk('');
    if (Object.keys(f).length) return;
    setEnviando(true);
    try {
      await api.trocarSenha(v);
      setV(vazio);
      setOk('Senha alterada. As sessões em outros aparelhos foram encerradas.');
    } catch (err) {
      if (err.status === 401 || err.status === 403) return perdeuSessao();
      if (Object.keys(err.campos ?? {}).length) setErros(err.campos);
      else setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <h2>Trocar senha</h2>
      <form className="conta__form" onSubmit={enviar} noValidate>
        <fieldset disabled={enviando}>
          <Campo id="senha-atual" rotulo="Senha atual" type="password" autoComplete="current-password" value={v.currentPassword} erro={erros.currentPassword} onChange={(e) => setV({ ...v, currentPassword: e.target.value })} />
          <Campo id="senha-nova" rotulo="Nova senha" type="password" autoComplete="new-password" value={v.newPassword} erro={erros.newPassword} onChange={(e) => setV({ ...v, newPassword: e.target.value })} />
          <Campo id="senha-confirmar" rotulo="Confirme a nova senha" type="password" autoComplete="new-password" value={v.confirmPassword} erro={erros.confirmPassword} onChange={(e) => setV({ ...v, confirmPassword: e.target.value })} />
          <RegrasSenha senha={v.newPassword} />
        </fieldset>
        <Aviso>{erro}</Aviso>
        <Aviso tipo="ok">{ok}</Aviso>
        <BotaoEnviar enviando={enviando} icone={KeyRound} textoEnviando="Salvando…">
          Trocar senha
        </BotaoEnviar>
      </form>
    </>
  );
}

function Contato() {
  const { cliente } = useConta();
  return (
    <>
      <h2>Entrar em contato</h2>
      <p className="conta__texto">Fale com a equipe da Alex Sousa Tech pelo canal que preferir.</p>
      <div className="conta__contatos">
        <a className="botao botao--primario" href={linkWhatsapp(`Olá! Sou ${cliente.name} e tenho uma conta na área do cliente.`)} target="_blank" rel="noopener noreferrer">
          <MessageCircle size={18} aria-hidden="true" /> WhatsApp {CONTATO.whatsappRotulo}
        </a>
        <a className="botao botao--contorno" href={`mailto:${CONTATO.email}`}>
          <Mail size={18} aria-hidden="true" /> {CONTATO.email}
        </a>
      </div>
    </>
  );
}

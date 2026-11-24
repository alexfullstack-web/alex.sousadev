import { useEffect, useState } from 'react';
import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Boxes,
  CalendarDays,
  Check,
  ChevronRight,
  CreditCard,
  Eye,
  EyeOff,
  Fingerprint,
  House,
  IdCard,
  KeyRound,
  LayoutDashboard,
  Lock,
  LogIn,
  LogOut,
  Mail,
  MailCheck,
  Menu,
  MessageCircle,
  PencilLine,
  Phone,
  Receipt,
  Repeat,
  Save,
  ShieldCheck,
  UserPlus,
  UserRound,
  X,
} from 'lucide-react';
import Logo from '../components/Logo.jsx';
import Aviso from '../components/ui/Aviso.jsx';
import Cartao from '../components/ui/Cartao.jsx';
import { CarregandoTexto } from '../components/ui/Carregando.jsx';
import { CONTATO, EMPRESA, linkWhatsapp } from '../data/empresa.js';
import { CAMINHO_PRIVACIDADE, CAMINHO_TERMOS } from '../data/legal.js';
import { useSeo } from '../hooks/useSeo.js';
import * as api from './api.js';
import { MeusPagamentos, MinhasAssinaturas, MinhasPlataformas, useCarregar } from './Assinaturas.jsx';
import { ContaProvider, useConta } from './ContaContext.jsx';
import '../styles/conta.css';

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

// Campo com ícone, mensagens de erro/dica ligadas por aria-describedby e,
// para senhas, botão de mostrar/ocultar.
function Campo({ id, rotulo, erro, dica, largo, icone: Icone, type = 'text', ...props }) {
  const [visivel, setVisivel] = useState(false);
  const senha = type === 'password';
  const ids = [erro && `${id}-erro`, dica && `${id}-dica`].filter(Boolean).join(' ') || undefined;
  return (
    <div className={`campo${largo ? ' campo--largo' : ''}`}>
      <label htmlFor={id}>{rotulo}</label>
      <div className={`campo__controle${Icone ? ' campo__controle--icone' : ''}${senha ? ' campo__controle--acao' : ''}`}>
        {Icone && <Icone size={18} className="campo__icone" aria-hidden="true" />}
        <input id={id} type={senha && visivel ? 'text' : type} aria-invalid={Boolean(erro)} aria-describedby={ids} {...props} />
        {senha && (
          <button type="button" className="campo__acao" onClick={() => setVisivel((x) => !x)} aria-label={visivel ? 'Ocultar senha' : 'Mostrar senha'} aria-pressed={visivel} aria-controls={id}>
            {visivel ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
          </button>
        )}
      </div>
      {dica && !erro && (
        <p className="campo__dica" id={`${id}-dica`}>
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

// Requisitos da senha e uma barra de força que só conta esses mesmos requisitos.
function RegrasSenha({ senha }) {
  const atendidos = REGRAS_SENHA.filter((r) => r.teste(senha)).length;
  return (
    <div className="regras-senha">
      <div className="forca" data-nivel={senha ? atendidos : 0} aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
      <ul className="regras" aria-label="Requisitos da senha">
        {REGRAS_SENHA.map((r) => (
          <li key={r.texto} className={r.teste(senha) ? 'ok' : undefined}>
            <span className="regras__marca">
              <Check size={12} strokeWidth={3} aria-hidden="true" />
            </span>
            {r.texto}
          </li>
        ))}
      </ul>
    </div>
  );
}

function BotaoEnviar({ enviando, icone: Icone, children, textoEnviando = 'Enviando…' }) {
  return (
    <button type="submit" className="btn btn--primario btn--g btn--bloco" disabled={enviando} aria-busy={enviando}>
      {enviando ? <span className="btn__carregando" aria-hidden="true" /> : <Icone size={18} aria-hidden="true" />}
      {enviando ? textoEnviando : children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Moldura das telas de autenticação: painel da marca + cartão do formulário
// ---------------------------------------------------------------------------
const VANTAGENS = [
  { icone: Repeat, texto: 'Acompanhe suas assinaturas e pagamentos' },
  { icone: Boxes, texto: 'Acesse as plataformas liberadas para você' },
  { icone: ShieldCheck, texto: 'Mantenha seus dados e sua senha em dia' },
];

function Moldura({ titulo, texto, icone: Icone = UserRound, children, rodape, tom }) {
  return (
    <div className="auth">
      <header className="auth__topo">
        <Logo />
        <Link to="/" className="btn btn--fantasma btn--p">
          <ArrowLeft size={16} aria-hidden="true" /> <span>Voltar ao site</span>
        </Link>
      </header>
      <div className="auth__grade">
        <aside className="auth__lado" aria-label={`Sobre a área do cliente da ${EMPRESA.nome}`}>
          <div className="auth__decoracao" aria-hidden="true">
            <span className="auth__orbita" />
            <span className="auth__orbita auth__orbita--2" />
            <span className="auth__nucleo">
              <img src="/img/site/logo-as.webp" alt="" width="240" height="141" />
            </span>
          </div>
          <span className="rotulo">Área do cliente</span>
          <p className="auth__lado-titulo">
            Tudo da sua conta <span className="texto-gradiente">em um só lugar</span>.
          </p>
          <ul className="auth__vantagens">
            {VANTAGENS.map(({ icone: I, texto: t }) => (
              <li key={t}>
                <span className="icone-caixa icone-caixa--p">
                  <I size={17} strokeWidth={1.8} aria-hidden="true" />
                </span>
                {t}
              </li>
            ))}
          </ul>
          <p className="auth__slogan">{EMPRESA.slogan}</p>
        </aside>

        <section className="auth__cartao" aria-labelledby="conta-titulo">
          <span className={`auth__icone${tom === 'ok' ? ' auth__icone--ok' : tom === 'erro' ? ' auth__icone--erro' : ''}`} aria-hidden="true">
            <Icone size={24} strokeWidth={1.8} />
          </span>
          <h1 id="conta-titulo">{titulo}</h1>
          {texto && <p className="auth__texto">{texto}</p>}
          {children}
          {rodape && <div className="auth__rodape">{rodape}</div>}
        </section>
      </div>
    </div>
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

// Tela de carregamento da área do cliente (enquanto a sessão é recuperada pelo cookie).
function Carregando() {
  return (
    <section className="conta-carregando" aria-busy="true" role="status">
      <div className="conta-carregando__marca" aria-hidden="true">
        <span className="conta-carregando__anel" />
        <img src="/img/site/logo-as.webp" alt="" width="240" height="141" />
      </div>
      <p>Carregando sua conta…</p>
      <div className="barra-carregando" aria-hidden="true" />
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
        titulo="Bem-vindo de volta"
        texto="Entre com o e-mail e a senha da sua conta."
        icone={LogIn}
        rodape={
          <p>
            Ainda não tem conta? <Link to="/conta/cadastro">Criar conta</Link>
          </p>
        }
      >
        <form className="form" onSubmit={enviar} noValidate>
          <fieldset disabled={enviando} className="form">
            <Campo id="entrar-email" rotulo="E-mail" icone={Mail} type="email" autoComplete="email" inputMode="email" placeholder="voce@email.com" value={v.email} erro={erros.email} onChange={(e) => setV({ ...v, email: e.target.value })} />
            <div className="auth__senha">
              <Campo id="entrar-senha" rotulo="Senha" icone={Lock} type="password" autoComplete="current-password" value={v.password} erro={erros.password} onChange={(e) => setV({ ...v, password: e.target.value })} />
              <Link to="/conta/esqueci-senha" className="auth__esqueci">
                Esqueci minha senha
              </Link>
            </div>
          </fieldset>
          <Aviso>{erro}</Aviso>
          <BotaoEnviar enviando={enviando} icone={LogIn} textoEnviando="Entrando…">
            Entrar
          </BotaoEnviar>
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
        icone={UserPlus}
        rodape={
          <p>
            Já tem conta? <Link to="/conta/entrar">Entrar</Link>
          </p>
        }
      >
        <form className="form" onSubmit={enviar} noValidate>
          <fieldset disabled={enviando} className="form-grade">
            <Campo id="cad-nome" rotulo="Nome completo *" icone={UserRound} largo autoComplete="name" maxLength={120} value={v.name} erro={erros.name} onChange={muda('name')} />
            <Campo id="cad-email" rotulo="E-mail *" icone={Mail} type="email" autoComplete="email" inputMode="email" maxLength={160} value={v.email} erro={erros.email} onChange={muda('email')} />
            <Campo id="cad-telefone" rotulo="Telefone *" icone={Phone} type="tel" autoComplete="tel" inputMode="tel" placeholder="(00) 00000-0000" value={v.phone} erro={erros.phone} onChange={muda('phone', mascaraTelefone)} />
            <Campo id="cad-cpf" rotulo="CPF" icone={IdCard} largo inputMode="numeric" placeholder="000.000.000-00" value={v.cpf} erro={erros.cpf} dica="Opcional agora. Será pedido para gerar cobranças." onChange={muda('cpf', mascaraCPF)} />
            <Campo id="cad-senha" rotulo="Senha *" icone={Lock} type="password" autoComplete="new-password" value={v.password} erro={erros.password} onChange={muda('password')} />
            <Campo id="cad-confirmar" rotulo="Confirme a senha *" icone={Lock} type="password" autoComplete="new-password" value={v.confirmPassword} erro={erros.confirmPassword} onChange={muda('confirmPassword')} />
            <div className="campo--largo">
              <RegrasSenha senha={v.password} />
            </div>
            <div className="campo--largo">
              <label className={`check${erros.acceptTerms ? ' check--erro' : ''}`}>
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

  const voltar = (
    <Link to="/conta/entrar" className="auth__voltar">
      <ArrowLeft size={16} aria-hidden="true" /> Voltar para entrar
    </Link>
  );

  if (ok) {
    return (
      <Moldura titulo="Confira seu e-mail" icone={MailCheck} tom="ok" rodape={voltar}>
        <Aviso tipo="ok">
          <p>{ok}</p>
          <p>O link vale por 30 minutos. Confira também a caixa de spam.</p>
        </Aviso>
      </Moldura>
    );
  }

  return (
    <Moldura titulo="Recuperar senha" texto="Informe o e-mail da sua conta. Enviaremos um link para você criar uma nova senha." icone={KeyRound} rodape={voltar}>
      <form className="form" onSubmit={enviar} noValidate>
        <fieldset disabled={enviando} className="form">
          <Campo id="esqueci-email" rotulo="E-mail" icone={Mail} type="email" autoComplete="email" inputMode="email" placeholder="voce@email.com" value={email} erro={erroCampo} onChange={(e) => setEmail(e.target.value)} />
        </fieldset>
        <Aviso>{erro}</Aviso>
        <BotaoEnviar enviando={enviando} icone={Mail}>
          Enviar link
        </BotaoEnviar>
      </form>
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

  const voltar = (
    <Link to="/conta/entrar" className="auth__voltar">
      <ArrowLeft size={16} aria-hidden="true" /> Voltar para entrar
    </Link>
  );

  if (!tokenLink) {
    return (
      <Moldura titulo="Link inválido" texto="Este link de redefinição está incompleto. Peça um novo link." icone={X} tom="erro" rodape={voltar}>
        <Link to="/conta/esqueci-senha" className="btn btn--primario btn--g btn--bloco">
          <KeyRound size={18} aria-hidden="true" /> Pedir novo link
        </Link>
      </Moldura>
    );
  }
  if (ok) {
    return (
      <Moldura titulo="Senha redefinida" texto="Sua nova senha já vale. Por segurança, as sessões abertas em outros aparelhos foram encerradas." icone={BadgeCheck} tom="ok">
        <Link to="/conta/entrar" className="btn btn--primario btn--g btn--bloco">
          <LogIn size={18} aria-hidden="true" /> Entrar
        </Link>
      </Moldura>
    );
  }
  return (
    <Moldura titulo="Criar nova senha" texto="Escolha uma senha forte que você ainda não usou nesta conta." icone={Fingerprint} rodape={voltar}>
      <form className="form" onSubmit={enviar} noValidate>
        <fieldset disabled={enviando} className="form">
          <Campo id="nova-senha" rotulo="Nova senha" icone={Lock} type="password" autoComplete="new-password" value={v.password} erro={erros.password} onChange={(e) => setV({ ...v, password: e.target.value })} />
          <Campo id="nova-confirmar" rotulo="Confirme a nova senha" icone={Lock} type="password" autoComplete="new-password" value={v.confirmPassword} erro={erros.confirmPassword} onChange={(e) => setV({ ...v, confirmPassword: e.target.value })} />
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
// Minha conta: plataforma com menu lateral
// ---------------------------------------------------------------------------
const ABAS = [
  { id: 'painel', rotulo: 'Painel', icone: LayoutDashboard, grupo: 'Visão geral' },
  { id: 'perfil', rotulo: 'Meu perfil', icone: UserRound, grupo: 'Visão geral' },
  { id: 'assinaturas', rotulo: 'Minhas assinaturas', icone: Repeat, grupo: 'Serviços' },
  { id: 'plataformas', rotulo: 'Minhas plataformas', icone: Boxes, grupo: 'Serviços' },
  { id: 'pagamentos', rotulo: 'Meus pagamentos', icone: Receipt, grupo: 'Serviços' },
  { id: 'dados', rotulo: 'Dados da conta', icone: PencilLine, grupo: 'Conta' },
  { id: 'senha', rotulo: 'Segurança', icone: ShieldCheck, grupo: 'Conta' },
  { id: 'contato', rotulo: 'Entrar em contato', icone: MessageCircle, grupo: 'Conta' },
];
const GRUPOS = [...new Set(ABAS.map((a) => a.grupo))];
const FINAIS = ['CANCELED', 'ENDED'];

const fmtData = (iso) => (iso ? new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : '—');
const iniciais = (nome = '') =>
  nome
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('') || '?';

function Avatar({ nome, grande = false }) {
  return (
    <span className={`avatar${grande ? ' avatar--g' : ''}`} aria-hidden="true">
      {iniciais(nome)}
    </span>
  );
}

// Aba pedida por link (ex.: "Contratar" em /planos → /conta?aba=assinaturas). Fica guardada enquanto a
// pessoa entra ou cria a conta, e é usada uma vez ao abrir a área do cliente.
let abaPedida = null;

export function MinhaConta() {
  useSeo({ titulo: 'Minha conta', caminho: '/conta', noindex: true, descricao: 'Área do cliente da Alex Sousa Tech.' });
  const { estado, cliente, sair, novaConta } = useConta();
  const pedida = new URLSearchParams(useLocation().search).get('aba');
  if (pedida && ABAS.some((a) => a.id === pedida)) abaPedida = pedida;
  const [aba, setAba] = useState(() => abaPedida || 'painel');
  const [menuAberto, setMenuAberto] = useState(false);
  const [saindo, setSaindo] = useState(false);
  useEffect(() => {
    if (estado !== 'logado' || !abaPedida) return;
    setAba(abaPedida);
    abaPedida = null;
  }, [estado]);
  // Menu do celular: Esc fecha e a página não rola por trás.
  useEffect(() => {
    if (!menuAberto) return undefined;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const tecla = (e) => e.key === 'Escape' && setMenuAberto(false);
    document.addEventListener('keydown', tecla);
    return () => {
      document.body.style.overflow = anterior;
      document.removeEventListener('keydown', tecla);
    };
  }, [menuAberto]);
  if (estado === 'carregando') return <Carregando />;
  if (estado !== 'logado') return <Navigate to="/conta/entrar" replace />;

  const atual = ABAS.find((a) => a.id === aba) ?? ABAS[0];
  const irPara = (id) => {
    setAba(id);
    setMenuAberto(false);
    window.scrollTo({ top: 0 });
  };
  async function encerrar() {
    setSaindo(true);
    await sair();
  }

  return (
    <div className={`painel${menuAberto ? ' painel--menu' : ''}`}>
      <aside className="painel__lateral" id="menu-conta" aria-label="Menu da área do cliente">
        <div className="painel__lateral-topo">
          <Logo compacto />
          <button type="button" className="painel__fechar" onClick={() => setMenuAberto(false)} aria-label="Fechar menu">
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="painel__usuario">
          <Avatar nome={cliente.name} />
          <div>
            <p className="painel__usuario-nome">{cliente.name}</p>
            <p className="painel__usuario-email">{cliente.email}</p>
          </div>
        </div>

        <nav className="painel__nav" aria-label="Seções da conta">
          {GRUPOS.map((g) => (
            <div key={g} className="painel__grupo">
              <p className="painel__grupo-titulo">{g}</p>
              {ABAS.filter((a) => a.grupo === g).map(({ id, rotulo, icone: Icone }) => (
                <button key={id} type="button" className={`painel__item${aba === id ? ' painel__item--ativo' : ''}`} aria-current={aba === id ? 'page' : undefined} onClick={() => irPara(id)}>
                  <Icone size={18} strokeWidth={1.8} aria-hidden="true" /> {rotulo}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="painel__lateral-base">
          <Link to="/" className="painel__item">
            <House size={18} strokeWidth={1.8} aria-hidden="true" /> Voltar ao site
          </Link>
          <button type="button" className="painel__item painel__item--sair" onClick={encerrar} disabled={saindo}>
            {saindo ? <span className="btn__carregando" aria-hidden="true" /> : <LogOut size={18} strokeWidth={1.8} aria-hidden="true" />} {saindo ? 'Saindo…' : 'Sair da conta'}
          </button>
        </div>
      </aside>
      <button type="button" className="painel__veu" aria-label="Fechar menu" tabIndex={-1} onClick={() => setMenuAberto(false)} />

      <div className="painel__principal">
        <header className="painel__topo">
          <button type="button" className="painel__abrir" onClick={() => setMenuAberto(true)} aria-label="Abrir menu da conta" aria-expanded={menuAberto} aria-controls="menu-conta">
            <Menu size={20} aria-hidden="true" />
          </button>
          <div className="painel__saudacao">
            <p className="painel__trilha">
              Área do cliente <ChevronRight size={13} aria-hidden="true" /> <span>{atual.rotulo}</span>
            </p>
            <h1 id="conta-titulo">Olá, {cliente.name.split(' ')[0]}</h1>
          </div>
          <div className="painel__topo-acoes">
            <Link to="/" className="btn btn--fantasma btn--p painel__site">
              <House size={16} aria-hidden="true" /> <span>Site</span>
            </Link>
            <button type="button" className="painel__perfil" onClick={() => irPara('perfil')} aria-label="Abrir meu perfil">
              <Avatar nome={cliente.name} />
            </button>
          </div>
        </header>

        {novaConta && (
          <Aviso tipo="ok" className="painel__boas-vindas">
            Sua conta foi criada. Enviamos um e-mail de boas-vindas.
          </Aviso>
        )}

        <div key={aba} className="painel__conteudo">
          {aba === 'painel' && <Resumo cliente={cliente} irPara={irPara} />}
          {aba === 'perfil' && <Perfil cliente={cliente} irPara={irPara} />}
          {aba === 'assinaturas' && <MinhasAssinaturas irParaDados={() => irPara('dados')} />}
          {aba === 'plataformas' && <MinhasPlataformas />}
          {aba === 'pagamentos' && <MeusPagamentos />}
          {aba === 'dados' && <AtualizarDados />}
          {aba === 'senha' && <TrocarSenha />}
          {aba === 'contato' && <Contato />}
        </div>
      </div>
    </div>
  );
}

// Indicador do painel: o valor vem do servidor; enquanto carrega, aparece um esqueleto.
function Indicador({ icone: Icone, rotulo, valor, detalhe, carregando, erro, verde, onClick }) {
  return (
    <Cartao as="li" interativo className="indicador">
      <div className="indicador__topo">
        <span className={`icone-caixa icone-caixa--p${verde ? ' icone-caixa--verde' : ''}`}>
          <Icone size={18} strokeWidth={1.8} aria-hidden="true" />
        </span>
        <span className="indicador__rotulo">{rotulo}</span>
      </div>
      {carregando ? (
        <span className="esqueleto esqueleto--linha indicador__esqueleto" aria-label="Carregando" />
      ) : erro ? (
        <p className="indicador__erro">Não foi possível carregar.</p>
      ) : (
        <p className="indicador__valor num">{valor}</p>
      )}
      {detalhe && <p className="indicador__detalhe">{detalhe}</p>}
      {onClick && (
        <button type="button" className="cartao__link" onClick={onClick}>
          <span className="sr-only">Ver {rotulo.toLowerCase()}</span>
        </button>
      )}
    </Cartao>
  );
}

function Resumo({ cliente, irPara }) {
  const [assinaturas] = useCarregar(api.minhasAssinaturas);
  const [plataformas] = useCarregar(api.minhasPlataformas);
  const emAndamento = (assinaturas.dados ?? []).filter((s) => !FINAIS.includes(s.status));
  const liberadas = (plataformas.dados ?? []).filter((p) => p.access);
  const pendentes = emAndamento.filter((s) => ['AWAITING_PAYMENT', 'OVERDUE', 'SUSPENDED'].includes(s.status) || (s.status === 'ACTIVE' && !s.access?.granted));

  const ATALHOS = [
    { id: 'assinaturas', icone: CreditCard, titulo: 'Contratar um plano', texto: 'Veja os planos disponíveis e contrate pela área do cliente.' },
    { id: 'dados', icone: PencilLine, titulo: 'Atualizar dados', texto: 'Nome, telefone e CPF para cobranças.' },
    { id: 'senha', icone: KeyRound, titulo: 'Trocar senha', texto: 'Mantenha o acesso à sua conta seguro.' },
    { id: 'contato', icone: MessageCircle, titulo: 'Falar com a equipe', texto: 'WhatsApp ou e-mail da Alex Sousa Tech.' },
  ];

  return (
    <>
      <section className="painel__secao" aria-labelledby="resumo-titulo">
        <h2 id="resumo-titulo" className="painel__titulo">
          Visão geral
        </h2>
        <ul className="indicadores">
          <Indicador
            icone={Repeat}
            rotulo="Assinaturas em andamento"
            valor={emAndamento.length}
            detalhe={pendentes.length ? `${pendentes.length} precisa${pendentes.length > 1 ? 'm' : ''} de atenção` : null}
            carregando={assinaturas.carregando && !assinaturas.dados}
            erro={Boolean(assinaturas.erro)}
            onClick={() => irPara('assinaturas')}
          />
          <Indicador
            icone={Boxes}
            rotulo="Plataformas liberadas"
            valor={liberadas.length}
            detalhe={plataformas.dados ? `de ${plataformas.dados.length} disponíve${plataformas.dados.length === 1 ? 'l' : 'is'}` : null}
            carregando={plataformas.carregando && !plataformas.dados}
            erro={Boolean(plataformas.erro)}
            verde
            onClick={() => irPara('plataformas')}
          />
          <Indicador icone={CalendarDays} rotulo="Cliente desde" valor={fmtData(cliente.createdAt)} onClick={() => irPara('perfil')} />
        </ul>
        {pendentes.length > 0 && (
          <Aviso tipo="alerta">
            <p>Há assinatura aguardando pagamento ou com pagamento em atraso.</p>
            <div>
              <button type="button" className="btn btn--contorno btn--p" onClick={() => irPara('assinaturas')}>
                Ver assinaturas <ArrowRight size={15} aria-hidden="true" />
              </button>
            </div>
          </Aviso>
        )}
      </section>

      <section className="painel__secao" aria-labelledby="atalhos-titulo">
        <h2 id="atalhos-titulo" className="painel__titulo">
          Atalhos
        </h2>
        <ul className="grade grade--2 atalhos">
          {ATALHOS.map(({ id, icone: I, titulo, texto }, i) => (
            <li key={id}>
              <Cartao interativo className="atalho">
                <span className={`icone-caixa icone-caixa--p${i % 2 ? ' icone-caixa--verde' : ''}`}>
                  <I size={18} strokeWidth={1.8} aria-hidden="true" />
                </span>
                <div>
                  <h3>{titulo}</h3>
                  <p>{texto}</p>
                </div>
                <ChevronRight size={18} className="atalho__seta" aria-hidden="true" />
                <button type="button" className="cartao__link" onClick={() => irPara(id)}>
                  <span className="sr-only">{titulo}</span>
                </button>
              </Cartao>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function Perfil({ cliente, irPara }) {
  return (
    <>
      <Cartao destaque className="perfil-topo">
        <Avatar nome={cliente.name} grande />
        <div className="perfil-topo__texto">
          <h2>{cliente.name}</h2>
          <p>{cliente.email}</p>
          <div className="perfil-topo__selos">
            <span className="selo selo--ok">Conta ativa</span>
            <span className="selo selo--info">Cliente desde {fmtData(cliente.createdAt)}</span>
          </div>
        </div>
        <button type="button" className="btn btn--contorno btn--p perfil-topo__editar" onClick={() => irPara('dados')}>
          <PencilLine size={16} aria-hidden="true" /> Editar perfil
        </button>
      </Cartao>

      <div className="perfil-grade">
        <Cartao className="perfil-cartao">
          <h3 className="painel__subtitulo">
            <IdCard size={18} aria-hidden="true" /> Informações cadastrais
          </h3>
          <dl className="dados">
            <div>
              <dt>
                <UserRound size={15} aria-hidden="true" /> Nome
              </dt>
              <dd>{cliente.name}</dd>
            </div>
            <div>
              <dt>
                <Mail size={15} aria-hidden="true" /> E-mail
              </dt>
              <dd>{cliente.email}</dd>
            </div>
            <div>
              <dt>
                <Phone size={15} aria-hidden="true" /> Telefone
              </dt>
              <dd className="num">{mascaraTelefone(cliente.phone)}</dd>
            </div>
            <div>
              <dt>
                <IdCard size={15} aria-hidden="true" /> CPF
              </dt>
              <dd className="num">{cliente.cpf ? mascaraCPF(cliente.cpf) : 'Não informado'}</dd>
            </div>
          </dl>
        </Cartao>

        <Cartao className="perfil-cartao">
          <h3 className="painel__subtitulo">
            <ShieldCheck size={18} aria-hidden="true" /> Conta e segurança
          </h3>
          <dl className="dados">
            <div>
              <dt>
                <BadgeCheck size={15} aria-hidden="true" /> Status
              </dt>
              <dd>
                <span className="selo selo--ok">Ativa</span>
              </dd>
            </div>
            <div>
              <dt>
                <CalendarDays size={15} aria-hidden="true" /> Cliente desde
              </dt>
              <dd>{fmtData(cliente.createdAt)}</dd>
            </div>
            <div>
              <dt>
                <Lock size={15} aria-hidden="true" /> Senha
              </dt>
              <dd>
                <button type="button" className="link-botao" onClick={() => irPara('senha')}>
                  Trocar senha
                </button>
              </dd>
            </div>
          </dl>
          <p className="painel__dica">Sua sessão é mantida por um cookie protegido do servidor. Ao trocar a senha, as sessões em outros aparelhos são encerradas.</p>
        </Cartao>
      </div>
      <p className="painel__dica">Veja seus planos em "Minhas assinaturas" e o que está liberado em "Minhas plataformas".</p>
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
    <section className="painel__secao" aria-labelledby="dados-titulo">
      <h2 id="dados-titulo" className="painel__titulo">
        Dados da conta
      </h2>
      <Cartao className="painel__formulario">
        <form className="form" onSubmit={enviar} noValidate>
          <fieldset disabled={enviando} className="form-grade">
            <Campo id="dados-nome" rotulo="Nome completo" icone={UserRound} largo autoComplete="name" maxLength={120} value={v.name} erro={erros.name} onChange={(e) => setV({ ...v, name: e.target.value })} />
            <Campo id="dados-telefone" rotulo="Telefone" icone={Phone} type="tel" autoComplete="tel" value={v.phone} erro={erros.phone} onChange={(e) => setV({ ...v, phone: mascaraTelefone(e.target.value) })} />
            <div className="campo">
              <span className="campo__rotulo">E-mail</span>
              <p className="campo__fixo">{cliente.email}</p>
              <p className="campo__dica">Para trocar o e-mail, fale com a gente.</p>
            </div>
            {cliente.cpf ? (
              <div className="campo">
                <span className="campo__rotulo">CPF</span>
                <p className="campo__fixo num">{mascaraCPF(cliente.cpf)}</p>
                <p className="campo__dica">Para corrigir o CPF, fale com a gente.</p>
              </div>
            ) : (
              <>
                <Campo id="dados-cpf" rotulo="CPF" icone={IdCard} inputMode="numeric" placeholder="000.000.000-00" value={v.cpf} erro={erros.cpf} dica="Necessário para cobranças. Só pode ser informado uma vez." onChange={(e) => setV({ ...v, cpf: mascaraCPF(e.target.value) })} />
                {v.cpf && <Campo id="dados-senha" rotulo="Senha atual (para confirmar o CPF)" icone={Lock} type="password" autoComplete="current-password" value={v.currentPassword} erro={erros.currentPassword} onChange={(e) => setV({ ...v, currentPassword: e.target.value })} />}
              </>
            )}
          </fieldset>
          <Aviso>{erro}</Aviso>
          <Aviso tipo="ok">{ok}</Aviso>
          <div className="painel__acoes-form">
            <button type="submit" className="btn btn--primario" disabled={enviando}>
              {enviando ? <span className="btn__carregando" aria-hidden="true" /> : <Save size={18} aria-hidden="true" />}
              {enviando ? 'Salvando…' : 'Salvar dados'}
            </button>
          </div>
        </form>
      </Cartao>
    </section>
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
    <section className="painel__secao" aria-labelledby="senha-titulo">
      <h2 id="senha-titulo" className="painel__titulo">
        Segurança
      </h2>
      <div className="seguranca">
        <Cartao className="painel__formulario">
          <h3 className="painel__subtitulo">
            <KeyRound size={18} aria-hidden="true" /> Trocar senha
          </h3>
          <form className="form" onSubmit={enviar} noValidate>
            <fieldset disabled={enviando} className="form">
              <Campo id="senha-atual" rotulo="Senha atual" icone={Lock} type="password" autoComplete="current-password" value={v.currentPassword} erro={erros.currentPassword} onChange={(e) => setV({ ...v, currentPassword: e.target.value })} />
              <Campo id="senha-nova" rotulo="Nova senha" icone={Lock} type="password" autoComplete="new-password" value={v.newPassword} erro={erros.newPassword} onChange={(e) => setV({ ...v, newPassword: e.target.value })} />
              <Campo id="senha-confirmar" rotulo="Confirme a nova senha" icone={Lock} type="password" autoComplete="new-password" value={v.confirmPassword} erro={erros.confirmPassword} onChange={(e) => setV({ ...v, confirmPassword: e.target.value })} />
              <RegrasSenha senha={v.newPassword} />
            </fieldset>
            <Aviso>{erro}</Aviso>
            <Aviso tipo="ok">{ok}</Aviso>
            <div className="painel__acoes-form">
              <button type="submit" className="btn btn--primario" disabled={enviando}>
                {enviando ? <span className="btn__carregando" aria-hidden="true" /> : <KeyRound size={18} aria-hidden="true" />}
                {enviando ? 'Salvando…' : 'Trocar senha'}
              </button>
            </div>
          </form>
        </Cartao>
        <Cartao className="seguranca__dicas">
          <h3 className="painel__subtitulo">
            <ShieldCheck size={18} aria-hidden="true" /> Boas práticas
          </h3>
          <ul>
            <li>
              <Check size={15} strokeWidth={2.6} aria-hidden="true" /> Use uma senha que você não usa em outros sites.
            </li>
            <li>
              <Check size={15} strokeWidth={2.6} aria-hidden="true" /> Ao trocar a senha, as sessões em outros aparelhos são encerradas.
            </li>
            <li>
              <Check size={15} strokeWidth={2.6} aria-hidden="true" /> Esqueceu a senha? Use "Esqueci minha senha" na tela de entrada.
            </li>
          </ul>
        </Cartao>
      </div>
    </section>
  );
}

function Contato() {
  const { cliente } = useConta();
  return (
    <section className="painel__secao" aria-labelledby="contato-titulo">
      <h2 id="contato-titulo" className="painel__titulo">
        Entrar em contato
      </h2>
      <p className="painel__texto">Fale com a equipe da Alex Sousa Tech pelo canal que preferir.</p>
      <ul className="grade grade--2">
        <li>
          <Cartao interativo className="canal-conta" href={linkWhatsapp(`Olá! Sou ${cliente.name} e tenho uma conta na área do cliente.`)} externo rotuloLink={`WhatsApp ${CONTATO.whatsappRotulo}`}>
            <span className="icone-caixa icone-caixa--verde">
              <MessageCircle size={22} strokeWidth={1.75} aria-hidden="true" />
            </span>
            <h3>WhatsApp</h3>
            <p className="num">{CONTATO.whatsappRotulo}</p>
          </Cartao>
        </li>
        <li>
          <Cartao interativo className="canal-conta" href={`mailto:${CONTATO.email}`} rotuloLink={`E-mail ${CONTATO.email}`}>
            <span className="icone-caixa">
              <Mail size={22} strokeWidth={1.75} aria-hidden="true" />
            </span>
            <h3>E-mail</h3>
            <p className="canal-conta__email">{CONTATO.email}</p>
          </Cartao>
        </li>
      </ul>
    </section>
  );
}

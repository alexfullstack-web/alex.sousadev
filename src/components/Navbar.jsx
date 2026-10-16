import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, Send, X } from 'lucide-react';
import Logo from './Logo.jsx';

export const SECOES = [
  { id: 'inicio', rotulo: 'Início' },
  { id: 'sobre', rotulo: 'Sobre' },
  { id: 'servicos', rotulo: 'Serviços' },
  { id: 'projetos', rotulo: 'Projetos' },
  { id: 'tecnologias', rotulo: 'Tecnologias' },
  { id: 'atendimento', rotulo: 'Contato' },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const [aberto, setAberto] = useState(false);
  const [ativa, setAtiva] = useState('inicio');
  const [rolou, setRolou] = useState(false);
  const home = pathname === '/';

  useEffect(() => setAberto(false), [pathname]);
  useEffect(() => {
    const f = () => setRolou(window.scrollY > 12);
    f();
    window.addEventListener('scroll', f, { passive: true });
    return () => window.removeEventListener('scroll', f);
  }, []);
  // seção ativa (só na página inicial)
  useEffect(() => {
    if (!home || !('IntersectionObserver' in window)) return undefined;
    const io = new IntersectionObserver(
      (es) => {
        for (const e of es) if (e.isIntersecting) setAtiva(e.target.id);
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    const t = setTimeout(() => SECOES.forEach((s) => document.getElementById(s.id) && io.observe(document.getElementById(s.id))), 300);
    return () => {
      clearTimeout(t);
      io.disconnect();
    };
  }, [home]);
  useEffect(() => {
    if (!aberto) return undefined;
    const esc = (e) => e.key === 'Escape' && setAberto(false);
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [aberto]);

  const atual = (id) => {
    if (id === 'projetos' && pathname.startsWith('/projetos')) return true;
    return home && ativa === id;
  };

  return (
    <header className={`nav${rolou || !home ? ' nav--solida' : ''}`}>
      <div className="nav__dentro">
        <Logo compacta />
        <nav className={`nav__links${aberto ? ' nav__links--aberto' : ''}`} aria-label="Principal" id="menu-principal">
          {SECOES.map((s) => (
            <Link key={s.id} to={s.id === 'inicio' ? '/' : `/#${s.id}`} className={`nav__link${atual(s.id) ? ' nav__link--ativo' : ''}`} aria-current={atual(s.id) ? 'true' : undefined} onClick={() => setAberto(false)}>
              {s.rotulo}
            </Link>
          ))}
          <NavLink to="/orcamento" className="botao botao--primario nav__cta-movel">
            <Send size={16} aria-hidden="true" /> Solicitar orçamento
          </NavLink>
        </nav>
        <div className="nav__acoes">
          <Link to="/orcamento" className="botao botao--primario botao--p nav__cta">
            <Send size={15} aria-hidden="true" /> Solicitar orçamento
          </Link>
          <button type="button" className="nav__menu" onClick={() => setAberto((x) => !x)} aria-expanded={aberto} aria-controls="menu-principal" aria-label={aberto ? 'Fechar menu' : 'Abrir menu'}>
            {aberto ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
      </div>
      {aberto && <button type="button" className="nav__fundo" aria-label="Fechar menu" onClick={() => setAberto(false)} />}
    </header>
  );
}

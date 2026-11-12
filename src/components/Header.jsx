import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, Send, X } from 'lucide-react';
import { NAV } from '../data/empresa.js';
import Logo from './Logo.jsx';

// Cabeçalho fixo: transparente sobre o topo da página, sólido ao rolar.
// No celular, o menu abre em painel com foco preso, Esc fecha e a página não rola por trás.
export default function Header() {
  const [aberto, setAberto] = useState(false);
  const [rolou, setRolou] = useState(false);
  const { pathname } = useLocation();
  const painel = useRef(null);
  const botao = useRef(null);

  useEffect(() => setAberto(false), [pathname]);

  useEffect(() => {
    const aoRolar = () => setRolou(window.scrollY > 12);
    aoRolar();
    window.addEventListener('scroll', aoRolar, { passive: true });
    return () => window.removeEventListener('scroll', aoRolar);
  }, []);

  useEffect(() => {
    if (!aberto) return undefined;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focaveis = () => [...(painel.current?.querySelectorAll('a, button') ?? [])];
    focaveis()[0]?.focus();
    const tecla = (e) => {
      if (e.key === 'Escape') {
        setAberto(false);
        botao.current?.focus();
      }
      if (e.key === 'Tab') {
        const lista = [botao.current, ...focaveis()];
        const i = lista.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) {
          e.preventDefault();
          lista[lista.length - 1].focus();
        } else if (!e.shiftKey && i === lista.length - 1) {
          e.preventDefault();
          lista[0].focus();
        }
      }
    };
    document.addEventListener('keydown', tecla);
    return () => {
      document.body.style.overflow = anterior;
      document.removeEventListener('keydown', tecla);
    };
  }, [aberto]);

  return (
    <header className={`topo${rolou || aberto ? ' topo--solido' : ''}${aberto ? ' topo--aberto' : ''}`}>
      <div className="topo__barra">
        <Logo />
        <nav className="topo__nav" aria-label="Principal">
          <ul>
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} end={item.to === '/'} className="topo__link">
                  {item.rotulo}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <Link to="/orcamento" className="botao botao--primario botao--p topo__cta">
          Solicitar orçamento
        </Link>
        <button
          ref={botao}
          type="button"
          className="topo__menu"
          aria-expanded={aberto}
          aria-controls="menu-movel"
          aria-label={aberto ? 'Fechar menu' : 'Abrir menu'}
          onClick={() => setAberto((a) => !a)}
        >
          {aberto ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </button>
      </div>
      <div id="menu-movel" ref={painel} className="menu-movel" hidden={!aberto}>
        <nav aria-label="Menu do celular">
          <ul>
            {NAV.map((item, i) => (
              <li key={item.to} style={{ '--i': i }}>
                <NavLink to={item.to} end={item.to === '/'} className="menu-movel__link">
                  {item.rotulo}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <Link to="/orcamento" className="botao botao--primario menu-movel__cta">
          <Send size={18} aria-hidden="true" /> Solicitar orçamento
        </Link>
      </div>
    </header>
  );
}

import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ArrowRight, Building2, CreditCard, House, Layers, Mail, Menu, Send, UserRound, UserRoundCog, X } from 'lucide-react';
import { EMPRESA, NAV } from '../data/empresa.js';
import Logo from './Logo.jsx';

// Ícone de cada página do menu.
const ICONES = {
  '/': House,
  '/empresa': Building2,
  '/sobre-alex-sousa': UserRound,
  '/servicos': Layers,
  '/planos': CreditCard,
  '/contato': Mail,
};

// Cabeçalho fixo: transparente no topo, vidro com desfoque ao rolar, barra de progresso de leitura.
// No celular, o menu abre em painel com foco preso, Esc fecha e a página não rola por trás.
export default function Header() {
  const [aberto, setAberto] = useState(false);
  const [rolou, setRolou] = useState(false);
  const { pathname } = useLocation();
  const raiz = useRef(null);
  const painel = useRef(null);
  const botao = useRef(null);

  useEffect(() => setAberto(false), [pathname]);

  // Estado "rolou" + progresso real de leitura da página (uma atualização por quadro).
  useEffect(() => {
    let quadro = 0;
    const medir = () => {
      quadro = 0;
      const y = window.scrollY;
      setRolou(y > 12);
      const total = document.documentElement.scrollHeight - window.innerHeight;
      raiz.current?.style.setProperty('--progresso', total > 0 ? Math.min(1, y / total).toFixed(4) : '0');
    };
    const aoRolar = () => {
      if (!quadro) quadro = requestAnimationFrame(medir);
    };
    medir();
    window.addEventListener('scroll', aoRolar, { passive: true });
    window.addEventListener('resize', aoRolar, { passive: true });
    return () => {
      cancelAnimationFrame(quadro);
      window.removeEventListener('scroll', aoRolar);
      window.removeEventListener('resize', aoRolar);
    };
  }, [pathname]);

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
    <header ref={raiz} className={`topo${rolou ? ' topo--rolou' : ''}${aberto ? ' topo--aberto' : ''}`}>
      <div className="topo__barra">
        <Logo />
        <nav className="topo__nav" aria-label="Principal">
          <ul>
            {NAV.map((item) => {
              const Icone = ICONES[item.to] ?? ArrowRight;
              return (
                <li key={item.to}>
                  <NavLink to={item.to} end={item.to === '/'} className="topo__link">
                    <Icone size={16} strokeWidth={1.9} aria-hidden="true" />
                    <span>{item.rotulo}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="topo__acoes">
          <Link to="/conta" className="topo__conta" aria-label="Área do cliente">
            <UserRoundCog size={18} strokeWidth={1.9} aria-hidden="true" />
            <span>Área do cliente</span>
          </Link>
          <Link to="/orcamento" className="btn btn--primario btn--p topo__cta">
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
            <span className="topo__menu-icone" aria-hidden="true">
              {aberto ? <X size={22} /> : <Menu size={22} />}
            </span>
          </button>
        </div>
      </div>
      <span className="topo__progresso" aria-hidden="true" />

      <div id="menu-movel" ref={painel} className="menu-movel" hidden={!aberto}>
        <nav aria-label="Menu do celular">
          <ul>
            {NAV.map((item, i) => {
              const Icone = ICONES[item.to] ?? ArrowRight;
              return (
                <li key={item.to} style={{ '--i': i }}>
                  <NavLink to={item.to} end={item.to === '/'} className="menu-movel__link">
                    <span className="icone-caixa icone-caixa--p">
                      <Icone size={18} strokeWidth={1.8} aria-hidden="true" />
                    </span>
                    {item.rotulo}
                    <ArrowRight size={16} className="menu-movel__seta" aria-hidden="true" />
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="menu-movel__acoes" style={{ '--i': NAV.length }}>
          <Link to="/conta" className="btn btn--contorno btn--bloco">
            <UserRoundCog size={18} aria-hidden="true" /> Área do cliente
          </Link>
          <Link to="/orcamento" className="btn btn--primario btn--bloco">
            <Send size={18} aria-hidden="true" /> Solicitar orçamento
          </Link>
        </div>
        <p className="menu-movel__slogan">{EMPRESA.slogan}</p>
      </div>
    </header>
  );
}

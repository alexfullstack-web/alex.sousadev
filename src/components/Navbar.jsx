import { useEffect, useState } from 'react';
import { m, useScroll, useSpring } from 'framer-motion';
import { NAV } from '../data/site.js';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('');
  const { scrollYProgress } = useScroll();
  const bar = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  // destaca a seção visível
  useEffect(() => {
    const ids = [...NAV.map((n) => n.id), 'contato'];
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    document.body.classList.toggle('nav-open', open);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className={`navbar ${scrolled ? 'is-scrolled' : ''} ${open ? 'is-open' : ''}`}>
      <div className="navbar__inner">
        <a href="#inicio" className="navbar__brand" onClick={close}>
          <img src="img/site/logo-128.webp" alt="" width="34" height="34" />
          <span>
            Alex Sousa <b>Tech</b>
          </span>
        </a>

        <nav className="navbar__nav" id="navbar-nav" aria-label="Navegação principal">
          {NAV.map((n) => (
            <a key={n.id} href={`#${n.id}`} className={`navbar__link ${active === n.id ? 'is-active' : ''}`} onClick={close}>
              {n.label}
            </a>
          ))}
          <a href="#contato" className="navbar__cta" onClick={close}>
            Contato
          </a>
        </nav>

        <button
          type="button"
          className="navbar__toggle"
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={open}
          aria-controls="navbar-nav"
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
      <m.div className="navbar__progress" style={{ scaleX: bar }} aria-hidden="true" />
    </header>
  );
}

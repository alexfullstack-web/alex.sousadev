import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { m, useReducedMotion } from 'framer-motion';
import { TECH_TAGS, canUseWebGL, detectQuality } from './config.js';

const HeroCanvas = lazy(() => import('./HeroCanvas.jsx'));

const ease = [0.22, 1, 0.36, 1];
const item = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease } },
};
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.25 } },
};

/* Versão estática (prefers-reduced-motion ou navegador sem WebGL 2). */
function StaticScene() {
  return (
    <div className="ast-static" aria-hidden="true">
      <div className="ast-static__planet" />
      <img
        className="ast-static__astronaut"
        src="img/hero/astronaut.webp"
        srcSet="img/hero/astronaut-sm.webp 640w, img/hero/astronaut.webp 1024w"
        sizes="(max-width: 768px) 90vw, 46vw"
        alt=""
        width="1024"
        height="1536"
        decoding="async"
      />
      <ul className="ast-static__tags">
        {TECH_TAGS.map((t) => (
          <li key={t.label} className="ast-tag ast-tag--static">
            <span className="ast-tag__dot" />
            {t.label}
          </li>
        ))}
      </ul>
      <div className="ast-caption ast-caption--static">
        <span className="ast-caption__brand">ALEX SOUSA TECH</span>
        <span className="ast-caption__line">DESENVOLVIMENTO • TECNOLOGIA • INOVAÇÃO</span>
      </div>
    </div>
  );
}

export default function HeroSpace() {
  const reduce = useReducedMotion();
  const sectionRef = useRef(null);
  const [mode, setMode] = useState('pending'); // pending | 3d | static
  const [inView, setInView] = useState(true);
  const [ready, setReady] = useState(false);
  const [quality] = useState(detectQuality);
  const contentRef = useRef(null);
  const [contentBottom, setContentBottom] = useState(0.5);
  const [contentRight, setContentRight] = useState(0.45);

  // mede onde o texto termina (proporção da altura) para o astronauta não cobri-lo no celular
  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;
    if (!section || !content || !('ResizeObserver' in window)) return undefined;
    const measure = () => {
      const s = section.getBoundingClientRect();
      const c = content.getBoundingClientRect();
      if (s.height > 0) setContentBottom((c.bottom - s.top) / s.height);
      if (s.width > 0) setContentRight((c.right - s.left) / s.width);
    };
    const ro = new ResizeObserver(measure);
    ro.observe(section);
    ro.observe(content);
    measure();
    const late = window.setTimeout(measure, 1600); // após a animação de entrada do texto
    return () => {
      ro.disconnect();
      window.clearTimeout(late);
    };
  }, []);

  // decide entre 3D e estático; o 3D só carrega quando o navegador estiver livre
  useEffect(() => {
    if (reduce || !canUseWebGL()) {
      setMode('static');
      return undefined;
    }
    let idle;
    let timer;
    const start = () => setMode('3d');
    if ('requestIdleCallback' in window) idle = window.requestIdleCallback(start, { timeout: 1500 });
    else timer = window.setTimeout(start, 350);
    return () => {
      if (idle) window.cancelIdleCallback(idle);
      if (timer) window.clearTimeout(timer);
    };
  }, [reduce]);

  // pausa o render 3D quando a hero sai da tela (não pesa no resto do site)
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || !('IntersectionObserver' in window)) return undefined;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.02 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
      <section
        ref={sectionRef}
        className={`ast-hero ${ready ? 'is-ready' : ''} ast-hero--${mode}`}
        id="inicio"
        aria-labelledby="hero-title"
      >
        <div className="ast-hero__backdrop" aria-hidden="true" />

        {mode === '3d' && (
          <Suspense fallback={null}>
            <HeroCanvas
              quality={quality}
              active={inView}
              contentBottom={contentBottom}
              contentRight={contentRight}
              onReady={() => setReady(true)}
            />
          </Suspense>
        )}
        {mode === 'static' && <StaticScene />}

        <div className="ast-hero__shade" aria-hidden="true" />

        <div className="ast-hero__inner">
          <m.div
            ref={contentRef}
            className="ast-hero__content"
            variants={container}
            initial={reduce ? false : 'hidden'}
            animate="show"
          >
            <m.p className="ast-hero__eyebrow" variants={item}>
              <span className="ast-hero__eyebrow-line" aria-hidden="true" />
              Portfólio · Desenvolvedor Full Stack
            </m.p>

            <m.h1 className="ast-hero__title" id="hero-title" variants={item}>
              <span className="ast-hero__title-main">Alex Sousa</span>
              <span className="ast-hero__title-accent">Tech</span>
            </m.h1>

            <m.p className="ast-hero__tagline" variants={item}>
              Desenvolvimento <i aria-hidden="true">•</i> Tecnologia <i aria-hidden="true">•</i> Inovação
            </m.p>

            <m.p className="ast-hero__lede" variants={item}>
              Sou Alex Sousa, desenvolvedor Full Stack. Construo sistemas web completos — interfaces em
              React, APIs em Node.js e dados bem estruturados.
            </m.p>

            <m.div className="ast-hero__actions" variants={item}>
              <a href="#projetos" className="ast-btn ast-btn--primary">
                Conheça meus projetos
                <svg viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M4 10h11M11 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <a href="#contato" className="ast-btn ast-btn--ghost">
                Fale comigo
              </a>
            </m.div>

            <m.p className="ast-hero__status" variants={item}>
              <span className="ast-hero__status-dot" aria-hidden="true" />
              Disponível para novos projetos
            </m.p>
          </m.div>
        </div>
      </section>
  );
}

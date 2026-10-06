import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { AnimatePresence, m, useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion';
import { MISSION_STAGES } from '../data/site.js';
import { stageIndex } from './missionPath.js';
import CodePanel from '../components/CodePanel.jsx';
import { canUseWebGL, detectQuality } from '../hero/config.js';

const MissionCanvas = lazy(() => import('./MissionCanvas.jsx'));

function usePortrait() {
  const get = () => typeof window !== 'undefined' && window.innerWidth / window.innerHeight < 1.05;
  const [portrait, setPortrait] = useState(get);
  useEffect(() => {
    const on = () => setPortrait(get());
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return portrait;
}

function StageCard({ stage, index }) {
  const isLast = stage.key === 'lua';
  return (
    <m.div
      key={stage.key}
      className={`mission-card ${isLast ? 'mission-card--final' : ''}`}
      initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -14, filter: 'blur(6px)' }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <p className="mission-card__step">
        {index === 0 ? 'T-0 · CONTAGEM' : isLast ? 'DESTINO ALCANÇADO' : `ETAPA ${String(index).padStart(2, '0')} / 06`}
      </p>
      <h3 className="mission-card__label">{stage.label}</h3>
      <p className="mission-card__title">{stage.title}</p>
      <p className="mission-card__desc">{stage.desc}</p>
      <ul className="mission-card__chips">
        {stage.chips.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
      {isLast && (
        <div className="mission-card__actions">
          <a className="ast-btn ast-btn--primary" href="#contato">
            Lançar meu projeto
          </a>
          <a className="ast-btn ast-btn--ghost" href="#projetos">
            Ver projetos
          </a>
        </div>
      )}
    </m.div>
  );
}

function StaticMission() {
  return (
    <div className="mission-static">
      <div className="section-head section-head--center">
        <p className="section-head__kicker">// 03 — Missão</p>
        <h2 className="section-head__title">Da Terra à Lua: como um projeto decola</h2>
      </div>
      <ol className="mission-static__list">
        {MISSION_STAGES.map((s, i) => (
          <li key={s.key} className="mission-static__item">
            <StageCard stage={s} index={i} />
            <CodePanel file={s.file} code={s.code} typing={false} badge="exemplo" />
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function Mission() {
  const sectionRef = useRef(null);
  const reduce = useReducedMotion();
  const portrait = usePortrait();
  const [mode, setMode] = useState('pending');
  const [near, setNear] = useState(false);
  const [inView, setInView] = useState(false);
  const [ready, setReady] = useState(false);
  const [stage, setStage] = useState(0);
  const [landed, setLanded] = useState(false);
  const [quality] = useState(detectQuality);
  const progressRef = useRef(0);
  const hudRef = useRef({});

  useEffect(() => {
    setMode(reduce || !canUseWebGL() ? 'static' : '3d');
  }, [reduce]);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    progressRef.current = v;
    const s = stageIndex(v);
    setStage((prev) => (prev === s ? prev : s));
    const l = v > 0.955;
    setLanded((prev) => (prev === l ? prev : l));
  });

  // monta o 3D um pouco antes de a seção aparecer; pausa fora da tela
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || mode !== '3d') return undefined;
    const pre = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: '120% 0px' });
    const vis = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0 });
    pre.observe(el);
    vis.observe(el);
    return () => {
      pre.disconnect();
      vis.disconnect();
    };
  }, [mode]);

  const goTo = (i) => {
    const el = sectionRef.current;
    if (!el) return;
    const total = el.offsetHeight - window.innerHeight;
    const r = MISSION_STAGES[i].range;
    const target = el.offsetTop + total * Math.min(0.995, r[0] + (r[1] - r[0]) * 0.5);
    window.scrollTo({ top: target, behavior: 'smooth' });
  };

  if (mode === 'static') {
    return (
      <section id="missao" className="mission mission--static" ref={sectionRef}>
        <StaticMission />
      </section>
    );
  }

  const current = MISSION_STAGES[stage];

  return (
    <section id="missao" className={`mission ${ready ? 'is-ready' : ''} ${landed ? 'is-landed' : ''}`} ref={sectionRef} aria-label="Missão: da Terra à Lua">
      <div className="mission__sticky">
        <div className="mission__backdrop" aria-hidden="true" />
        {near && (
          <Suspense fallback={null}>
            <MissionCanvas
              quality={quality}
              active={inView}
              progressRef={progressRef}
              portrait={portrait}
              hudRef={hudRef}
              onReady={() => setReady(true)}
            />
          </Suspense>
        )}
        <div className="mission__shade" aria-hidden="true" />

        <div className="mission__ui">
          <header className="mission__head">
            <p className="section-head__kicker">// 03 — Missão</p>
            <h2 className="mission__heading">Da Terra à Lua: como um projeto decola</h2>
          </header>

          <div className="mission__card-slot">
            <AnimatePresence mode="wait">
              <StageCard stage={current} index={stage} key={current.key} />
            </AnimatePresence>
          </div>

          <div className="mission__code">
            <CodePanel file={current.file} code={current.code} key={current.key} />
          </div>

          <div className="mission__hud">
            <div className="mission__telemetry" aria-hidden="true">
              <div>
                <span>ALTITUDE</span>
                <strong>
                  <b ref={(el) => (hudRef.current.alt = el)}>0</b> km
                </strong>
              </div>
              <div>
                <span>VELOCIDADE</span>
                <strong>
                  <b ref={(el) => (hudRef.current.vel = el)}>0,0</b> km/s
                </strong>
              </div>
            </div>
            <nav className="mission__track" aria-label="Etapas da missão">
              {MISSION_STAGES.map((s, i) => (
                <button
                  key={s.key}
                  type="button"
                  className={`mission__dot ${i === stage ? 'is-active' : ''} ${i < stage ? 'is-done' : ''}`}
                  onClick={() => goTo(i)}
                  aria-label={`Ir para a etapa ${s.label}`}
                  aria-current={i === stage ? 'step' : undefined}
                >
                  <span className="mission__dot-label">{s.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {stage === 0 && (
            <p className="mission__hint" aria-hidden="true">
              Role para lançar <span>↓</span>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

import { useRef, useState } from 'react';
import { AnimatePresence, m, useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion';
import { MISSION_STAGES } from '../data/site.js';
import CodePanel from '../components/CodePanel.jsx';

/*
  Seção Missão: fica presa na tela enquanto você rola e passa pelas
  etapas de tecnologia, com cartão da etapa e painel de código grande.
*/
const N = MISSION_STAGES.length;
const stageFromProgress = (p) => Math.min(N - 1, Math.max(0, Math.floor(p * N)));
function StageCard({ stage, index }) {
  return (
    <m.div
      className="mission-card"
      initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -14, filter: 'blur(6px)' }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <p className="mission-card__step">{`ETAPA ${String(index + 1).padStart(2, '0')} / ${String(MISSION_STAGES.length).padStart(2, '0')}`}</p>
      <h3 className="mission-card__label">{stage.label}</h3>
      <p className="mission-card__title">{stage.title}</p>
      <p className="mission-card__desc">{stage.desc}</p>
      <ul className="mission-card__chips">
        {stage.chips.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
    </m.div>
  );
}

function StaticMission() {
  return (
    <div className="mission-static">
      <div className="section-head section-head--center">
        <p className="section-head__kicker">// 03 — Missão</p>
        <h2 className="section-head__title">Do código ao deploy</h2>
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
  const reduce = useReducedMotion();
  const sectionRef = useRef(null);
  const barRef = useRef(null);
  const [stage, setStage] = useState(0);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    const s = stageFromProgress(p);
    setStage((prev) => (prev === s ? prev : s));
    if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
  });

  if (reduce) {
    return (
      <section id="missao" className="mission mission--static">
        <StaticMission />
      </section>
    );
  }

  const current = MISSION_STAGES[stage];
  const goTo = (i) => {
    const el = sectionRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const span = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + span * ((i + 0.5) / N), behavior: 'smooth' });
  };

  return (
    <section id="missao" className="mission" ref={sectionRef} aria-label="Missão: etapas de tecnologia">
      <div className="mission__sticky">
        <div className="mission__shade" aria-hidden="true" />
        <div className="mission__ui">
          <header className="mission__head">
            <p className="section-head__kicker">// 03 — Missão</p>
            <h2 className="mission__heading">Do código ao deploy</h2>
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
            <div className="mission__progress" aria-hidden="true">
              <span>{String(stage + 1).padStart(2, '0')}</span>
              <div className="mission__progress-track">
                <i ref={barRef} />
              </div>
              <span>{String(N).padStart(2, '0')}</span>
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
        </div>
      </div>
    </section>
  );
}

import { useEffect, useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { MISSION_STAGES } from '../data/site.js';
import { stageIndex } from './missionPath.js';
import CodePanel from '../components/CodePanel.jsx';
import { subscribe, scrollToProgress } from '../journey/journeyStore.js';
import { Telemetry, useJourneyMode } from '../journey/Journey.jsx';

/*
  Seção Missão: enquanto ela rola, o foguete (no fundo fixo do site)
  atravessa os portões de tecnologia. Aqui ficam só a interface:
  cartão da etapa, painel de código grande e telemetria.
*/
function StageCard({ stage, index }) {
  return (
    <m.div
      className="mission-card"
      initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -14, filter: 'blur(6px)' }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <p className="mission-card__step">{`PORTÃO ${String(index + 1).padStart(2, '0')} / ${String(MISSION_STAGES.length).padStart(2, '0')}`}</p>
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
        <h2 className="section-head__title">Os portões de tecnologia</h2>
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
  const mode = useJourneyMode();
  const [stage, setStage] = useState(0);

  useEffect(
    () =>
      subscribe((p) => {
        const s = stageIndex(p);
        setStage((prev) => (prev === s ? prev : s));
      }),
    []
  );

  if (mode === 'static') {
    return (
      <section id="missao" className="mission mission--static">
        <StaticMission />
      </section>
    );
  }

  const current = MISSION_STAGES[stage];
  const goTo = (i) => {
    const r = MISSION_STAGES[i].range;
    scrollToProgress((r[0] + r[1]) / 2);
  };

  return (
    <section id="missao" className="mission" aria-label="Missão: portões de tecnologia">
      <div className="mission__sticky">
        <div className="mission__shade" aria-hidden="true" />
        <div className="mission__ui">
          <header className="mission__head">
            <p className="section-head__kicker">// 03 — Missão</p>
            <h2 className="mission__heading">Os portões de tecnologia</h2>
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
            <Telemetry className="mission__telemetry" />
            <nav className="mission__track" aria-label="Etapas da missão">
              {MISSION_STAGES.map((s, i) => (
                <button
                  key={s.key}
                  type="button"
                  className={`mission__dot ${i === stage ? 'is-active' : ''} ${i < stage ? 'is-done' : ''}`}
                  onClick={() => goTo(i)}
                  aria-label={`Ir para o portão ${s.label}`}
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

import { createContext, lazy, Suspense, useContext, useEffect, useRef, useState } from 'react';
import { m, useReducedMotion } from 'framer-motion';
import { JOURNEY_WINDOWS } from '../data/site.js';
import { canUseWebGL, detectQuality } from '../hero/config.js';
import { registerHud, subscribe } from './journeyStore.js';

const JourneyCanvas = lazy(() => import('./JourneyCanvas.jsx'));

/* modo da viagem: 'pending' | '3d' | 'static' (movimento reduzido / sem WebGL 2) */
const JourneyMode = createContext('pending');
export const useJourneyMode = () => useContext(JourneyMode);

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

/*
  Provedor da viagem: monta o canvas fixo de fundo depois que a página carregou
  e pausa o render enquanto a hero (opaca) cobre a tela inteira.
*/
export function JourneyProvider({ children }) {
  const reduce = useReducedMotion();
  const portrait = usePortrait();
  const [mode, setMode] = useState('pending');
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);
  const [ready, setReady] = useState(false);
  const [quality] = useState(detectQuality);

  useEffect(() => {
    if (reduce || !canUseWebGL()) {
      setMode('static');
      return undefined;
    }
    setMode('3d');
    // carrega a cena quando o navegador estiver livre ou quando a pessoa começar a rolar
    let done = false;
    const go = () => {
      if (done) return;
      done = true;
      setMounted(true);
    };
    const t = window.setTimeout(go, 2500);
    const onScroll = () => window.scrollY > 80 && go();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('scroll', onScroll);
    };
  }, [reduce]);

  // ativa o render só quando a hero não cobre mais a tela
  useEffect(() => {
    if (mode !== '3d') return undefined;
    const hero = document.getElementById('inicio');
    if (!hero) {
      setActive(true);
      return undefined;
    }
    const io = new IntersectionObserver(([e]) => setActive(e.intersectionRatio < 0.985), {
      threshold: [0, 0.5, 0.9, 0.985, 1],
    });
    io.observe(hero);
    return () => io.disconnect();
  }, [mode]);

  return (
    <JourneyMode.Provider value={mode}>
      <div className={`journey ${ready ? 'is-ready' : ''}`} aria-hidden="true">
        {mode === '3d' && mounted && (
          <Suspense fallback={null}>
            <JourneyCanvas quality={quality} active={active} portrait={portrait} onReady={() => setReady(true)} />
          </Suspense>
        )}
      </div>
      {children}
    </JourneyMode.Provider>
  );
}

/* Telemetria (altitude e velocidade) escrita pela cena */
export function Telemetry({ className = '' }) {
  const ref = useRef({});
  useEffect(() => registerHud(ref.current), []);
  return (
    <div className={`telemetry ${className}`} aria-hidden="true">
      <div>
        <span>ALTITUDE</span>
        <strong>
          <b ref={(el) => (ref.current.alt = el)}>0</b> km
        </strong>
      </div>
      <div>
        <span>VELOCIDADE</span>
        <strong>
          <b ref={(el) => (ref.current.vel = el)}>0,0</b> km/s
        </strong>
      </div>
    </div>
  );
}

/* barra de progresso da viagem Terra → Lua */
export function JourneyBar() {
  const fill = useRef(null);
  const rocket = useRef(null);
  useEffect(
    () =>
      subscribe((p) => {
        if (fill.current) fill.current.style.transform = `scaleX(${p})`;
        if (rocket.current) rocket.current.style.left = `${p * 100}%`;
      }),
    []
  );
  return (
    <div className="journey-bar" aria-hidden="true">
      <span className="journey-bar__end">TERRA</span>
      <div className="journey-bar__track">
        <span className="journey-bar__fill" ref={fill} />
        <span className="journey-bar__rocket" ref={rocket}>
          ▲
        </span>
      </div>
      <span className="journey-bar__end">LUA</span>
    </div>
  );
}

/*
  Janela cinematográfica: um trecho alto e transparente em que a viagem
  aparece sem conteúdo por cima, com legenda e telemetria.
*/
export function JourneyWindow({ id, keys, height = 170, children }) {
  const mode = useJourneyMode();
  const [step, setStep] = useState(0);
  const ref = useRef(null);

  // janelas com duas legendas trocam conforme o avanço dentro da janela
  useEffect(() => {
    if (keys.length < 2) return undefined;
    return subscribe(() => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const q = -r.top / Math.max(1, r.height - window.innerHeight);
      setStep(q > 0.62 ? 1 : 0);
    });
  }, [keys.length]);

  const data = JOURNEY_WINDOWS[keys[step]];
  const isStatic = mode === 'static';

  return (
    <section
      id={id}
      ref={ref}
      className={`jwin ${isStatic ? 'jwin--static' : ''}`}
      style={isStatic ? undefined : { height: `${height}vh` }}
      aria-label={data.title}
    >
      <div className="jwin__sticky">
        <m.div
          key={keys[step]}
          className="jwin__caption"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: '-20% 0px' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="jwin__kicker">{data.kicker}</p>
          <h2 className="jwin__title">{data.title}</h2>
          <p className="jwin__text">{data.text}</p>
          {step === 1 || keys.length === 1 ? children : null}
        </m.div>
        {!isStatic && <Telemetry className="jwin__telemetry" />}
      </div>
    </section>
  );
}

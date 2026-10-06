/* =========================================================
   Viagem Terra → Lua — trajetória em função do progresso p (0..1)
   p vem da rolagem do SITE INTEIRO (ver journey/journeyStore.js):
     0.00–0.10  decolagem (janela "Decolagem")
     0.10–0.20  subida; a Terra vira um globo atrás (janela "Órbita")
     0.20–0.84  cruzeiro pelos portões de tecnologia (seção Missão)
     0.86–0.92  giro de frenagem (janela "Aproximação")
     0.92–0.97  descida e pouso; 0.97+ bandeira e Terra ao fundo
   O foguete fica sempre na origem; o "mundo" se desloca em -Y.
   ========================================================= */
import { MISSION_STAGES } from '../data/site.js';

export const EARTH_R = 40;
export const EARTH_Y = -42.08; // topo da Terra logo abaixo da plataforma
export const PAD_Y = -2.0;
export const MOON_R = 16;
export const ROCKET_BASE = 2.0;

const clamp01 = (v) => Math.min(1, Math.max(0, v));
export const smooth = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
export const lerp = (a, b, t) => a + (b - a) * t;

export const P = {
  launchEnd: 0.1,
  cruiseStart: 0.2,
  flipStart: 0.86,
  flipEnd: 0.92,
  landed: 0.97,
};

const CRUISE_END_A = 260;
export const LAND_A = 282;

export function altitude(p) {
  if (p <= P.launchEnd) {
    const t = p / P.launchEnd;
    return 30 * t * t;
  }
  if (p <= P.flipStart) return lerp(30, CRUISE_END_A, (p - P.launchEnd) / (P.flipStart - P.launchEnd));
  if (p <= P.flipEnd) return lerp(CRUISE_END_A, 276, easeOut((p - P.flipStart) / (P.flipEnd - P.flipStart)));
  if (p <= P.landed) return lerp(276, LAND_A, easeOut((p - P.flipEnd) / (P.landed - P.flipEnd)));
  return LAND_A;
}

export const flip = (p) => smooth(P.flipStart, P.flipEnd, p);

export function thrust(p) {
  if (p < 0.004) return 0.12;
  if (p < P.launchEnd) return 1;
  if (p < P.flipStart) return 0.6;
  if (p < P.flipEnd) return 0.18 + 0.5 * smooth(P.flipEnd - 0.03, P.flipEnd, p);
  if (p < P.landed) return 0.75 * (1 - smooth(P.landed - 0.03, P.landed, p)) + 0.1;
  return 0;
}

/* Portões das tecnologias: um por etapa, no meio do trecho da etapa. */
export const GATES = MISSION_STAGES.map((s, i) => {
  const mid = (s.range[0] + s.range[1]) / 2;
  return { key: s.key, label: s.label, index: i + 1, y: altitude(mid) };
});

/* Terra: presa ao chão na decolagem; depois vira um globo que fica para trás */
export function earthPosition(p, a, out) {
  const launch = { x: 0, y: EARTH_Y - a, z: 0 };
  if (p <= P.launchEnd) return out.set(launch.x, launch.y, launch.z);
  const t1 = smooth(P.launchEnd, 0.2, p);
  const t2 = smooth(0.2, 0.34, p);
  const y0 = EARTH_Y - altitude(P.launchEnd);
  return out.set(
    lerp(lerp(0, -9, t1), -14, t2),
    lerp(lerp(y0, -60, t1), -95, t2),
    lerp(lerp(0, -118, t1), -280, t2)
  );
}

/* Lua: caminho relativo ao foguete */
export function moonPosition(p, out) {
  if (p < P.flipStart) {
    const q = clamp01((p - P.cruiseStart) / (P.flipStart - P.cruiseStart));
    const e = Math.pow(q, 1.7);
    return out.set(lerp(60, 14, e), lerp(125, 42, e), lerp(-300, -34, e));
  }
  if (p < P.flipEnd) {
    const t = smooth(P.flipStart, P.flipEnd, p);
    return out.set(lerp(14, 0, t), lerp(42, MOON_R + ROCKET_BASE + 12, t), lerp(-34, 0, t));
  }
  const t = easeOut(clamp01((p - P.flipEnd) / (P.landed - P.flipEnd)));
  return out.set(0, lerp(MOON_R + ROCKET_BASE + 12, MOON_R + ROCKET_BASE - 0.02, t), 0);
}

/* Câmera: chaves no referencial da tela (antes da rotação de frenagem) */
const KEYS = [
  { p: 0.0, off: [0, 2.4, 11.6], tgt: [0, -0.15, 0] },
  { p: 0.06, off: [1.8, 2.8, 11.8], tgt: [0, -0.9, 0] },
  { p: 0.12, off: [3.0, 5.6, 12.6], tgt: [0, -2.6, 0] },
  { p: 0.19, off: [2.0, 6.5, 14.0], tgt: [-0.6, -3.4, 0] },
  { p: 0.25, off: [3.4, -3.4, 11.0], tgt: [0, 1.4, 0] },
  { p: 0.82, off: [-3.0, -3.2, 11.0], tgt: [0, 1.4, 0] },
  { p: 0.92, off: [0, 0.2, 12.2], tgt: [0, -0.4, 0] },
  { p: 1.0, off: [0.6, 0.6, 11.4], tgt: [0, -0.7, 0] },
];

export function cameraKey(p, off, tgt) {
  let i = 0;
  while (i < KEYS.length - 2 && p > KEYS[i + 1].p) i++;
  const a = KEYS[i];
  const b = KEYS[i + 1];
  const t = smooth(a.p, b.p, p);
  off.set(lerp(a.off[0], b.off[0], t), lerp(a.off[1], b.off[1], t), lerp(a.off[2], b.off[2], t));
  tgt.set(lerp(a.tgt[0], b.tgt[0], t), lerp(a.tgt[1], b.tgt[1], t), lerp(a.tgt[2], b.tgt[2], t));
}

/* Etapa de tecnologia ativa */
export function stageIndex(p) {
  for (let i = MISSION_STAGES.length - 1; i >= 0; i--) {
    if (p >= MISSION_STAGES[i].range[0]) return i;
  }
  return 0;
}

/* Altitude exibida (km) — 384.400 km até a Lua */
export function kmFromP(p) {
  const a = altitude(p) / LAND_A;
  return Math.round(384400 * Math.pow(a, 1.8));
}

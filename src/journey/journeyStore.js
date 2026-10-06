/* =========================================================
   Progresso da viagem do foguete para o SITE INTEIRO.
   Cada âncora liga a posição de uma seção na rolagem a um ponto
   da viagem (p). Entre âncoras o progresso é interpolado.
   ========================================================= */

// [id da seção, 'top' = topo da seção no topo da tela | 'bottom' = fim da seção no fim da tela, p]
export const ANCHORS = [
  ['janela-decolagem', 'top', 0],
  ['janela-decolagem', 'bottom', 0.1],
  ['janela-orbita', 'top', 0.13],
  ['janela-orbita', 'bottom', 0.2],
  ['missao', 'top', 0.2],
  ['missao', 'bottom', 0.84],
  ['janela-pouso', 'top', 0.855],
  ['janela-pouso', 'bottom', 0.975],
  ['contato', 'top', 0.99],
];

const store = {
  p: 0,
  listeners: new Set(),
  huds: new Set(), // elementos de telemetria atualizados pela cena
  telemetry: { km: 0, kms: 0 },
};

function anchorScroll(id, edge) {
  const el = document.getElementById(id);
  if (!el) return null;
  const top = el.getBoundingClientRect().top + window.scrollY;
  return edge === 'top' ? top : top + el.offsetHeight - window.innerHeight;
}

export function computeProgress() {
  const y = window.scrollY;
  const pts = [];
  for (const [id, edge, p] of ANCHORS) {
    const s = anchorScroll(id, edge);
    if (s !== null) pts.push([s, p]);
  }
  pts.push([document.documentElement.scrollHeight - window.innerHeight, 1]);
  if (!pts.length || y <= pts[0][0]) return 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const [s0, p0] = pts[i];
    const [s1, p1] = pts[i + 1];
    if (y <= s1) return s1 === s0 ? p1 : p0 + ((y - s0) / (s1 - s0)) * (p1 - p0);
  }
  return 1;
}

let started = false;
function start() {
  if (started || typeof window === 'undefined') return;
  started = true;
  let ticking = false;
  const update = () => {
    ticking = false;
    const p = computeProgress();
    if (p !== store.p) {
      store.p = p;
      store.listeners.forEach((fn) => fn(p));
    }
  };
  const req = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };
  window.addEventListener('scroll', req, { passive: true });
  window.addEventListener('resize', req);
  if ('ResizeObserver' in window) new ResizeObserver(req).observe(document.body);
  update();
}

export function getProgress() {
  start();
  return store.p;
}

export function subscribe(fn) {
  start();
  store.listeners.add(fn);
  fn(store.p);
  return () => store.listeners.delete(fn);
}

/* scroll até um ponto p da viagem */
export function scrollToProgress(target) {
  const pts = ANCHORS.map(([id, edge, p]) => [anchorScroll(id, edge), p]).filter(([s]) => s !== null);
  for (let i = 0; i < pts.length - 1; i++) {
    const [s0, p0] = pts[i];
    const [s1, p1] = pts[i + 1];
    if (target >= p0 && target <= p1) {
      const y = p1 === p0 ? s0 : s0 + ((target - p0) / (p1 - p0)) * (s1 - s0);
      window.scrollTo({ top: y, behavior: 'smooth' });
      return;
    }
  }
}

/* Telemetria: a cena escreve, os painéis exibem */
export function registerHud(hud) {
  store.huds.add(hud);
  return () => store.huds.delete(hud);
}

export function writeTelemetry(km, kms) {
  if (km === store.telemetry.km && kms === store.telemetry.kms) return;
  store.telemetry.km = km;
  store.telemetry.kms = kms;
  const kmText = km.toLocaleString('pt-BR');
  const kmsText = kms.toFixed(1).replace('.', ',');
  store.huds.forEach((h) => {
    if (h.alt) h.alt.textContent = kmText;
    if (h.vel) h.vel.textContent = kmsText;
  });
}

if (import.meta.env.DEV && typeof window !== 'undefined') window.__journey = { getProgress, computeProgress };

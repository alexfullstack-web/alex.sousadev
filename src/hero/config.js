/* =========================================================
   Hero Alex Sousa Tech — configuração compartilhada
   Linha do tempo (em segundos desde que a cena 3D começa),
   qualidade por dispositivo e conteúdo dos elementos.
   ========================================================= */

export const TIMELINE = {
  starsMove: [0.3, 2.6],   // estrelas começam a se mover
  dolly: [0.6, 6.8],       // aproximação lenta da câmera
  astroIn: [1.2, 3.8],     // astronauta entra pela esquerda
  visor: [3.0, 4.6],       // reflexos de código no visor
  laptopGlow: [3.6, 4.6],  // notebook acende
  holoOpen: [4.0, 5.0],    // interface holográfica abre
  codeStart: 4.7,          // linhas de código começam a ser digitadas
  tagsStart: 5.3,          // tags tecnológicas
  tagsStep: 0.14,
  tagsDur: 0.7,
  caption: [7.6, 8.8],     // assinatura final
};

export const TECH_TAGS = [
  // label, posição local ao astronauta [x, y, z], fase da flutuação, visível no mobile
  { label: 'FRONT-END', pos: [-1.55, 2.85, 0.8], phase: 0.0, mobile: true },
  { label: 'REACT', pos: [-1.95, 1.55, 1.0], phase: 1.3, mobile: true },
  { label: 'JAVASCRIPT', pos: [-1.75, 0.35, 1.2], phase: 2.1, mobile: false },
  { label: 'NODE.JS', pos: [-1.9, -0.75, 1.0], phase: 2.8, mobile: true },
  { label: 'BACK-END', pos: [-1.6, -1.75, 0.6], phase: 0.7, mobile: true },
  { label: 'IA', pos: [1.05, 3.25, -0.3], phase: 1.9, mobile: false },
  { label: 'APIs', pos: [2.75, 0.3, 0.6], phase: 0.4, mobile: true },
  { label: 'BANCO DE DADOS', pos: [2.6, -0.7, 0.3], phase: 2.4, mobile: false },
  { label: 'CLOUD', pos: [2.45, -1.65, 0.5], phase: 1.1, mobile: true },
];

// Código digitado no holograma do notebook (tokens: [texto, tipo])
export const HOLO_CODE = [
  [['const ', 'kw'], ['alexSousaTech', 'id'], [' = {', 'p']],
  [['  desenvolvimento', 'prop'], [': ', 'p'], ['true', 'bool'], [',', 'p']],
  [['  tecnologia', 'prop'], [': ', 'p'], ['true', 'bool'], [',', 'p']],
  [['  inovacao', 'prop'], [': ', 'p'], ['true', 'bool'], [',', 'p']],
  [['  stack', 'prop'], [': [', 'p'], ["'React'", 'str'], [', ', 'p'], ["'Node.js'", 'str'], ['],', 'p']],
  [['};', 'p']],
  [],
  [['function ', 'kw'], ['criarSolucao', 'fn'], ['() {', 'p']],
  [['  return ', 'kw'], ['alexSousaTech', 'id'], [';', 'p']],
  [['}', 'p']],
  [],
  [['deploy', 'fn'], ['(', 'p'], ['criarSolucao', 'fn'], ['());', 'p']],
];

export function detectQuality() {
  if (typeof window === 'undefined') return 'high';
  const mq = (q) => window.matchMedia(q).matches;
  const small = mq('(max-width: 768px)');
  const coarse = mq('(pointer: coarse)');
  const cores = navigator.hardwareConcurrency || 8;
  const saveData = navigator.connection && navigator.connection.saveData;
  if (saveData || small || (coarse && cores <= 6) || cores <= 4) return 'low';
  return 'high';
}

export const QUALITY = {
  high: { stars: 5200, flares: 16, dust: 240, dpr: [1, 1.75], antialias: true, rays: true },
  low: { stars: 1600, flares: 9, dust: 70, dpr: [1, 1.3], antialias: false, rays: false },
};

export function canUseWebGL() {
  try {
    const c = document.createElement('canvas');
    // three.js r163+ exige WebGL 2
    return !!(window.WebGL2RenderingContext && c.getContext('webgl2'));
  } catch (e) {
    return false;
  }
}

// helpers de animação
export const clamp01 = (v) => Math.min(1, Math.max(0, v));
export const progress = (t, [a, b]) => clamp01((t - a) / (b - a));
export const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);
export const easeInOutCubic = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const easeOutExpo = (x) => (x === 1 ? 1 : 1 - Math.pow(2, -10 * x));
export const lerp = (a, b, t) => a + (b - a) * t;

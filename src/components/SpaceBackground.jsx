import { useEffect, useRef } from 'react';

/*
  Fundo espacial do site inteiro — muito leve:
  3 camadas de estrelas geradas uma vez em canvas (imagens repetidas),
  movidas com transform no scroll (parallax), nebulosas em CSS
  e estrelas cadentes ocasionais. Nada roda por frame quando a página está parada.
*/
function makeTile(size, count, maxR, bright) {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  for (let i = 0; i < count; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = Math.random() * maxR + 0.3;
    const a = 0.35 + Math.random() * 0.65 * bright;
    const blue = Math.random() < 0.45;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r * 2.4);
    g.addColorStop(0, blue ? `rgba(150,190,255,${a})` : `rgba(255,255,255,${a})`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r * 2.4, 0, Math.PI * 2);
    ctx.fill();
  }
  return c.toDataURL('image/png');
}

const LAYERS = [
  { size: 420, count: 120, maxR: 0.7, bright: 0.6, speed: 0.04 },
  { size: 640, count: 80, maxR: 1.1, bright: 0.85, speed: 0.1 },
  { size: 900, count: 40, maxR: 1.6, bright: 1, speed: 0.2 },
];

export default function SpaceBackground() {
  const layerRefs = useRef([]);

  useEffect(() => {
    const small = window.matchMedia('(max-width: 768px)').matches;
    LAYERS.forEach((l, i) => {
      const el = layerRefs.current[i];
      if (!el) return;
      const url = makeTile(l.size, Math.round(l.count * (small ? 0.7 : 1)), l.maxR, l.bright);
      el.style.backgroundImage = `url(${url})`;
      el.style.backgroundSize = `${l.size}px ${l.size}px`;
      el.style.setProperty('--tile', `${l.size}px`);
    });

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return undefined;
    let ticking = false;
    const update = () => {
      ticking = false;
      const y = window.scrollY;
      LAYERS.forEach((l, i) => {
        const el = layerRefs.current[i];
        if (el) el.style.transform = `translate3d(0, ${-((y * l.speed) % l.size)}px, 0)`;
      });
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="space-bg" aria-hidden="true">
      <div className="space-bg__nebula space-bg__nebula--a" />
      <div className="space-bg__nebula space-bg__nebula--b" />
      {LAYERS.map((l, i) => (
        <div key={i} className={`space-bg__stars space-bg__stars--${i}`} ref={(el) => (layerRefs.current[i] = el)} />
      ))}
      <span className="space-bg__shooting space-bg__shooting--1" />
      <span className="space-bg__shooting space-bg__shooting--2" />
    </div>
  );
}

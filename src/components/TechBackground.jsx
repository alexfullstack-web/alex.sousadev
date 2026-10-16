// Fundo tecnológico do site inteiro: partículas ligadas por linhas finas, trilhas de circuito
// com pulsos de luz e leve parallax na rolagem. Um único <canvas> fixo, leve:
//  - quantidade de partículas proporcional à tela (com teto) e densidade de pixels limitada;
//  - pausa com a aba escondida; ~30 quadros/s em telas pequenas;
//  - "prefers-reduced-motion": desenha um quadro parado e não anima.
import { useEffect, useRef } from 'react';

const AZUL = '79, 209, 255';
const ELETRICO = '30, 107, 255';

function criarCircuitos(w, h, rnd) {
  // Trilhas ortogonais que nascem nas bordas e dobram em 45° (como trilhas de placa).
  const trilhas = [];
  const n = Math.round(Math.min(14, Math.max(6, (w * h) / 140000)));
  for (let i = 0; i < n; i++) {
    const daEsquerda = i % 2 === 0;
    let x = daEsquerda ? -20 : w + 20;
    let y = rnd() * h;
    const pts = [[x, y]];
    const passos = 3 + Math.floor(rnd() * 3);
    for (let p = 0; p < passos; p++) {
      const reto = 60 + rnd() * (w * 0.18);
      x += daEsquerda ? reto : -reto;
      pts.push([x, y]);
      const diag = 20 + rnd() * 60;
      x += daEsquerda ? diag : -diag;
      y += (rnd() > 0.5 ? 1 : -1) * diag;
      pts.push([x, y]);
    }
    let comp = 0;
    const seg = [];
    for (let k = 1; k < pts.length; k++) {
      const d = Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]);
      seg.push(d);
      comp += d;
    }
    trilhas.push({ pts, seg, comp, pulso: rnd(), vel: 0.04 + rnd() * 0.06 });
  }
  return trilhas;
}

function pontoNa(t, f) {
  let alvo = f * t.comp;
  for (let k = 0; k < t.seg.length; k++) {
    if (alvo <= t.seg[k]) {
      const a = t.pts[k];
      const b = t.pts[k + 1];
      const r = alvo / t.seg[k];
      return [a[0] + (b[0] - a[0]) * r, a[1] + (b[1] - a[1]) * r];
    }
    alvo -= t.seg[k];
  }
  return t.pts[t.pts.length - 1];
}

export default function TechBackground() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let pontos = [];
    let trilhas = [];
    let raf = 0;
    let ultimo = 0;
    let semente = 7;
    const rnd = () => ((semente = (semente * 16807) % 2147483647) / 2147483647);

    function montar() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      semente = 7;
      const n = Math.min(90, Math.round((w * h) / 16000));
      pontos = Array.from({ length: n }, () => ({ x: rnd() * w, y: rnd() * h * 1.4, vx: (rnd() - 0.5) * 0.18, vy: (rnd() - 0.5) * 0.18, r: 0.6 + rnd() * 1.4, p: rnd() * 6.28 }));
      trilhas = criarCircuitos(w, h, rnd);
    }

    function desenhar(tempo) {
      const rolagem = window.scrollY || 0;
      ctx.clearRect(0, 0, w, h);
      // trilhas de circuito (sobem mais devagar que a página: parallax)
      const dyC = -(rolagem * 0.08) % h;
      ctx.lineWidth = 1;
      for (const t of trilhas) {
        for (const desloc of [dyC, dyC + h]) {
          ctx.strokeStyle = `rgba(${ELETRICO}, 0.10)`;
          ctx.beginPath();
          t.pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y + desloc) : ctx.moveTo(x, y + desloc)));
          ctx.stroke();
          const [ux, uy] = t.pts[t.pts.length - 1];
          ctx.fillStyle = `rgba(${AZUL}, 0.25)`;
          ctx.beginPath();
          ctx.arc(ux, uy + desloc, 2.2, 0, 6.28);
          ctx.fill();
          if (!reduzido) {
            const [px, py] = pontoNa(t, t.pulso);
            const g = ctx.createRadialGradient(px, py + desloc, 0, px, py + desloc, 9);
            g.addColorStop(0, `rgba(${AZUL}, 0.75)`);
            g.addColorStop(1, `rgba(${AZUL}, 0)`);
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(px, py + desloc, 9, 0, 6.28);
            ctx.fill();
          }
        }
      }
      // partículas + ligações
      const dyP = -(rolagem * 0.18);
      const visiveis = [];
      for (const p of pontos) {
        let y = (p.y + dyP) % (h * 1.4);
        if (y < -20) y += h * 1.4;
        if (y > h + 20) continue;
        visiveis.push([p.x, y, p]);
      }
      for (let i = 0; i < visiveis.length; i++) {
        const [x1, y1] = visiveis[i];
        for (let j = i + 1; j < visiveis.length; j++) {
          const [x2, y2] = visiveis[j];
          const d2 = (x1 - x2) ** 2 + (y1 - y2) ** 2;
          if (d2 < 14400) {
            ctx.strokeStyle = `rgba(${AZUL}, ${0.12 * (1 - d2 / 14400)})`;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
          }
        }
      }
      for (const [x, y, p] of visiveis) {
        const brilho = 0.45 + 0.35 * Math.sin(tempo / 1400 + p.p);
        ctx.fillStyle = `rgba(${AZUL}, ${brilho})`;
        ctx.beginPath();
        ctx.arc(x, y, p.r, 0, 6.28);
        ctx.fill();
      }
    }

    function passo(tempo) {
      raf = requestAnimationFrame(passo);
      const intervalo = w < 760 ? 33 : 16;
      if (tempo - ultimo < intervalo) return;
      const dt = Math.min(tempo - ultimo, 64) / 16;
      ultimo = tempo;
      for (const p of pontos) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h * 1.4;
        if (p.y > h * 1.4) p.y = -10;
      }
      for (const t of trilhas) t.pulso = (t.pulso + (t.vel * dt) / 60) % 1;
      desenhar(tempo);
    }

    montar();
    desenhar(0);
    let rolando = 0;
    const aoRolar = () => {
      if (reduzido && !rolando) rolando = requestAnimationFrame(() => {
        rolando = 0;
        desenhar(0);
      });
    };
    const aoRedimensionar = () => {
      montar();
      desenhar(0);
    };
    const visibilidade = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !reduzido) raf = requestAnimationFrame(passo);
    };
    if (!reduzido) raf = requestAnimationFrame(passo);
    window.addEventListener('resize', aoRedimensionar);
    window.addEventListener('scroll', aoRolar, { passive: true });
    document.addEventListener('visibilitychange', visibilidade);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', aoRedimensionar);
      window.removeEventListener('scroll', aoRolar);
      document.removeEventListener('visibilitychange', visibilidade);
    };
  }, []);
  return (
    <div className="fundo" aria-hidden="true">
      <div className="fundo__brilho fundo__brilho--a" />
      <div className="fundo__brilho fundo__brilho--b" />
      <canvas ref={ref} className="fundo__canvas" />
      <div className="fundo__vinheta" />
    </div>
  );
}

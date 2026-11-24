// Fundo tecnológico do site inteiro (v6).
// Camadas:
//  1. CSS: preto azulado, luzes ambientes azul/verde que se movem devagar, grade técnica com máscara;
//  2. <canvas>: rede de partículas com linhas de conexão, pontos luminosos e reação ao ponteiro.
// Pensado para ser leve:
//  - quantidade de partículas proporcional à área da tela, com teto, e menor em aparelhos modestos
//    (poucos núcleos, pouca memória, economia de dados ou tela pequena);
//  - densidade de pixels limitada; ~30 quadros/s no modo econômico;
//  - pausa com a aba escondida;
//  - "prefers-reduced-motion": desenha uma vez, parado, sem reagir ao ponteiro.
import { useEffect, useRef } from 'react';

const CORES = ['47, 125, 255', '56, 199, 245', '16, 185, 129'];

function nivelDoAparelho() {
  const nav = typeof navigator !== 'undefined' ? navigator : {};
  const economia = nav.connection?.saveData === true;
  const poucosNucleos = (nav.hardwareConcurrency || 8) <= 4;
  const poucaMemoria = (nav.deviceMemory || 8) <= 4;
  const telaPequena = window.innerWidth < 760;
  return economia || poucosNucleos || poucaMemoria || telaPequena ? 'economico' : 'completo';
}

function spriteBrilho(cor) {
  const c = document.createElement('canvas');
  c.width = c.height = 48;
  const g = c.getContext('2d');
  const r = g.createRadialGradient(24, 24, 0, 24, 24, 24);
  r.addColorStop(0, `rgba(${cor}, 0.95)`);
  r.addColorStop(0.2, `rgba(${cor}, 0.4)`);
  r.addColorStop(1, `rgba(${cor}, 0)`);
  g.fillStyle = r;
  g.fillRect(0, 0, 48, 48);
  return c;
}

export default function TechBackground() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d', { alpha: true });
    const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const brilhos = Object.fromEntries(CORES.map((c) => [c, spriteBrilho(c)]));
    const ponteiro = { x: -9999, y: -9999, ativo: false };

    let nivel = nivelDoAparelho();
    let w = 0;
    let h = 0;
    let pontos = [];
    let raf = 0;
    let ultimo = 0;
    let distancia = 140;

    function montar() {
      nivel = nivelDoAparelho();
      const dpr = Math.min(window.devicePixelRatio || 1, nivel === 'economico' ? 1 : 1.5);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const area = w * h;
      const n = nivel === 'economico' ? Math.min(Math.round(area / 26000), 42) : Math.min(Math.round(area / 15000), 95);
      distancia = nivel === 'economico' ? 115 : Math.min(150, Math.max(110, w / 11));
      pontos = Array.from({ length: Math.max(n, 16) }, () => {
        const destaque = Math.random() < 0.12;
        const vel = 0.08 + Math.random() * 0.22;
        const ang = Math.random() * Math.PI * 2;
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          vx: Math.cos(ang) * vel,
          vy: Math.sin(ang) * vel,
          r: destaque ? 1.8 + Math.random() * 1.2 : 0.8 + Math.random() * 1.1,
          cor: CORES[destaque ? (Math.random() < 0.5 ? 0 : 2) : Math.floor(Math.random() * CORES.length)],
          destaque,
          fase: Math.random() * Math.PI * 2,
          prof: 0.3 + Math.random() * 0.7, // profundidade: afeta parallax e brilho
        };
      });
    }

    function desenhar(tempo) {
      ctx.clearRect(0, 0, w, h);
      const rolagem = window.scrollY || 0;
      const t = tempo / 1000;

      // Posição na tela com leve parallax de rolagem (mais fundo = move menos).
      const tela = pontos.map((p) => {
        let y = (p.y - rolagem * 0.04 * p.prof) % h;
        if (y < 0) y += h;
        return { x: p.x, y, p };
      });

      // Linhas de conexão
      const d2max = distancia * distancia;
      ctx.lineWidth = 0.7;
      for (let i = 0; i < tela.length; i++) {
        const a = tela[i];
        for (let j = i + 1; j < tela.length; j++) {
          const b = tela[j];
          const dx = a.x - b.x;
          if (dx > distancia || dx < -distancia) continue;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > d2max) continue;
          const forca = 1 - Math.sqrt(d2) / distancia;
          ctx.strokeStyle = `rgba(${a.p.cor}, ${(forca * 0.28 * (a.p.prof + b.p.prof)) / 2})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      // Linhas até o ponteiro
      if (ponteiro.ativo && !reduzido) {
        const raio = distancia * 1.35;
        for (const a of tela) {
          const dx = a.x - ponteiro.x;
          const dy = a.y - ponteiro.y;
          const d = Math.hypot(dx, dy);
          if (d > raio) continue;
          const forca = 1 - d / raio;
          ctx.strokeStyle = `rgba(106, 168, 255, ${forca * 0.45})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(ponteiro.x, ponteiro.y);
          ctx.stroke();
        }
      }

      // Pontos
      for (const a of tela) {
        const pulso = reduzido ? 1 : 0.7 + 0.3 * Math.sin(t * 1.4 + a.p.fase);
        if (a.p.destaque) {
          const tam = a.p.r * 9 * pulso;
          ctx.globalAlpha = 0.55 * a.p.prof;
          ctx.drawImage(brilhos[a.p.cor], a.x - tam / 2, a.y - tam / 2, tam, tam);
          ctx.globalAlpha = 1;
        }
        ctx.fillStyle = `rgba(${a.p.cor}, ${(0.45 + 0.5 * a.p.prof) * pulso})`;
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function mover(dt) {
      for (const p of pontos) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        // Leve afastamento do ponteiro (profundidade)
        if (ponteiro.ativo) {
          const dx = p.x - ponteiro.x;
          const dy = p.y - ponteiro.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 9000 && d2 > 1) {
            const f = (1 - d2 / 9000) * 0.6 * dt;
            const d = Math.sqrt(d2);
            p.x += (dx / d) * f;
            p.y += (dy / d) * f;
          }
        }
        if (p.x < -20) p.x = w + 20;
        else if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        else if (p.y > h + 20) p.y = -20;
      }
    }

    function passo(tempo) {
      raf = requestAnimationFrame(passo);
      const intervalo = nivel === 'economico' ? 33 : 16;
      if (tempo - ultimo < intervalo) return;
      const dt = Math.min(tempo - ultimo, 66) / 16.6;
      ultimo = tempo;
      mover(dt);
      desenhar(tempo);
    }

    function iniciar() {
      cancelAnimationFrame(raf);
      if (reduzido) {
        desenhar(0);
        return;
      }
      ultimo = performance.now();
      raf = requestAnimationFrame(passo);
    }

    let espera = 0;
    function aoRedimensionar() {
      clearTimeout(espera);
      espera = setTimeout(() => {
        // Teclado virtual no celular muda só a altura: não vale recriar tudo.
        if (Math.abs(window.innerWidth - w) < 2 && Math.abs(window.innerHeight - h) < 140) return;
        montar();
        if (reduzido) desenhar(0);
      }, 180);
    }
    function aoMoverPonteiro(e) {
      if (e.pointerType === 'touch') return;
      ponteiro.x = e.clientX;
      ponteiro.y = e.clientY;
      ponteiro.ativo = true;
    }
    function aoSairPonteiro() {
      ponteiro.ativo = false;
    }
    function aoMudarVisibilidade() {
      if (document.hidden) cancelAnimationFrame(raf);
      else iniciar();
    }

    montar();
    iniciar();
    window.addEventListener('resize', aoRedimensionar, { passive: true });
    document.addEventListener('visibilitychange', aoMudarVisibilidade);
    if (!reduzido) {
      window.addEventListener('pointermove', aoMoverPonteiro, { passive: true });
      document.documentElement.addEventListener('pointerleave', aoSairPonteiro);
    }
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(espera);
      window.removeEventListener('resize', aoRedimensionar);
      document.removeEventListener('visibilitychange', aoMudarVisibilidade);
      window.removeEventListener('pointermove', aoMoverPonteiro);
      document.documentElement.removeEventListener('pointerleave', aoSairPonteiro);
    };
  }, []);

  return (
    <div className="fundo" aria-hidden="true">
      <div className="fundo__luz fundo__luz--azul" />
      <div className="fundo__luz fundo__luz--verde" />
      <div className="fundo__grade" />
      <canvas ref={ref} className="fundo__canvas" />
      <div className="fundo__vinheta" />
    </div>
  );
}

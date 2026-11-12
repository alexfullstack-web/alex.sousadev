// Fundo de estrelas do site inteiro: três camadas (distantes, médias e próximas) que cintilam,
// derivam devagar e se movem em velocidades diferentes na rolagem (profundidade), com uma
// estrela cadente de vez em quando. Um único <canvas> fixo, pensado para ser leve:
//  - quantidade de estrelas proporcional à tela (com teto) e densidade de pixels limitada;
//  - o brilho das estrelas próximas é uma imagem pronta (não recalcula gradiente a cada quadro);
//  - pausa com a aba escondida; ~30 quadros/s em telas pequenas;
//  - "prefers-reduced-motion": céu parado, sem cintilar e sem estrela cadente.
import { useEffect, useRef } from 'react';

const CAMADAS = [
  // densidade: estrelas por 10.000 px² · tamanho · velocidade de deriva · parallax na rolagem
  { densidade: 1.5, raio: [0.45, 0.9], brilho: [0.35, 0.75], deriva: 0.012, parallax: 0.03, cores: ['200, 214, 235', '160, 190, 230'] },
  { densidade: 0.6, raio: [0.8, 1.4], brilho: [0.6, 0.95], deriva: 0.025, parallax: 0.08, cores: ['230, 240, 255', '150, 210, 255'] },
  { densidade: 0.13, raio: [1.3, 2.2], brilho: [0.8, 1], deriva: 0.045, parallax: 0.16, cores: ['255, 255, 255', '92, 200, 255', '31, 111, 235'], halo: true },
];
const TETO = 700;

function spriteHalo(cor) {
  const c = document.createElement('canvas');
  c.width = c.height = 32;
  const g = c.getContext('2d');
  const r = g.createRadialGradient(16, 16, 0, 16, 16, 16);
  r.addColorStop(0, `rgba(${cor}, 0.9)`);
  r.addColorStop(0.25, `rgba(${cor}, 0.35)`);
  r.addColorStop(1, `rgba(${cor}, 0)`);
  g.fillStyle = r;
  g.fillRect(0, 0, 32, 32);
  return c;
}

export default function StarBackground() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const halos = {};
    let w = 0;
    let h = 0;
    let altura = 0; // céu um pouco mais alto que a tela, para a rolagem não mostrar "buracos"
    let estrelas = [];
    let cadente = null;
    let proximaCadente = 0;
    let raf = 0;
    let ultimo = 0;
    let semente = 11;
    const rnd = () => ((semente = (semente * 16807) % 2147483647) / 2147483647);
    const entre = ([a, b]) => a + rnd() * (b - a);

    function montar() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = window.innerWidth;
      h = window.innerHeight;
      altura = h * 1.5;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      semente = 11;
      estrelas = [];
      const area = (w * altura) / 10000;
      for (const [indice, c] of CAMADAS.entries()) {
        const n = Math.min(Math.round(area * c.densidade), Math.round(TETO * (c.densidade / 2.23)));
        for (let i = 0; i < n; i++) {
          const cor = c.cores[Math.floor(rnd() * c.cores.length)];
          if (c.halo && !halos[cor]) halos[cor] = spriteHalo(cor);
          estrelas.push({
            camada: indice,
            x: rnd() * w,
            y: rnd() * altura,
            r: entre(c.raio),
            base: entre(c.brilho),
            fase: rnd() * Math.PI * 2,
            ritmo: 0.6 + rnd() * 1.6, // velocidade da cintilação
            cor,
          });
        }
      }
    }

    function novaCadente(tempo) {
      const daEsquerda = Math.random() > 0.5;
      cadente = {
        x: daEsquerda ? Math.random() * w * 0.5 : w * 0.5 + Math.random() * w * 0.5,
        y: Math.random() * h * 0.45,
        vx: (daEsquerda ? 1 : -1) * (7 + Math.random() * 4),
        vy: 2.5 + Math.random() * 2,
        vida: 1,
      };
      proximaCadente = tempo + 7000 + Math.random() * 9000;
    }

    function desenhar(tempo) {
      const rolagem = window.scrollY || 0;
      ctx.clearRect(0, 0, w, h);
      for (const s of estrelas) {
        const c = CAMADAS[s.camada];
        let y = (s.y - rolagem * c.parallax) % altura;
        if (y < 0) y += altura;
        if (y > h + 4) continue;
        const cintila = reduzido ? 1 : 0.65 + 0.35 * Math.sin((tempo / 1000) * s.ritmo + s.fase);
        const a = s.base * cintila;
        if (c.halo) {
          const tam = s.r * 7;
          ctx.globalAlpha = a * 0.8;
          ctx.drawImage(halos[s.cor], s.x - tam / 2, y - tam / 2, tam, tam);
          ctx.globalAlpha = 1;
          ctx.fillStyle = `rgba(255, 255, 255, ${a})`;
          ctx.beginPath();
          ctx.arc(s.x, y, s.r * 0.55, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // estrelas pequenas: um quadradinho é mais barato que um círculo e fica igual na tela
          ctx.fillStyle = `rgba(${s.cor}, ${a})`;
          ctx.fillRect(s.x - s.r, y - s.r, s.r * 2, s.r * 2);
        }
      }
      if (cadente) {
        const { x, y, vx, vy, vida } = cadente;
        const rastro = 14;
        const g = ctx.createLinearGradient(x, y, x - vx * rastro, y - vy * rastro);
        g.addColorStop(0, `rgba(255, 255, 255, ${0.9 * vida})`);
        g.addColorStop(0.3, `rgba(92, 200, 255, ${0.45 * vida})`);
        g.addColorStop(1, 'rgba(92, 200, 255, 0)');
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - vx * rastro, y - vy * rastro);
        ctx.stroke();
      }
    }

    function passo(tempo) {
      raf = requestAnimationFrame(passo);
      const intervalo = w < 760 ? 33 : 16;
      if (tempo - ultimo < intervalo) return;
      const dt = Math.min(tempo - ultimo, 64) / 16;
      ultimo = tempo;
      for (const s of estrelas) {
        s.x -= CAMADAS[s.camada].deriva * dt;
        if (s.x < -4) s.x = w + 4;
      }
      if (!cadente && tempo > proximaCadente) novaCadente(tempo);
      if (cadente) {
        cadente.x += cadente.vx * dt;
        cadente.y += cadente.vy * dt;
        cadente.vida -= 0.012 * dt;
        if (cadente.vida <= 0 || cadente.x < -200 || cadente.x > w + 200 || cadente.y > h) cadente = null;
      }
      desenhar(tempo);
    }

    montar();
    desenhar(0);
    proximaCadente = performance.now() + 2500;
    let agendado = 0;
    const aoRolar = () => {
      // Sem animação contínua (movimento reduzido), redesenha só quando a página rola.
      if (reduzido && !agendado) {
        agendado = requestAnimationFrame(() => {
          agendado = 0;
          desenhar(0);
        });
      }
    };
    const aoRedimensionar = () => {
      montar();
      desenhar(performance.now());
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
      cancelAnimationFrame(agendado);
      window.removeEventListener('resize', aoRedimensionar);
      window.removeEventListener('scroll', aoRolar);
      document.removeEventListener('visibilitychange', visibilidade);
    };
  }, []);
  return (
    <div className="fundo" aria-hidden="true">
      <div className="fundo__nebulosa" />
      <canvas ref={ref} className="fundo__canvas" />
      <div className="fundo__vinheta" />
    </div>
  );
}

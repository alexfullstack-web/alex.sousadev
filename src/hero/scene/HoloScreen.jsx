import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { HOLO_CODES, TIMELINE, progress, easeOutExpo, variantState, ASTRO_VARIANTS, SWITCH } from '../config.js';

/*
  Painel holográfico GRANDE de código ao lado do astronauta.
  O código é desenhado em canvas 2D (texto nítido) e só é redesenhado
  quando muda. A cada troca de astronauta um novo trecho é digitado.
*/
const W = 1024;
const H = 704;
const CPS = 42; // caracteres por segundo

const COLORS = {
  kw: '#7fb0ff',
  id: '#ffffff',
  prop: '#9fd0ff',
  bool: '#5ee1ff',
  str: '#b7c8ff',
  fn: '#4fa3ff',
  p: '#c6d4ec',
};

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

const fragment = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uOpen;
  uniform float uTime;
  uniform float uGlitch;
  varying vec2 vUv;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
  void main() {
    float reveal = step(abs(vUv.y - 0.5) * 2.0, uOpen);
    vec2 uv = vUv;
    float g = step(0.985 - uGlitch * 0.2, hash(vec2(floor(uTime * 12.0), floor(uv.y * 40.0))));
    uv.x += g * (0.006 + uGlitch * 0.02);

    vec4 tex = texture2D(uMap, uv);
    vec3 base = vec3(0.04, 0.16, 0.42);
    float edgeX = min(vUv.x, 1.0 - vUv.x);
    float edgeY = min(vUv.y, 1.0 - vUv.y);
    float edge = min(edgeX * 1.55, edgeY);
    float frame = smoothstep(0.008, 0.0, edge) * 0.95 + smoothstep(0.06, 0.0, edge) * 0.22;
    // cantoneiras
    float cx = step(edgeX, 0.06) * step(edgeY, 0.09);
    frame += cx * smoothstep(0.016, 0.0, edge) * 0.8;
    float scan = 0.84 + 0.16 * sin(vUv.y * 560.0 + uTime * 3.0);
    float sweep = exp(-pow((vUv.y - fract(uTime * 0.16)) * 16.0, 2.0)) * 0.16;
    float flicker = mix(0.55 + 0.45 * step(0.4, hash(vec2(floor(uTime * 30.0), 1.0))), 1.0, smoothstep(0.6, 1.0, uOpen));

    vec3 col = base * 0.6 + tex.rgb * tex.a * 1.75;
    col += vec3(0.35, 0.62, 1.0) * (frame + sweep);
    float a = (0.34 + tex.a * 0.9 + frame * 0.8 + sweep) * scan * flicker * reveal * smoothstep(0.0, 0.25, uOpen);
    gl_FragColor = vec4(col * scan, clamp(a, 0.0, 1.0));
  }
`;

const totalChars = (lines) => lines.reduce((n, line) => n + line.reduce((m, [t]) => m + t.length, 0) + 1, 0);
const TOTALS = HOLO_CODES.map((c) => totalChars(c.lines));

function drawFrame(ctx, snippet, typedChars, caretOn, showOutput) {
  ctx.clearRect(0, 0, W, H);

  ctx.fillStyle = 'rgba(120,170,255,0.16)';
  ctx.fillRect(0, 0, W, 58);
  ['#4c8dff', '#8ab2ff', '#cfe0ff'].forEach((c, i) => {
    ctx.beginPath();
    ctx.fillStyle = c;
    ctx.arc(34 + i * 28, 29, 8, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.font = '500 25px "IBM Plex Mono", monospace';
  ctx.fillStyle = 'rgba(215,228,255,0.92)';
  ctx.fillText(snippet.file, 136, 38);
  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(140,180,255,0.8)';
  ctx.fillText('AS · TECH', W - 30, 38);
  ctx.textAlign = 'left';

  const lineH = 44;
  const top = 108;
  ctx.font = '500 30px "IBM Plex Mono", monospace';
  let remaining = typedChars;
  let caret = null;
  snippet.lines.forEach((tokens, li) => {
    const y = top + li * lineH;
    ctx.fillStyle = 'rgba(120,150,210,0.45)';
    ctx.fillText(String(li + 1).padStart(2, ' '), 22, y);
    let x = 84;
    if (remaining <= 0) return;
    for (const [text, kind] of tokens) {
      if (remaining <= 0) break;
      const part = text.slice(0, remaining);
      remaining -= part.length;
      ctx.fillStyle = COLORS[kind] || '#fff';
      ctx.fillText(part, x, y);
      x += ctx.measureText(part).width;
    }
    remaining -= 1;
    caret = { x, y };
  });

  if (showOutput) {
    const y = top + snippet.lines.length * lineH + 14;
    ctx.fillStyle = 'rgba(94,225,255,0.95)';
    ctx.fillText(snippet.output, 84, y);
  }

  if (caret && caretOn) {
    ctx.fillStyle = '#9fd0ff';
    ctx.fillRect(caret.x + 3, caret.y - 25, 15, 31);
  }
}

export default function HoloScreen({ clock, size = [3.4, 2.34], ...props }) {
  const matRef = useRef();
  const meshRef = useRef();
  const state = useRef({ key: '' });

  const { ctx, texture } = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    texture.anisotropy = 4;
    return { ctx, texture };
  }, []);

  useEffect(() => {
    let alive = true;
    if (document.fonts && document.fonts.load) {
      document.fonts.load('500 27px "IBM Plex Mono"').finally(() => {
        if (alive) state.current.key = ''; // força redesenho com a fonte correta
      });
    }
    return () => {
      alive = false;
      texture.dispose();
    };
  }, [texture]);

  const uniforms = useMemo(
    () => ({ uMap: { value: texture }, uOpen: { value: 0 }, uTime: { value: 0 }, uGlitch: { value: 0 } }),
    [texture]
  );

  useFrame((s) => {
    const t = clock.current;
    const open = easeOutExpo(progress(t, TIMELINE.holoOpen));
    const vs = variantState(t, ASTRO_VARIANTS.length);
    const u = matRef.current.uniforms;
    u.uOpen.value = open;
    u.uTime.value = s.clock.elapsedTime;
    // glitch curto durante a troca de astronauta
    u.uGlitch.value = vs.cycle > 0 ? Math.max(0, 1 - vs.cycleTime / 0.8) : 0;
    meshRef.current.visible = open > 0.001;
    meshRef.current.position.y = props.position[1] + Math.sin(s.clock.elapsedTime * 0.9) * 0.03;

    const idx = vs.current % HOLO_CODES.length;
    const snippet = HOLO_CODES[idx];
    const total = TOTALS[idx];
    const typeStart = vs.cycle === 0 ? TIMELINE.codeStart : 0.6;
    const elapsed = (vs.cycle === 0 ? t : vs.cycleTime) - typeStart;
    const typed = Math.max(0, Math.min(total, Math.floor(elapsed * CPS)));
    const caretOn = Math.floor(s.clock.elapsedTime * 2.2) % 2 === 0;
    const output = typed >= total && elapsed > total / CPS + 0.6;
    const key = `${idx}|${typed}|${caretOn}|${output}`;
    if (open > 0 && key !== state.current.key) {
      state.current.key = key;
      drawFrame(ctx, snippet, typed, caretOn, output);
      texture.needsUpdate = true;
    }
  });

  return (
    <mesh ref={meshRef} renderOrder={8} {...props}>
      <planeGeometry args={size} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export { SWITCH };

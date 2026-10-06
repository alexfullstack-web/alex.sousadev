import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { HOLO_CODE, TIMELINE, progress, easeOutExpo } from '../config.js';

/*
  Interface holográfica projetada pelo notebook. O código é desenhado em um
  canvas 2D (texto nítido) e só é redesenhado quando muda — não a cada frame.
  O shader adiciona scanlines, moldura brilhante, flicker de abertura e ruído.
*/
const W = 768;
const H = 492;

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
  varying vec2 vUv;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
  void main() {
    // abertura: revela do centro para as bordas (vertical)
    float reveal = step(abs(vUv.y - 0.5) * 2.0, uOpen);
    vec2 uv = vUv;
    // leve distorção horizontal ocasional (glitch muito sutil)
    float g = step(0.985, hash(vec2(floor(uTime * 8.0), floor(uv.y * 30.0))));
    uv.x += g * 0.006;

    vec4 tex = texture2D(uMap, uv);
    vec3 base = vec3(0.04, 0.16, 0.42);
    float edgeX = min(vUv.x, 1.0 - vUv.x);
    float edgeY = min(vUv.y, 1.0 - vUv.y);
    float edge = min(edgeX * 1.6, edgeY);
    float frame = smoothstep(0.012, 0.0, edge) * 0.9 + smoothstep(0.08, 0.0, edge) * 0.25;
    float scan = 0.82 + 0.18 * sin(vUv.y * 420.0 + uTime * 3.0);
    float sweep = exp(-pow((vUv.y - fract(uTime * 0.18)) * 18.0, 2.0)) * 0.18;
    float flicker = mix(0.55 + 0.45 * step(0.4, hash(vec2(floor(uTime * 30.0), 1.0))), 1.0, smoothstep(0.6, 1.0, uOpen));

    vec3 col = base * 0.6 + tex.rgb * tex.a * 1.7;
    col += vec3(0.35, 0.62, 1.0) * (frame + sweep);
    float a = (0.3 + tex.a * 0.9 + frame * 0.8 + sweep) * scan * flicker * reveal * smoothstep(0.0, 0.25, uOpen);
    gl_FragColor = vec4(col * scan, clamp(a, 0.0, 1.0));
  }
`;

function drawFrame(ctx, typedChars, caretOn, showOutput) {
  ctx.clearRect(0, 0, W, H);

  // barra de título
  ctx.fillStyle = 'rgba(120,170,255,0.16)';
  ctx.fillRect(0, 0, W, 44);
  ['#4c8dff', '#8ab2ff', '#cfe0ff'].forEach((c, i) => {
    ctx.beginPath();
    ctx.fillStyle = c;
    ctx.arc(26 + i * 22, 22, 6, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.font = '500 19px "IBM Plex Mono", monospace';
  ctx.fillStyle = 'rgba(210,225,255,0.85)';
  ctx.fillText('alexSousaTech.js', 104, 29);
  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(140,180,255,0.75)';
  ctx.fillText('AS · TECH', W - 22, 29);
  ctx.textAlign = 'left';

  // código
  const lineH = 31;
  const top = 80;
  ctx.font = '500 21px "IBM Plex Mono", monospace';
  let remaining = typedChars;
  let caret = null;
  HOLO_CODE.forEach((tokens, li) => {
    const y = top + li * lineH;
    ctx.fillStyle = 'rgba(120,150,210,0.45)';
    ctx.fillText(String(li + 1).padStart(2, ' '), 18, y);
    let x = 66;
    if (remaining <= 0) return;
    for (const [text, kind] of tokens) {
      if (remaining <= 0) break;
      const part = text.slice(0, remaining);
      remaining -= part.length;
      ctx.fillStyle = COLORS[kind] || '#fff';
      ctx.fillText(part, x, y);
      x += ctx.measureText(part).width;
    }
    remaining -= 1; // quebra de linha
    caret = { x, y };
  });

  if (showOutput) {
    const y = top + HOLO_CODE.length * lineH + 10;
    ctx.fillStyle = 'rgba(94,225,255,0.95)';
    ctx.fillText('✓ deploy concluído → Alex Sousa Tech', 66, y);
  }

  if (caret && caretOn) {
    ctx.fillStyle = '#9fd0ff';
    ctx.fillRect(caret.x + 2, caret.y - 18, 11, 23);
  }
}

const TOTAL_CHARS = HOLO_CODE.reduce((n, line) => n + line.reduce((m, [t]) => m + t.length, 0) + 1, 0);

export default function HoloScreen({ clock, size = [2.0, 1.28], ...props }) {
  const matRef = useRef();
  const meshRef = useRef();
  const state = useRef({ typed: -1, caret: false, output: false, fontReady: false });

  const { canvas, ctx, texture } = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    texture.anisotropy = 4;
    return { canvas, ctx, texture };
  }, []);

  useEffect(() => {
    let alive = true;
    if (document.fonts && document.fonts.load) {
      document.fonts.load('500 21px "IBM Plex Mono"').finally(() => {
        if (alive) {
          state.current.fontReady = true;
          state.current.typed = -1; // força redesenho com a fonte correta
        }
      });
    }
    return () => {
      alive = false;
      texture.dispose();
    };
  }, [texture]);

  const uniforms = useMemo(() => ({ uMap: { value: texture }, uOpen: { value: 0 }, uTime: { value: 0 } }), [texture]);

  useFrame((s) => {
    const t = clock.current;
    const open = easeOutExpo(progress(t, TIMELINE.holoOpen));
    const u = matRef.current.uniforms;
    u.uOpen.value = open;
    u.uTime.value = s.clock.elapsedTime;
    meshRef.current.visible = open > 0.001;
    meshRef.current.position.y = props.position[1] + Math.sin(s.clock.elapsedTime * 0.9) * 0.03;

    // digitação: ~38 caracteres/s
    const typed = Math.max(0, Math.min(TOTAL_CHARS, Math.floor((t - TIMELINE.codeStart) * 38)));
    const caretOn = Math.floor(s.clock.elapsedTime * 2.2) % 2 === 0;
    const output = typed >= TOTAL_CHARS && t > TIMELINE.codeStart + TOTAL_CHARS / 38 + 0.8;
    const st = state.current;
    if (open > 0 && (typed !== st.typed || caretOn !== st.caret || output !== st.output)) {
      st.typed = typed;
      st.caret = caretOn;
      st.output = output;
      drawFrame(ctx, typed, caretOn, output);
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

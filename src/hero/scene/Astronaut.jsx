import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TIMELINE, ASTRO_VARIANTS, progress, easeOutCubic, variantState } from '../config.js';
import { Glow } from './Glows.jsx';
import HoloScreen from './HoloScreen.jsx';

/*
  Astronautas 2.5D (arte da marca recortada) que se revezam com um
  dissolve holográfico. Cada um tem luz de contorno azul; o visor recebe
  reflexos de código animados; o notebook acende e projeta o holograma.
*/
export const ASTRO_W = 4.4;
export const ASTRO_H = 6.6;

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

const fragment = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uTime;
  uniform float uReveal;
  uniform float uVisor;
  uniform float uRim;
  uniform float uFade;
  uniform vec2 uVisorC;
  uniform vec2 uVisorR;
  uniform vec2 uTexel;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) { vec2 i = floor(p); vec2 f = fract(p); f = f*f*(3.0-2.0*f);
    return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }

  float codeLines(vec2 p, float t) {
    float rows = 15.0;
    float y = p.y * rows + t * 1.6;
    float row = floor(y);
    float fy = fract(y);
    float lineMask = smoothstep(0.18, 0.3, fy) * smoothstep(0.62, 0.5, fy);
    float indent = floor(hash(vec2(row, 3.0)) * 4.0) * 0.07;
    float len = 0.25 + hash(vec2(row, 7.0)) * 0.75;
    float x = (p.x + 1.0) * 0.5 - indent;
    float cell = floor(x * 26.0);
    float token = step(0.22, hash(vec2(row, cell)));
    float inside = step(0.0, x) * step(x, len);
    float blink = 0.65 + 0.35 * sin(t * 6.0 + row);
    return lineMask * token * inside * blink;
  }

  void main() {
    vec4 tex = texture2D(uMap, vUv);
    vec3 col = tex.rgb;
    float alpha = tex.a;

    col = pow(col, vec3(1.06));
    col *= vec3(0.94, 0.98, 1.08);

    vec2 lightDir = normalize(vec2(-1.0, -0.8));
    float aOff = texture2D(uMap, vUv + lightDir * uTexel * 7.0).a;
    float rim = clamp(alpha - aOff, 0.0, 1.0);
    vec2 lightDir2 = normalize(vec2(1.0, -0.2));
    float aOff2 = texture2D(uMap, vUv + lightDir2 * uTexel * 5.0).a;
    float rim2 = clamp(alpha - aOff2, 0.0, 1.0);
    col += vec3(0.35, 0.6, 1.0) * rim * 0.9 * uRim;
    col += vec3(0.2, 0.4, 1.0) * rim2 * 0.45 * uRim;

    if (uVisor > 0.0) {
      vec2 vp = (vUv - uVisorC) / uVisorR;
      float visorMask = 1.0 - smoothstep(0.78, 1.0, length(vp));
      float glassish = smoothstep(0.08, 0.35, tex.b - max(tex.r, tex.g) * 0.55) + smoothstep(0.1, 0.0, max(col.r, max(col.g, col.b)));
      visorMask *= clamp(glassish, 0.0, 1.0);
      vec2 curved = vp / (1.0 + 0.28 * dot(vp, vp));
      float code = codeLines(curved, uTime);
      vec3 codeCol = mix(vec3(0.3, 0.62, 1.0), vec3(0.75, 0.9, 1.0), hash(vec2(floor(curved.y * 15.0 + uTime * 1.6), 1.0)));
      col += codeCol * code * visorMask * 0.42 * uVisor;
      float sweepPos = fract(uTime * 0.13) * 3.4 - 1.7;
      float sweep = exp(-pow((vp.x * 0.8 + vp.y * 0.6 - sweepPos) * 3.2, 2.0));
      col += vec3(0.55, 0.75, 1.0) * sweep * visorMask * 0.22 * uVisor;
    }

    alpha *= smoothstep(0.0, uFade, vUv.y);

    // dissolve holográfico (entrada/saída/troca)
    float n = noise(vUv * vec2(26.0, 40.0)) * 0.65 + noise(vUv * 6.0) * 0.35;
    float scanY = vUv.y + sin(vUv.x * 30.0 + uTime) * 0.01;
    float th = uReveal * 1.25 - 0.12;
    float field = n * 0.55 + (1.0 - scanY) * 0.45; // materializa de cima para baixo
    float vis = smoothstep(th + 0.02, th - 0.02, field);
    float edge = smoothstep(0.07, 0.0, abs(field - th)) * step(0.001, uReveal) * step(uReveal, 0.999);
    float lines = step(0.5, fract(vUv.y * 180.0));
    col += vec3(0.3, 0.6, 1.0) * edge * 2.2 * alpha;
    col = mix(col, col + vec3(0.1, 0.25, 0.6) * lines, (1.0 - uReveal) * 0.6);
    float a = alpha * max(vis, edge * 0.9);

    if (a < 0.003) discard;
    gl_FragColor = vec4(col, a);
  }
`;

function VariantMesh({ variant, texture, matRef }) {
  const uniforms = useMemo(() => {
    const img = texture.image;
    return {
      uMap: { value: texture },
      uTime: { value: 0 },
      uReveal: { value: 0 },
      uVisor: { value: 0 },
      uRim: { value: 0 },
      uFade: { value: variant.fade },
      uVisorC: { value: new THREE.Vector2(...(variant.visor ? variant.visor.c : [0, 0])) },
      uVisorR: { value: new THREE.Vector2(...(variant.visor ? variant.visor.r : [1, 1])) },
      uTexel: { value: new THREE.Vector2(1 / (img?.width || 1024), 1 / (img?.height || 1536)) },
    };
  }, [texture, variant]);
  const w = variant.h * variant.aspect;
  return (
    <mesh position={[0, variant.top - variant.h / 2, 0]} renderOrder={5}>
      <planeGeometry args={[w, variant.h]} />
      <shaderMaterial ref={matRef} vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} transparent depthWrite={false} />
    </mesh>
  );
}

const beamFragment = /* glsl */ `
  uniform float uOpacity;
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    float w = mix(0.08, 0.5, vUv.y);
    float x = abs(vUv.x - 0.5);
    float edge = smoothstep(w, w * 0.55, x);
    float lines = 0.75 + 0.25 * sin(vUv.y * 60.0 - uTime * 4.0);
    float a = edge * mix(0.55, 0.12, vUv.y) * lines * uOpacity;
    gl_FragColor = vec4(0.35, 0.62, 1.0, a);
  }
`;

export default function Astronaut({ textures, clock, layout, pointer, groupRef }) {
  const innerRef = useRef();
  const matRefs = useRef([]);
  const backGlowRef = useRef();
  const laptopGlowRef = useRef();
  const beamRef = useRef();
  const beamUniforms = useMemo(() => ({ uOpacity: { value: 0 }, uTime: { value: 0 } }), []);

  useFrame((state) => {
    const t = clock.current;
    const time = state.clock.elapsedTime;
    const inP = easeOutCubic(progress(t, TIMELINE.astroIn));
    const visorP = progress(t, TIMELINE.visor);
    const laptopP = progress(t, TIMELINE.laptopGlow);
    const holoP = progress(t, TIMELINE.holoOpen);
    const vs = variantState(t, ASTRO_VARIANTS.length);

    const g = groupRef.current;
    g.position.set(layout.x - (1 - inP) * 2.2 * layout.scale, layout.y + Math.sin(time * 0.55) * 0.07, 0);
    g.scale.setScalar(layout.scale);
    const inner = innerRef.current;
    inner.rotation.z = Math.sin(time * 0.38) * 0.014 + (1 - inP) * 0.06;
    inner.rotation.y = pointer.current.x * 0.05 * inP;
    inner.rotation.x = -pointer.current.y * 0.02 * inP;

    let laptopW = 0;
    ASTRO_VARIANTS.forEach((v, i) => {
      const mat = matRefs.current[i];
      if (!mat) return;
      const reveal = vs.reveal[i] * (i === 0 && vs.cycle === 0 ? inP : 1);
      const u = mat.uniforms;
      u.uTime.value = time;
      u.uReveal.value = reveal;
      u.uVisor.value = v.visor ? visorP * v.visor.amount : 0;
      u.uRim.value = 0.55 + inP * 0.45;
      mat.visible = reveal > 0.001;
      if (v.laptop) laptopW = Math.max(laptopW, reveal);
    });

    backGlowRef.current.uniforms.uOpacity.value = 0.32 * inP + Math.sin(time * 0.8) * 0.03;
    const pulse = 0.8 + Math.sin(time * 2.1) * 0.2;
    laptopGlowRef.current.uniforms.uOpacity.value = laptopP * 0.55 * pulse * laptopW;
    beamRef.current.uniforms.uOpacity.value = holoP * 0.6 * laptopW;
    beamRef.current.uniforms.uTime.value = time;
  });

  return (
    <group ref={groupRef}>
      <group ref={innerRef}>
        <Glow ref={backGlowRef} size={[7.5, 8.5]} position={[0.1, 0.9, -1.2]} color="#1f5bff" power={2.0} opacity={0} renderOrder={1} />

        {ASTRO_VARIANTS.map((v, i) => (
          <VariantMesh key={v.key} variant={v} texture={textures[i]} matRef={(m) => (matRefs.current[i] = m)} />
        ))}

        <Glow ref={laptopGlowRef} size={[2.6, 2.0]} position={[1.25, 0.05, 0.12]} color="#3f86ff" power={2.4} opacity={0} renderOrder={6} />

        <group position={layout.holo.pos} scale={layout.holo.scale}>
          <mesh position={[-0.6, -1.62, -0.15]} rotation={[0, -0.3, 0]} renderOrder={7}>
            <planeGeometry args={[2.8, 0.95]} />
            <shaderMaterial
              ref={beamRef}
              vertexShader={vertex}
              fragmentShader={beamFragment}
              uniforms={beamUniforms}
              transparent
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          <HoloScreen clock={clock} position={[0, 0, 0]} rotation={[0, -0.24, 0]} />
        </group>
      </group>
    </group>
  );
}

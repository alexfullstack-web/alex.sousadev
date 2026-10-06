import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TIMELINE, progress, easeOutCubic } from '../config.js';
import { Glow } from './Glows.jsx';
import HoloScreen from './HoloScreen.jsx';

/*
  Astronauta: arte 2.5D (imagem recortada da marca) em um plano com shader
  próprio — luz de contorno azul, reflexos de código animados no visor,
  brilho especular varrendo o vidro e fade inferior.
  Mantém o visual realista da arte original sem carregar um modelo 3D pesado.
*/

export const ASTRO_W = 4.4;
export const ASTRO_H = 6.6;
// visor (coordenadas UV da imagem)
const VISOR_CENTER = new THREE.Vector2(0.505, 0.83);
const VISOR_RADIUS = new THREE.Vector2(0.128, 0.088);

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
  uniform vec2 uVisorC;
  uniform vec2 uVisorR;
  uniform vec2 uTexel;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  // linhas de código procedurais rolando (vistas como reflexo no vidro)
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
    // linha "sendo digitada" pisca
    float blink = 0.65 + 0.35 * sin(t * 6.0 + row);
    return lineMask * token * inside * blink;
  }

  void main() {
    vec4 tex = texture2D(uMap, vUv);
    vec3 col = tex.rgb;
    float alpha = tex.a;

    // grading suave: pretos densos, azul elétrico vivo
    col = pow(col, vec3(1.06));
    col *= vec3(0.94, 0.98, 1.08);

    // luz de contorno (rim) vinda do canto superior direito
    vec2 lightDir = normalize(vec2(-1.0, -0.8));
    float aOff = texture2D(uMap, vUv + lightDir * uTexel * 7.0).a;
    float rim = clamp(alpha - aOff, 0.0, 1.0);
    vec2 lightDir2 = normalize(vec2(1.0, -0.2));
    float aOff2 = texture2D(uMap, vUv + lightDir2 * uTexel * 5.0).a;
    float rim2 = clamp(alpha - aOff2, 0.0, 1.0);
    col += vec3(0.35, 0.6, 1.0) * rim * 0.9 * uRim;
    col += vec3(0.2, 0.4, 1.0) * rim2 * 0.45 * uRim;

    // visor: reflexo animado de código + varredura especular
    vec2 vp = (vUv - uVisorC) / uVisorR;
    float vr = length(vp);
    float visorMask = 1.0 - smoothstep(0.78, 1.0, vr);
    float glassish = smoothstep(0.08, 0.35, tex.b - max(tex.r, tex.g) * 0.55) + smoothstep(0.1, 0.0, max(col.r, max(col.g, col.b)));
    visorMask *= clamp(glassish, 0.0, 1.0);
    vec2 curved = vp / (1.0 + 0.28 * dot(vp, vp));
    float code = codeLines(curved, uTime);
    vec3 codeCol = mix(vec3(0.3, 0.62, 1.0), vec3(0.75, 0.9, 1.0), hash(vec2(floor(curved.y * 15.0 + uTime * 1.6), 1.0)));
    col += codeCol * code * visorMask * 0.42 * uVisor;
    float sweepPos = fract(uTime * 0.13) * 3.4 - 1.7;
    float sweep = exp(-pow((vp.x * 0.8 + vp.y * 0.6 - sweepPos) * 3.2, 2.0));
    col += vec3(0.55, 0.75, 1.0) * sweep * visorMask * 0.22 * uVisor;

    // fade inferior (a arte é cortada nas pernas)
    alpha *= smoothstep(0.0, 0.16, vUv.y);
    // materialização na entrada
    alpha *= uReveal;
    col *= mix(1.6, 1.0, uReveal);

    if (alpha < 0.003) discard;
    gl_FragColor = vec4(col, alpha);
  }
`;

const beamVertex = vertex;
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

export default function Astronaut({ texture, clock, layout, pointer, groupRef }) {
  const innerRef = useRef();
  const matRef = useRef();
  const backGlowRef = useRef();
  const laptopGlowRef = useRef();
  const beamRef = useRef();

  const uniforms = useMemo(() => {
    const img = texture.image;
    return {
      uMap: { value: texture },
      uTime: { value: 0 },
      uReveal: { value: 0 },
      uVisor: { value: 0 },
      uRim: { value: 0 },
      uVisorC: { value: VISOR_CENTER },
      uVisorR: { value: VISOR_RADIUS },
      uTexel: { value: new THREE.Vector2(1 / (img?.width || 1024), 1 / (img?.height || 1536)) },
    };
  }, [texture]);

  const beamUniforms = useMemo(() => ({ uOpacity: { value: 0 }, uTime: { value: 0 } }), []);

  useFrame((state) => {
    const t = clock.current;
    const time = state.clock.elapsedTime;
    const inP = easeOutCubic(progress(t, TIMELINE.astroIn));
    const visorP = progress(t, TIMELINE.visor);
    const laptopP = progress(t, TIMELINE.laptopGlow);
    const holoP = progress(t, TIMELINE.holoOpen);

    // entrada pela esquerda + flutuação suave e contínua
    const g = groupRef.current;
    g.position.set(
      layout.x - (1 - inP) * 2.2 * layout.scale,
      layout.y + Math.sin(time * 0.55) * 0.07,
      0
    );
    g.scale.setScalar(layout.scale);
    const inner = innerRef.current;
    inner.rotation.z = Math.sin(time * 0.38) * 0.014 + (1 - inP) * 0.06;
    inner.rotation.y = pointer.current.x * 0.05 * inP;
    inner.rotation.x = -pointer.current.y * 0.02 * inP;

    const u = matRef.current.uniforms;
    u.uTime.value = time;
    u.uReveal.value = inP;
    u.uVisor.value = visorP;
    u.uRim.value = 0.55 + inP * 0.45;

    backGlowRef.current.uniforms.uOpacity.value = 0.32 * inP + Math.sin(time * 0.8) * 0.03;
    const pulse = 0.8 + Math.sin(time * 2.1) * 0.2;
    laptopGlowRef.current.uniforms.uOpacity.value = laptopP * 0.55 * pulse;
    beamRef.current.uniforms.uOpacity.value = holoP * 0.6;
    beamRef.current.uniforms.uTime.value = time;
  });

  return (
    <group ref={groupRef}>
      <group ref={innerRef}>
        {/* halo atrás do astronauta (iluminação de recorte) */}
        <Glow ref={backGlowRef} size={[7.5, 8.5]} position={[0.1, 0.9, -1.2]} color="#1f5bff" power={2.0} opacity={0} renderOrder={1} />

        <mesh renderOrder={5}>
          <planeGeometry args={[ASTRO_W, ASTRO_H]} />
          <shaderMaterial
            ref={matRef}
            vertexShader={vertex}
            fragmentShader={fragment}
            uniforms={uniforms}
            transparent
            depthWrite={false}
          />
        </mesh>

        {/* brilho azul do notebook */}
        <Glow ref={laptopGlowRef} size={[2.6, 2.0]} position={[1.25, 0.05, 0.12]} color="#3f86ff" power={2.4} opacity={0} renderOrder={6} />


        <group position={layout.holo.pos} scale={layout.holo.scale}>
          {/* feixe de projeção do notebook até o holograma */}
          <mesh position={[-0.06, -1.18, -0.15]} rotation={[0, -0.32, 0]} renderOrder={7}>
            <planeGeometry args={[1.95, 1.0]} />
            <shaderMaterial
              ref={beamRef}
              vertexShader={beamVertex}
              fragmentShader={beamFragment}
              uniforms={beamUniforms}
              transparent
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          <HoloScreen clock={clock} position={[0, 0, 0]} rotation={[0, -0.32, 0]} />
        </group>
      </group>
    </group>
  );
}

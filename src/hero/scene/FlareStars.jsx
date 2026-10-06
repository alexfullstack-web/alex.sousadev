import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* Estrelas de brilho intenso com cruz de difração (como na foto de referência). */
const vertex = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  attribute float aSize;
  attribute float aSeed;
  varying float vPulse;
  varying float vSeed;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vPulse = 0.75 + 0.25 * sin(uTime * (0.5 + aSeed) + aSeed * 30.0);
    vSeed = aSeed;
    gl_PointSize = aSize * uPixelRatio * vPulse;
    gl_Position = projectionMatrix * mv;
  }
`;

const fragment = /* glsl */ `
  varying float vPulse;
  varying float vSeed;
  void main() {
    vec2 c = (gl_PointCoord - 0.5) * 2.0;
    float d = length(c);
    float core = exp(-d * d * 60.0);
    float halo = exp(-d * 6.0) * 0.35;
    float spikeH = exp(-abs(c.y) * 70.0) * exp(-abs(c.x) * 3.2);
    float spikeV = exp(-abs(c.x) * 70.0) * exp(-abs(c.y) * 3.2);
    float a = (core + halo + (spikeH + spikeV) * 0.75) * vPulse;
    a *= smoothstep(1.0, 0.7, d);
    vec3 col = mix(vec3(0.45, 0.65, 1.0), vec3(1.0), clamp(core * 1.4 + 0.15, 0.0, 1.0));
    gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
  }
`;

export default function FlareStars({ count }) {
  const matRef = useRef();
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const size = new Float32Array(count);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const z = -30 - Math.random() * 25;
      // espalha pelo campo de visão naquela profundidade
      pos[i * 3] = (Math.random() - 0.5) * 70;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 36;
      pos[i * 3 + 2] = z;
      size[i] = 26 + Math.random() * 46;
      seed[i] = Math.random();
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    return g;
  }, [count]);

  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uPixelRatio: { value: 1 } }), []);

  useFrame((state) => {
    const u = matRef.current.uniforms;
    u.uTime.value = state.clock.elapsedTime;
    u.uPixelRatio.value = state.viewport.dpr;
  });

  return (
    <points geometry={geometry} frustumCulled={false} renderOrder={-4}>
      <shaderMaterial
        ref={matRef}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

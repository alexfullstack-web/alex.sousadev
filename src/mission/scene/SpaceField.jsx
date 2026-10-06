import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* Céu estrelado (casca esférica) + linhas de velocidade que passam pelo foguete. */
const starVertex = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  attribute float aSize;
  attribute float aSeed;
  varying float vAlpha;
  varying float vSeed;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vAlpha = 0.65 + 0.35 * sin(uTime * (0.7 + aSeed * 2.0) + aSeed * 50.0);
    vSeed = aSeed;
    gl_PointSize = aSize * uPixelRatio;
    gl_Position = projectionMatrix * mv;
  }
`;
const starFragment = /* glsl */ `
  varying float vAlpha;
  varying float vSeed;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c) * 2.0;
    float a = pow(smoothstep(1.0, 0.0, d), 2.2) * vAlpha;
    // algumas estrelas com cruz de difração
    float cross = step(0.94, vSeed) * (exp(-abs(c.x) * 60.0) + exp(-abs(c.y) * 60.0)) * smoothstep(1.0, 0.2, d) * 0.6;
    a += cross;
    if (a < 0.01) discard;
    vec3 col = mix(vec3(0.62, 0.76, 1.0), vec3(1.0), step(0.5, vSeed));
    gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
    #include <colorspace_fragment>
  }
`;

const streakVertex = /* glsl */ `
  uniform float uOffset;
  uniform float uLen;
  attribute float aEnd;
  attribute float aSeed;
  varying float vEnd;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    float range = 60.0;
    p.y = mod(p.y - uOffset * (0.6 + aSeed), range) - range * 0.5;
    p.y += aEnd * uLen * (0.6 + aSeed);
    vEnd = aEnd;
    vAlpha = smoothstep(range * 0.5, range * 0.2, abs(p.y));
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;
const streakFragment = /* glsl */ `
  uniform float uOpacity;
  varying float vEnd;
  varying float vAlpha;
  void main() {
    gl_FragColor = vec4(0.55, 0.75, 1.0, (1.0 - vEnd) * vAlpha * uOpacity);
  }
`;

export default function SpaceField({ count, speedRef }) {
  const starMat = useRef();
  const streakMat = useRef();
  const offset = useRef(0);

  const stars = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const size = new Float32Array(count);
    const seed = new Float32Array(count);
    const v = new THREE.Vector3();
    for (let i = 0; i < count; i++) {
      v.randomDirection().multiplyScalar(420 + Math.random() * 120);
      pos.set([v.x, v.y, v.z], i * 3);
      const s = Math.random();
      size[i] = s > 0.97 ? 7 + Math.random() * 7 : 1.2 + Math.random() * 2.2;
      seed[i] = s;
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    return { g, u: { uTime: { value: 0 }, uPixelRatio: { value: 1 } } };
  }, [count]);

  const streaks = useMemo(() => {
    const n = Math.round(count / 30);
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(n * 2 * 3);
    const end = new Float32Array(n * 2);
    const seed = new Float32Array(n * 2);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 3 + Math.random() * 14;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      const y = Math.random() * 60;
      const s = Math.random();
      pos.set([x, y, z, x, y, z], i * 6);
      end.set([0, 1], i * 2);
      seed.set([s, s], i * 2);
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aEnd', new THREE.BufferAttribute(end, 1));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 100);
    return { g, u: { uOffset: { value: 0 }, uLen: { value: 0 }, uOpacity: { value: 0 } } };
  }, [count]);

  useFrame((state, delta) => {
    const su = starMat.current.uniforms;
    su.uTime.value = state.clock.elapsedTime;
    su.uPixelRatio.value = state.viewport.dpr;
    const sp = speedRef.current; // unidades/segundo (pode ser negativo)
    offset.current += sp * Math.min(delta, 0.05) * 1.2 + Math.min(delta, 0.05) * 1.5;
    const ku = streakMat.current.uniforms;
    ku.uOffset.value = offset.current;
    ku.uLen.value = Math.min(5, 0.4 + Math.abs(sp) * 0.06);
    ku.uOpacity.value = Math.min(0.55, Math.abs(sp) * 0.014);
  });

  return (
    <>
      <points geometry={stars.g} frustumCulled={false} renderOrder={-10}>
        <shaderMaterial
          ref={starMat}
          vertexShader={starVertex}
          fragmentShader={starFragment}
          uniforms={stars.u}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <lineSegments geometry={streaks.g} frustumCulled={false} renderOrder={5}>
        <shaderMaterial
          ref={streakMat}
          vertexShader={streakVertex}
          fragmentShader={streakFragment}
          uniforms={streaks.u}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </>
  );
}

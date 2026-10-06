import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { TIMELINE, progress, easeInOutCubic } from '../config.js';

/*
  Campo de estrelas 100% na GPU: a posição Z de cada estrela é
  animada no vertex shader (mod), então não há custo de CPU por estrela.
  Velocidades diferentes por estrela = camadas de profundidade/parallax.
*/
const vertex = /* glsl */ `
  uniform float uTime;
  uniform float uTravel;
  uniform float uDepth;
  uniform float uPixelRatio;
  uniform float uCamZ;
  attribute float aSize;
  attribute float aSpeed;
  attribute float aSeed;
  attribute vec3 aColor;
  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    vec3 p = position;
    // deslocamento acumulado em direção à câmera
    p.z = mod(p.z + uTravel * aSpeed, uDepth) - uDepth + uCamZ - 4.0;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float dist = -mv.z;

    float twinkle = 0.72 + 0.28 * sin(uTime * (0.6 + aSeed * 2.2) + aSeed * 40.0);
    float fadeFar = smoothstep(uDepth, uDepth * 0.7, dist);
    float fadeNear = smoothstep(1.5, 7.0, dist);
    vAlpha = twinkle * fadeFar * fadeNear;
    vColor = aColor;

    gl_PointSize = clamp(aSize * uPixelRatio * (34.0 / dist), 1.0, 9.0 * uPixelRatio);
    gl_Position = projectionMatrix * mv;
  }
`;

const fragment = /* glsl */ `
  varying float vAlpha;
  varying vec3 vColor;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    float core = smoothstep(0.5, 0.0, d);
    float a = pow(core, 1.8) * vAlpha;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vColor * (0.6 + core * 0.9), a);
  }
`;

export default function Starfield({ count, clock }) {
  const matRef = useRef();
  const dpr = useThree((s) => s.viewport.dpr);
  const depth = 110;

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const size = new Float32Array(count);
    const speed = new Float32Array(count);
    const seed = new Float32Array(count);
    const color = new Float32Array(count * 3);
    const palette = [
      [1.0, 1.0, 1.0],
      [0.78, 0.86, 1.0],
      [0.55, 0.72, 1.0],
      [0.42, 0.6, 1.0],
    ];
    for (let i = 0; i < count; i++) {
      // distribui em um cilindro amplo ao redor do eixo da câmera
      const r = 6 + Math.pow(Math.random(), 0.7) * 70;
      const a = Math.random() * Math.PI * 2;
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = Math.sin(a) * r * 0.62;
      pos[i * 3 + 2] = Math.random() * depth;
      const big = Math.random() < 0.06;
      size[i] = big ? 2.4 + Math.random() * 2.0 : 0.7 + Math.random() * 1.3;
      speed[i] = 0.35 + Math.random() * 1.4;
      seed[i] = Math.random();
      const c = palette[Math.floor(Math.random() * palette.length)];
      color.set(c, i * 3);
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
    g.setAttribute('aSpeed', new THREE.BufferAttribute(speed, 1));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    g.setAttribute('aColor', new THREE.BufferAttribute(color, 3));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e4);
    return g;
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uTravel: { value: 0 },
      uDepth: { value: depth },
      uPixelRatio: { value: dpr },
      uCamZ: { value: 0 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const travel = useRef(0);

  useFrame((state, delta) => {
    const t = clock.current;
    // velocidade sobe suavemente no início e fica constante e lenta
    const speed = easeInOutCubic(progress(t, TIMELINE.starsMove)) * 0.55 + 0.02;
    travel.current += Math.min(delta, 0.05) * speed;
    const u = matRef.current.uniforms;
    u.uTime.value = state.clock.elapsedTime;
    u.uTravel.value = travel.current;
    u.uPixelRatio.value = state.viewport.dpr;
    u.uCamZ.value = state.camera.position.z;
  });

  return (
    <points geometry={geometry} frustumCulled={false} renderOrder={-5}>
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

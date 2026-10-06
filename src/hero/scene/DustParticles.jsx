import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/*
  Partículas espaciais passando pela câmera. Simulam profundidade de campo:
  quanto mais longe do plano de foco (o astronauta), maior e mais difusa.
*/
const vertex = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uCamZ;
  uniform float uFocus;
  attribute float aSeed;
  attribute float aSpeed;
  varying float vAlpha;
  varying float vBlur;

  void main() {
    vec3 p = position;
    float range = 26.0;
    p.z = mod(p.z + uTime * aSpeed, range) - range + uCamZ - 0.6;
    p.x += sin(uTime * 0.15 + aSeed * 12.0) * 0.4;
    p.y += cos(uTime * 0.12 + aSeed * 9.0) * 0.3 + uTime * 0.03 * (aSeed - 0.5);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float dist = -mv.z;
    float coc = clamp(abs(dist - uFocus) / 6.0, 0.0, 1.0);
    vBlur = coc;

    float fadeIn = smoothstep(range, range * 0.55, dist);
    float fadeNear = smoothstep(0.4, 2.0, dist);
    vAlpha = fadeIn * fadeNear * mix(0.85, 0.22, coc) * (0.5 + aSeed * 0.5);

    float base = 2.0 + aSeed * 3.0;
    gl_PointSize = clamp(base * (1.0 + coc * 5.0) * uPixelRatio * (12.0 / dist), 1.0, 80.0 * uPixelRatio);
    gl_Position = projectionMatrix * mv;
  }
`;

const fragment = /* glsl */ `
  varying float vAlpha;
  varying float vBlur;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    // em foco: ponto nítido; fora de foco: disco suave (bokeh)
    float sharp = smoothstep(1.0, 0.0, d);
    sharp = pow(sharp, 3.0);
    float bokeh = smoothstep(1.0, 0.75, d) * 0.55 + smoothstep(1.0, 0.0, d) * 0.45;
    float a = mix(sharp, bokeh, vBlur) * vAlpha;
    if (a < 0.004) discard;
    gl_FragColor = vec4(mix(vec3(0.75, 0.88, 1.0), vec3(0.35, 0.58, 1.0), vBlur), a);
  }
`;

export default function DustParticles({ count, clock, focus = 10.5 }) {
  const matRef = useRef();
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    const speed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 22;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 13;
      pos[i * 3 + 2] = Math.random() * 26;
      seed[i] = Math.random();
      speed[i] = 0.35 + Math.random() * 0.9;
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    g.setAttribute('aSpeed', new THREE.BufferAttribute(speed, 1));
    return g;
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uCamZ: { value: 0 },
      uFocus: { value: focus },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useFrame((state) => {
    const u = matRef.current.uniforms;
    u.uTime.value = state.clock.elapsedTime;
    u.uPixelRatio.value = state.viewport.dpr;
    u.uCamZ.value = state.camera.position.z;
    u.uFocus.value = state.camera.position.z; // foco no plano do astronauta (z = 0)
  });

  return (
    <points geometry={geometry} frustumCulled={false} renderOrder={10}>
      <shaderMaterial
        ref={matRef}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        depthTest={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

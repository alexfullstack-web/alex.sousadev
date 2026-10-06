import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* Planeta distante, discreto: superfície procedural + atmosfera azul (fresnel). */
const vertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vPos;
  void main() {
    vPos = position;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const fragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uLight;
  uniform float uOpacity;
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vPos;

  float hash(vec3 p) { return fract(sin(dot(p, vec3(17.1, 113.3, 47.7))) * 43758.5453); }
  float noise(vec3 p) {
    vec3 i = floor(p); vec3 f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
  }
  float fbm(vec3 p) { float v = 0.0; float a = 0.5; for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.1; a *= 0.5; } return v; }

  void main() {
    vec3 n = normalize(vNormal);
    float diff = max(dot(n, normalize(uLight)), 0.0);
    float fres = pow(1.0 - max(dot(n, vView), 0.0), 2.6);

    vec3 q = normalize(vPos) * 2.4 + vec3(uTime * 0.01, 0.0, 0.0);
    float land = fbm(q);
    float clouds = smoothstep(0.55, 0.8, fbm(q * 2.3 + 5.0));
    vec3 ocean = vec3(0.01, 0.04, 0.12);
    vec3 ground = vec3(0.05, 0.14, 0.32);
    vec3 surf = mix(ocean, ground, smoothstep(0.45, 0.62, land));
    surf = mix(surf, vec3(0.55, 0.7, 1.0), clouds * 0.45);

    vec3 col = surf * (0.05 + diff * 1.1);
    // terminador azulado + atmosfera
    col += vec3(0.2, 0.45, 1.0) * fres * (0.25 + diff * 1.6);
    gl_FragColor = vec4(col, uOpacity);
  }
`;

const haloFragment = /* glsl */ `
  varying vec2 vUv;
  uniform float uOpacity;
  void main() {
    float d = length(vUv - 0.5) * 2.0;
    float ring = smoothstep(1.0, 0.62, d) * smoothstep(0.5, 0.64, d);
    gl_FragColor = vec4(vec3(0.25, 0.5, 1.0), ring * 0.45 * uOpacity);
  }
`;
const haloVertex = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

export default function Planet({ position = [16, 8.5, -40], radius = 7 }) {
  const matRef = useRef();
  const meshRef = useRef();
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uLight: { value: new THREE.Vector3(-0.6, 0.35, 0.7) }, uOpacity: { value: 1 } }),
    []
  );
  const haloUniforms = useMemo(() => ({ uOpacity: { value: 1 } }), []);

  useFrame((state) => {
    matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.01;
  });

  return (
    <group position={position}>
      <mesh ref={meshRef} renderOrder={-8}>
        <sphereGeometry args={[radius, 48, 48]} />
        <shaderMaterial ref={matRef} vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} />
      </mesh>
      <mesh renderOrder={-9} position={[0, 0, -0.5]}>
        <planeGeometry args={[radius * 2.9, radius * 2.9]} />
        <shaderMaterial
          vertexShader={haloVertex}
          fragmentShader={haloFragment}
          uniforms={haloUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

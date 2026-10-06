import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/*
  Terra real (imagens NASA Blue Marble + luzes noturnas) ao fundo da hero,
  iluminada de lado: metade dia, metade noite com as cidades acesas.
  A hero usa pipeline linear (texturas e saída sem conversão de cor).
*/
const vertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const fragment = /* glsl */ `
  uniform sampler2D uDay;
  uniform sampler2D uNight;
  uniform vec3 uLight;
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec2 vUv;
  void main() {
    vec3 n = normalize(vNormal);
    float ndl = dot(n, normalize(uLight));
    vec2 uv = vUv + vec2(uTime * 0.002, 0.0);
    vec3 day = texture2D(uDay, uv).rgb;
    vec3 night = texture2D(uNight, uv).rgb;
    float dayMix = smoothstep(-0.1, 0.25, ndl);
    vec3 col = mix(pow(night, vec3(1.3)) * vec3(1.0, 0.85, 0.6) * 1.6, day * (0.05 + max(ndl, 0.0) * 1.15), dayMix);
    float fres = pow(1.0 - max(dot(n, vView), 0.0), 2.6);
    col += vec3(0.25, 0.55, 1.0) * fres * (0.2 + smoothstep(-0.3, 0.5, ndl) * 1.4);
    gl_FragColor = vec4(col, 1.0);
  }
`;

const haloVertex = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const haloFragment = /* glsl */ `
  varying vec2 vUv;
  void main() {
    float d = length(vUv - 0.5) * 2.0;
    float ring = smoothstep(1.0, 0.68, d) * smoothstep(0.58, 0.7, d);
    gl_FragColor = vec4(vec3(0.25, 0.5, 1.0), ring * 0.4);
  }
`;

export default function Planet({ day, night, position = [16, 8.5, -40], radius = 7 }) {
  const matRef = useRef();
  const meshRef = useRef();
  const uniforms = useMemo(
    () => ({ uDay: { value: day }, uNight: { value: night }, uLight: { value: new THREE.Vector3(-0.8, 0.25, 0.55) }, uTime: { value: 0 } }),
    [day, night]
  );
  // gira para mostrar as Américas
  const quat = useMemo(() => new THREE.Quaternion().setFromEuler(new THREE.Euler(0.35, -1.0, 0.1)), []);

  useFrame((state) => {
    matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <group position={position}>
      <mesh ref={meshRef} renderOrder={-8} quaternion={quat}>
        <sphereGeometry args={[radius, 64, 64]} />
        <shaderMaterial ref={matRef} vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} />
      </mesh>
      <mesh renderOrder={-9} position={[0, 0, -0.5]}>
        <planeGeometry args={[radius * 2.9, radius * 2.9]} />
        <shaderMaterial vertexShader={haloVertex} fragmentShader={haloFragment} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/*
  Fundo: foto de espaço profundo (nebulosas azuis) em um plano distante,
  com "cover" sem distorção, vinheta e deriva lenta. Mais leve que um
  shader de nebulosa procedural em tela cheia.
*/
const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragment = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec2 uCover;
  uniform float uTime;
  uniform float uIntensity;
  varying vec2 vUv;
  void main() {
    vec2 uv = (vUv - 0.5) * uCover + 0.5;
    uv += vec2(uTime * 0.0025, sin(uTime * 0.05) * 0.004);
    uv = fract(uv);
    vec3 c = texture2D(uMap, uv).rgb;
    // grading: pretos mais profundos, azul elétrico preservado
    c = pow(c, vec3(1.18)) * uIntensity;
    c *= vec3(0.86, 0.94, 1.08);
    float vig = smoothstep(1.05, 0.25, length((vUv - 0.5) * vec2(1.25, 1.0)));
    c *= mix(0.35, 1.0, vig);
    gl_FragColor = vec4(c, 1.0);
  }
`;

export default function Backdrop({ texture, distance = 70 }) {
  const meshRef = useRef();
  const matRef = useRef();
  const { camera, size } = useThree();

  const uniforms = useMemo(
    () => ({
      uMap: { value: texture },
      uCover: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
      uIntensity: { value: 0.9 },
    }),
    [texture]
  );

  useFrame((state) => {
    const mesh = meshRef.current;
    const camZ = state.camera.position.z;
    const d = camZ + distance;
    const h = 2 * d * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * 1.12;
    const aspect = size.width / size.height;
    const w = h * aspect;
    mesh.scale.set(w, h, 1);
    mesh.position.set(state.camera.position.x * 0.85, state.camera.position.y * 0.85, -distance);

    const img = texture.image;
    const texAspect = img ? img.width / img.height : 1.66;
    const planeAspect = w / h;
    const u = matRef.current.uniforms;
    if (planeAspect > texAspect) u.uCover.value.set(1, texAspect / planeAspect);
    else u.uCover.value.set(planeAspect / texAspect, 1);
    u.uTime.value = state.clock.elapsedTime;
  });

  return (
    <mesh ref={meshRef} renderOrder={-10} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        depthWrite={false}
      />
    </mesh>
  );
}

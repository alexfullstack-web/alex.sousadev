import { forwardRef, useMemo } from 'react';
import * as THREE from 'three';

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

/* Brilho radial aditivo (glow azul moderado). */
const glowFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uPower;
  varying vec2 vUv;
  void main() {
    float d = length(vUv - 0.5) * 2.0;
    float a = pow(clamp(1.0 - d, 0.0, 1.0), uPower) * uOpacity;
    gl_FragColor = vec4(uColor, a);
  }
`;

export const Glow = forwardRef(function Glow(
  { size = [1, 1], color = '#3d7bff', opacity = 0.5, power = 2.2, renderOrder = 0, ...props },
  ref
) {
  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: opacity },
      uPower: { value: power },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  return (
    <mesh renderOrder={renderOrder} {...props}>
      <planeGeometry args={[size[0], size[1]]} />
      <shaderMaterial
        ref={ref}
        vertexShader={vertex}
        fragmentShader={glowFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
});

/*
  Iluminação volumétrica: feixes de luz (god rays) saindo do canto
  superior direito, onde está a "estrela" que ilumina o planeta.
*/
const raysFragment = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  uniform vec2 uSource;
  varying vec2 vUv;
  float hash(float n) { return fract(sin(n) * 43758.5453); }
  float noise1(float x) { float i = floor(x); float f = fract(x); f = f * f * (3.0 - 2.0 * f); return mix(hash(i), hash(i + 1.0), f); }
  void main() {
    vec2 p = vUv - uSource;
    float ang = atan(p.y, p.x);
    float dist = length(p * vec2(1.6, 1.0));
    float rays = noise1(ang * 9.0 + uTime * 0.05) * 0.6 + noise1(ang * 23.0 - uTime * 0.03) * 0.4;
    rays = pow(rays, 2.4);
    float fall = smoothstep(1.25, 0.0, dist);
    float core = exp(-dist * 7.0) * 0.6;
    float a = (rays * fall * 0.55 + core) * uOpacity;
    gl_FragColor = vec4(vec3(0.32, 0.55, 1.0), a);
  }
`;

export const LightRays = forwardRef(function LightRays({ size = [40, 24], ...props }, ref) {
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uOpacity: { value: 0.22 }, uSource: { value: new THREE.Vector2(0.92, 0.95) } }),
    []
  );
  return (
    <mesh renderOrder={-6} {...props}>
      <planeGeometry args={size} />
      <shaderMaterial
        ref={ref}
        vertexShader={vertex}
        fragmentShader={raysFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
});

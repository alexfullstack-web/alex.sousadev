import { forwardRef, useMemo } from 'react';
import * as THREE from 'three';

/* Terra realista: dia (Blue Marble), luzes noturnas, nuvens e atmosfera. */
const earthVertex = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vPosW;
  void main() {
    vUv = uv;
    vec4 w = modelMatrix * vec4(position, 1.0);
    vPosW = w.xyz;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;
const earthFragment = /* glsl */ `
  uniform sampler2D uDay;
  uniform sampler2D uNight;
  uniform sampler2D uClouds;
  uniform vec3 uSun;
  uniform float uTime;
  uniform float uOpacity;
  uniform float uCloud;
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vPosW;
  void main() {
    vec3 n = normalize(vNormalW);
    vec3 v = normalize(cameraPosition - vPosW);
    float ndl = dot(n, normalize(uSun));
    float day = smoothstep(-0.18, 0.28, ndl);
    vec3 dayCol = texture2D(uDay, vUv).rgb;
    dayCol = mix(vec3(dot(dayCol, vec3(0.299, 0.587, 0.114))), dayCol, 1.0 + (1.0 - uCloud) * 0.6);
    vec3 nightCol = texture2D(uNight, vUv).rgb * vec3(0.75, 0.85, 1.25) * 1.6;
    float clouds = texture2D(uClouds, vUv + vec2(uTime * 0.0015, 0.0)).r;
    vec3 col = mix(nightCol, dayCol * (0.25 + max(ndl, 0.0) * 1.15), day);
    col = mix(col, vec3(1.0) * (0.06 + max(ndl, 0.0) * 1.05), clouds * 0.6 * uCloud * mix(0.25, 1.0, day));
    // atmosfera (fresnel)
    float fres = pow(1.0 - max(dot(n, v), 0.0), 2.4);
    col += vec3(0.25, 0.55, 1.0) * fres * (0.25 + smoothstep(-0.3, 0.6, ndl) * 1.3);
    gl_FragColor = vec4(col, uOpacity);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const haloVertex = /* glsl */ `
  varying vec3 vNormalW;
  varying vec3 vPosW;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vPosW = w.xyz;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;
const haloFragment = /* glsl */ `
  uniform vec3 uSun;
  uniform float uOpacity;
  varying vec3 vNormalW;
  varying vec3 vPosW;
  void main() {
    vec3 n = normalize(vNormalW);
    vec3 v = normalize(cameraPosition - vPosW);
    float rim = pow(1.0 - abs(dot(n, v)), 3.5);
    float lit = 0.35 + smoothstep(-0.4, 0.6, dot(n, normalize(uSun)));
    gl_FragColor = vec4(vec3(0.3, 0.6, 1.0), rim * lit * 0.9 * uOpacity);
    #include <colorspace_fragment>
  }
`;

export function makeEarthUniforms(textures, sun) {
  return {
    uDay: { value: textures.day },
    uNight: { value: textures.night },
    uClouds: { value: textures.clouds },
    uSun: { value: sun },
    uTime: { value: 0 },
    uOpacity: { value: 1 },
    uCloud: { value: 1 },
  };
}

export const Earth = forwardRef(function Earth({ radius, uniforms, haloUniforms, segments = 96, matRef, haloRef, ...props }, ref) {
  return (
    <group ref={ref} {...props}>
      <mesh renderOrder={-2}>
        <sphereGeometry args={[radius, segments, segments / 2]} />
        <shaderMaterial ref={matRef} vertexShader={earthVertex} fragmentShader={earthFragment} uniforms={uniforms} transparent />
      </mesh>
      <mesh renderOrder={-1} scale={1.045}>
        <sphereGeometry args={[radius, 64, 32]} />
        <shaderMaterial
          ref={haloRef}
          vertexShader={haloVertex}
          fragmentShader={haloFragment}
          uniforms={haloUniforms}
          transparent
          depthWrite={false}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
});

/* Lua: textura real + iluminação da cena */
export const Moon = forwardRef(function Moon({ radius, texture, ...props }, ref) {
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 1,
        metalness: 0,
        color: new THREE.Color('#d8deea'),
        emissive: new THREE.Color('#0a1530'),
        emissiveIntensity: 0.6,
      }),
    [texture]
  );
  return (
    <mesh ref={ref} material={material} {...props}>
      <sphereGeometry args={[radius, 96, 64]} />
    </mesh>
  );
});

/* Rotação que coloca uma latitude/longitude da textura apontando para +Y */
export function quaternionForLatLon(lat, lon, tiltTowardCamera = 0) {
  const phi = ((lon + 180) / 360) * Math.PI * 2;
  const theta = ((90 - lat) / 180) * Math.PI;
  const d = new THREE.Vector3(-Math.cos(phi) * Math.sin(theta), Math.cos(theta), Math.sin(phi) * Math.sin(theta));
  const up = new THREE.Vector3(0, Math.cos(tiltTowardCamera), Math.sin(tiltTowardCamera));
  return new THREE.Quaternion().setFromUnitVectors(d.normalize(), up.normalize());
}

import { forwardRef, useMemo } from 'react';
import * as THREE from 'three';

/*
  Terra realista com imagens reais da NASA:
  - dia (Blue Marble), luzes das cidades no lado noturno
  - oceanos com reflexo do sol (máscara de água) e relevo (topografia)
  - camada de nuvens separada, com sombra projetada na superfície
  - atmosfera com espalhamento azul e borda alaranjada no terminador
*/
const vertex = /* glsl */ `
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

const surfaceFragment = /* glsl */ `
  uniform sampler2D uDay;
  uniform sampler2D uNight;
  uniform sampler2D uClouds;
  uniform sampler2D uWater;
  uniform sampler2D uTopo;
  uniform vec3 uSun;
  uniform float uTime;
  uniform float uOpacity;
  uniform vec2 uTexel;
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vPosW;

  void main() {
    vec3 n = normalize(vNormalW);
    vec3 v = normalize(cameraPosition - vPosW);
    vec3 l = normalize(uSun);

    // relevo: gradiente da topografia perturba a normal
    vec3 up = abs(n.y) < 0.99 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
    vec3 T = normalize(cross(up, n));
    vec3 B = cross(n, T);
    float h = texture2D(uTopo, vUv).r;
    float hx = texture2D(uTopo, vUv + vec2(uTexel.x, 0.0)).r - h;
    float hy = texture2D(uTopo, vUv + vec2(0.0, uTexel.y)).r - h;
    vec3 nb = normalize(n - (T * hx + B * hy) * 2.2);

    float ndl = dot(nb, l);
    float ndlRaw = dot(n, l);
    float dayMix = smoothstep(-0.12, 0.22, ndlRaw);

    vec3 dayCol = texture2D(uDay, vUv).rgb;
    dayCol = mix(vec3(dot(dayCol, vec3(0.299, 0.587, 0.114))), dayCol, 1.25);
    float water = texture2D(uWater, vUv).r;

    // sombra das nuvens (deslocada em direção ao sol)
    vec2 cloudUv = vUv + vec2(uTime * 0.0012, 0.0);
    float cloudShadow = texture2D(uClouds, cloudUv - vec2(l.x, l.y) * 0.0025).r;

    vec3 lit = dayCol * max(ndl, 0.0) * 1.6 * (1.0 - cloudShadow * 0.45);
    // reflexo especular do sol nos oceanos
    vec3 hv = normalize(l + v);
    float spec = pow(max(dot(n, hv), 0.0), 320.0) * water * smoothstep(0.0, 0.2, ndlRaw);
    lit += vec3(1.0, 0.92, 0.78) * spec * 0.55;
    lit += dayCol * 0.015;

    // luzes das cidades no lado escuro
    vec3 nightCol = texture2D(uNight, vUv).rgb;
    vec3 city = pow(nightCol, vec3(1.4)) * vec3(1.0, 0.82, 0.55) * 2.2 * (1.0 - smoothstep(-0.25, 0.05, ndlRaw));

    vec3 col = mix(city, lit, dayMix);

    // atmosfera sobre a superfície
    float fres = pow(1.0 - max(dot(n, v), 0.0), 3.0);
    vec3 atm = vec3(0.32, 0.58, 1.0);
    col = mix(col, atm * (0.15 + max(ndlRaw, 0.0)), fres * 0.65 * smoothstep(-0.3, 0.3, ndlRaw));
    // borda alaranjada do pôr do sol no terminador
    float term = exp(-pow(ndlRaw * 6.0, 2.0)) * 0.18;
    col += vec3(1.0, 0.45, 0.18) * term * fres;

    gl_FragColor = vec4(col, uOpacity);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const cloudFragment = /* glsl */ `
  uniform sampler2D uClouds;
  uniform vec3 uSun;
  uniform float uTime;
  uniform float uOpacity;
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vPosW;
  void main() {
    vec3 n = normalize(vNormalW);
    vec3 v = normalize(cameraPosition - vPosW);
    float ndl = dot(n, normalize(uSun));
    float c = texture2D(uClouds, vUv + vec2(uTime * 0.0012, 0.0)).r;
    c = smoothstep(0.08, 0.9, c);
    float light = smoothstep(-0.15, 0.35, ndl) * (0.25 + max(ndl, 0.0) * 1.05);
    vec3 col = vec3(1.0) * light + vec3(1.0, 0.55, 0.3) * exp(-pow(ndl * 7.0, 2.0)) * 0.25;
    float edge = smoothstep(0.0, 0.25, dot(n, v));
    gl_FragColor = vec4(col, c * 0.85 * edge * uOpacity);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const haloFragment = /* glsl */ `
  uniform vec3 uSun;
  uniform float uOpacity;
  varying vec3 vNormalW;
  varying vec3 vPosW;
  varying vec2 vUv;
  void main() {
    vec3 n = normalize(vNormalW);
    vec3 v = normalize(cameraPosition - vPosW);
    float rim = pow(1.0 - abs(dot(n, v)), 4.0);
    float ndl = dot(n, normalize(uSun));
    float lit = smoothstep(-0.35, 0.5, ndl);
    vec3 col = mix(vec3(1.0, 0.5, 0.25), vec3(0.3, 0.6, 1.0), smoothstep(-0.3, 0.05, ndl));
    gl_FragColor = vec4(col, rim * lit * 1.1 * uOpacity);
    #include <colorspace_fragment>
  }
`;

export function makeEarthUniforms(t, sun) {
  return {
    surface: {
      uDay: { value: t.day },
      uNight: { value: t.night },
      uClouds: { value: t.clouds },
      uWater: { value: t.water },
      uTopo: { value: t.topo },
      uSun: { value: sun.clone() },
      uTime: { value: 0 },
      uOpacity: { value: 1 },
      uTexel: { value: new THREE.Vector2(1 / 2048, 1 / 1024) },
    },
    clouds: { uClouds: { value: t.clouds }, uSun: { value: sun.clone() }, uTime: { value: 0 }, uOpacity: { value: 1 } },
    halo: { uSun: { value: sun.clone() }, uOpacity: { value: 1 } },
  };
}

/* Atualiza sol, tempo e opacidade nos três materiais (via refs dos materiais). */
export function updateEarth(refs, sun, time, opacity = 1) {
  const [s, c, h] = refs;
  if (s.current) {
    s.current.uniforms.uSun.value.copy(sun);
    s.current.uniforms.uTime.value = time;
    s.current.uniforms.uOpacity.value = opacity;
  }
  if (c.current) {
    c.current.uniforms.uSun.value.copy(sun);
    c.current.uniforms.uTime.value = time;
    c.current.uniforms.uOpacity.value = opacity;
  }
  if (h.current) {
    h.current.uniforms.uSun.value.copy(sun);
    h.current.uniforms.uOpacity.value = opacity;
  }
}

export const Earth = forwardRef(function Earth({ radius, uniforms, segments = 128, matRefs, ...props }, ref) {
  return (
    <group ref={ref} {...props}>
      <mesh renderOrder={-3}>
        <sphereGeometry args={[radius, segments, segments / 2]} />
        <shaderMaterial ref={matRefs[0]} vertexShader={vertex} fragmentShader={surfaceFragment} uniforms={uniforms.surface} transparent />
      </mesh>
      <mesh renderOrder={-2} scale={1.006}>
        <sphereGeometry args={[radius, segments, segments / 2]} />
        <shaderMaterial
          ref={matRefs[1]}
          vertexShader={vertex}
          fragmentShader={cloudFragment}
          uniforms={uniforms.clouds}
          transparent
          depthWrite={false}
        />
      </mesh>
      <mesh renderOrder={-1} scale={1.018}>
        <sphereGeometry args={[radius, 64, 32]} />
        <shaderMaterial
          ref={matRefs[2]}
          vertexShader={vertex}
          fragmentShader={haloFragment}
          uniforms={uniforms.halo}
          transparent
          depthWrite={false}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
});

/* Lua: mapa real (NASA LRO) + relevo, iluminação dura do sol, sem atmosfera. */
export const Moon = forwardRef(function Moon({ radius, texture, bump, ...props }, ref) {
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: texture,
        bumpMap: bump || null,
        bumpScale: 2.2,
        roughness: 0.96,
        metalness: 0,
        color: new THREE.Color('#ffffff'),
      }),
    [texture, bump]
  );
  return (
    <mesh ref={ref} material={material} {...props}>
      <sphereGeometry args={[radius, 160, 96]} />
    </mesh>
  );
});

/* Rotação que coloca uma latitude/longitude da textura apontando para uma direção */
export function quaternionForLatLon(lat, lon, tiltTowardCamera = 0) {
  const phi = ((lon + 180) / 360) * Math.PI * 2;
  const theta = ((90 - lat) / 180) * Math.PI;
  const d = new THREE.Vector3(-Math.cos(phi) * Math.sin(theta), Math.cos(theta), Math.sin(phi) * Math.sin(theta));
  const up = new THREE.Vector3(0, Math.cos(tiltTowardCamera), Math.sin(tiltTowardCamera));
  return new THREE.Quaternion().setFromUnitVectors(d.normalize(), up.normalize());
}

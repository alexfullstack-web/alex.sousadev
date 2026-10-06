import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/*
  Foguete Alex Sousa Tech — modelado com geometria procedural:
  corpo (LatheGeometry) com textura pintada em canvas (preto premium,
  faixas azul elétrico, "ALEX SOUSA TECH" e logo), janela, aletas,
  bocal, chama de plasma azul e partículas de exaustão na GPU.
*/

const BODY_BOTTOM = -1.55;
const BODY_TOP = 1.92;
const CYL_TOP = 0.55;

function bodyProfile() {
  const pts = [new THREE.Vector2(0, BODY_BOTTOM), new THREE.Vector2(0.4, BODY_BOTTOM)];
  const n = 90;
  for (let i = 0; i <= n; i++) {
    const y = BODY_BOTTOM + 0.06 + ((BODY_TOP - BODY_BOTTOM - 0.06) * i) / n;
    let r;
    if (y < -1.3) r = 0.44 + (0.06 * (y - BODY_BOTTOM - 0.06)) / 0.19; // saia traseira
    else if (y <= CYL_TOP) r = 0.5;
    else {
      const t = (y - CYL_TOP) / (BODY_TOP - CYL_TOP);
      r = 0.5 * Math.pow(Math.max(0, 1 - Math.pow(t, 2.1)), 0.62); // ogiva
    }
    pts.push(new THREE.Vector2(Math.max(r, 0.001), y));
  }
  pts.push(new THREE.Vector2(0, BODY_TOP + 0.005));
  return pts;
}

// y do corpo → coordenada vertical do canvas (v proporcional ao índice ~ y)
const H = 1024;
const W = 1024;
const yToCanvas = (y) => (1 - (y - BODY_BOTTOM) / (BODY_TOP - BODY_BOTTOM)) * H;

function paintBody(ctx, emissive, logo) {
  // base: preto premium com leve gradiente metálico
  const g = ctx.createLinearGradient(0, 0, W, 0);
  g.addColorStop(0, '#0b0e15');
  g.addColorStop(0.5, '#151b27');
  g.addColorStop(1, '#0b0e15');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // linhas de painéis
  ctx.strokeStyle = 'rgba(160,180,220,0.10)';
  ctx.lineWidth = 2;
  [-1.0, -0.2, 0.6, 1.2].forEach((y) => {
    ctx.beginPath();
    ctx.moveTo(0, yToCanvas(y));
    ctx.lineTo(W, yToCanvas(y));
    ctx.stroke();
  });
  for (let i = 0; i < 8; i++) {
    const x = (i + 0.5) * (W / 8);
    ctx.beginPath();
    ctx.moveTo(x, yToCanvas(0.55));
    ctx.lineTo(x, yToCanvas(-1.3));
    ctx.stroke();
  }

  // faixas azul elétrico (também no mapa emissivo)
  const bands = [
    [-1.38, 0.07],
    [-0.22, 0.025],
    [0.62, 0.05],
    [1.3, 0.02],
  ];
  emissive.fillStyle = '#000';
  emissive.fillRect(0, 0, W, H);
  bands.forEach(([y, h]) => {
    const y0 = yToCanvas(y + h / 2);
    const y1 = yToCanvas(y - h / 2);
    ctx.fillStyle = '#2f7bff';
    ctx.fillRect(0, y0, W, y1 - y0);
    emissive.fillStyle = '#4c8dff';
    emissive.fillRect(0, y0, W, y1 - y0);
  });

  // filete vertical azul ao lado do texto
  [W * 0.5 - 70, W * 0.5 + 70].forEach((x) => {
    const y0 = yToCanvas(0.42);
    const y1 = yToCanvas(-1.18);
    ctx.fillStyle = '#2f7bff';
    ctx.fillRect(x - 2, y0, 4, y1 - y0);
    emissive.fillStyle = '#3a7dff';
    emissive.fillRect(x - 2, y0, 4, y1 - y0);
  });

  // texto vertical
  ctx.save();
  ctx.translate(W * 0.5, yToCanvas(-0.42));
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '700 58px "Space Grotesk", "Segoe UI", sans-serif';
  ctx.fillStyle = '#e9eef7';
  ctx.fillText('ALEX SOUSA', 0, -16);
  ctx.font = '600 34px "Space Grotesk", "Segoe UI", sans-serif';
  ctx.fillStyle = '#4c8dff';
  ctx.fillText('T  E  C  H', 0, 36);
  ctx.restore();

  // bandeira/logo no lado oposto
  if (logo) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighten';
    const s = 150;
    ctx.drawImage(logo, W * 0.0 - s / 2, yToCanvas(-0.45) - s / 2, s, s);
    ctx.drawImage(logo, W * 1.0 - s / 2, yToCanvas(-0.45) - s / 2, s, s);
    ctx.restore();
  }
}

const flameVertex = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const flameFragment = /* glsl */ `
  uniform float uTime;
  uniform float uThrust;
  uniform vec3 uColor;
  uniform float uCore;
  varying vec2 vUv;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
  float noise(vec2 p) { vec2 i = floor(p); vec2 f = fract(p); f = f*f*(3.0-2.0*f);
    return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }
  void main() {
    // vUv.y: 1 = bocal, 0 = ponta da chama
    float along = 1.0 - vUv.y;
    float n = noise(vec2(vUv.x * 8.0, along * 6.0 + uTime * 9.0));
    float a = pow(along, 1.6) * (0.65 + 0.35 * n);
    float edge = sin(vUv.x * 3.14159);
    a *= mix(0.6, 1.0, edge);
    vec3 col = mix(uColor, vec3(1.0), pow(along, 3.0) * uCore);
    gl_FragColor = vec4(col, clamp(a * uThrust, 0.0, 1.0));
  }
`;

const exhaustVertex = /* glsl */ `
  uniform float uTime;
  uniform float uThrust;
  uniform float uPixelRatio;
  attribute float aSeed;
  attribute vec2 aDir;
  varying float vAge;
  varying float vAlpha;
  void main() {
    float rate = 1.4 + aSeed * 0.8;
    float age = fract(uTime * rate + aSeed * 17.0);
    float len = 0.8 + uThrust * 5.2;
    vec3 p = vec3(0.0, -2.05, 0.0);
    p.y -= age * len;
    float spread = 0.08 + age * (0.25 + uThrust * 0.9);
    p.xz += aDir * spread;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vAge = age;
    vAlpha = (1.0 - age) * smoothstep(0.0, 0.08, age) * clamp(uThrust * 1.4, 0.0, 1.0);
    gl_PointSize = (0.1 + age * 0.55 * (0.5 + uThrust)) * uPixelRatio / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;
const exhaustFragment = /* glsl */ `
  varying float vAge;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    float a = smoothstep(1.0, 0.0, d);
    a = a * a * vAlpha;
    if (a < 0.01) discard;
    vec3 col = mix(vec3(0.85, 0.93, 1.0), vec3(0.18, 0.42, 1.0), smoothstep(0.0, 0.5, vAge));
    gl_FragColor = vec4(col, a * 0.75);
  }
`;

function Fins({ material }) {
  const geometry = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, -0.45);
    s.lineTo(0.5, -1.18);
    s.lineTo(0.58, -1.9);
    s.lineTo(0.22, -1.78);
    s.lineTo(0, -1.52);
    s.lineTo(0, -0.45);
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.05, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 1 });
    g.translate(0, 0, -0.025);
    return g;
  }, []);
  return (
    <>
      {[Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4].map((a) => (
        <group key={a} rotation={[0, a, 0]}>
          <mesh geometry={geometry} material={material} position={[0.44, 0, 0]} />
        </group>
      ))}
    </>
  );
}

export default function Rocket({ quality, thrustRef, rocketRef }) {
  const flameOuter = useRef();
  const flameInner = useRef();
  const exhaustMat = useRef();
  const engineLight = useRef();
  const nozzleGlow = useRef();
  const navLights = useRef([]);

  const { bodyGeo, nozzleGeo, bodyTex, emisTex, canvases } = useMemo(() => {
    const bodyGeo = new THREE.LatheGeometry(bodyProfile(), 72);
    const nozzleGeo = new THREE.LatheGeometry(
      [new THREE.Vector2(0.2, -1.52), new THREE.Vector2(0.21, -1.6), new THREE.Vector2(0.27, -1.78), new THREE.Vector2(0.36, -2.0)],
      40
    );
    const c1 = document.createElement('canvas');
    c1.width = W;
    c1.height = H;
    const c2 = document.createElement('canvas');
    c2.width = W;
    c2.height = H;
    const ctx = c1.getContext('2d');
    const ectx = c2.getContext('2d');
    paintBody(ctx, ectx, null);
    const bodyTex = new THREE.CanvasTexture(c1);
    bodyTex.colorSpace = THREE.SRGBColorSpace;
    bodyTex.anisotropy = 8;
    const emisTex = new THREE.CanvasTexture(c2);
    emisTex.colorSpace = THREE.SRGBColorSpace;
    return { bodyGeo, nozzleGeo, bodyTex, emisTex, canvases: { ctx, ectx } };
  }, []);

  // repinta com o logo e a fonte da marca quando carregarem
  useEffect(() => {
    let alive = true;
    const img = new Image();
    img.src = 'img/site/logo-256.webp';
    const fontReady = document.fonts && document.fonts.load ? document.fonts.load('700 58px "Space Grotesk"') : Promise.resolve();
    Promise.all([new Promise((res) => { img.onload = res; img.onerror = res; }), fontReady.catch(() => null)]).then(() => {
      if (!alive) return;
      paintBody(canvases.ctx, canvases.ectx, img.complete && img.naturalWidth ? img : null);
      bodyTex.needsUpdate = true;
      emisTex.needsUpdate = true;
    });
    return () => {
      alive = false;
    };
  }, [canvases, bodyTex, emisTex]);

  const materials = useMemo(
    () => ({
      body: new THREE.MeshStandardMaterial({
        map: bodyTex,
        emissiveMap: emisTex,
        emissive: new THREE.Color('#3b7bff'),
        emissiveIntensity: 1.8,
        metalness: 0.55,
        roughness: 0.32,
      }),
      fin: new THREE.MeshStandardMaterial({ color: '#10141d', metalness: 0.7, roughness: 0.3, emissive: new THREE.Color('#0b2a80'), emissiveIntensity: 0.35 }),
      nozzle: new THREE.MeshStandardMaterial({ color: '#3a404c', metalness: 0.9, roughness: 0.28, side: THREE.DoubleSide }),
      ring: new THREE.MeshStandardMaterial({ color: '#c8d2e2', metalness: 1, roughness: 0.2 }),
      glass: new THREE.MeshStandardMaterial({ color: '#0a1a3a', metalness: 0.2, roughness: 0.05, emissive: new THREE.Color('#2f7bff'), emissiveIntensity: 1.4 }),
      nav: new THREE.MeshBasicMaterial({ color: '#9cc2ff', toneMapped: false }),
    }),
    [bodyTex, emisTex]
  );

  const flameUniforms = useMemo(
    () => ({
      outer: { uTime: { value: 0 }, uThrust: { value: 0 }, uColor: { value: new THREE.Color('#2f6bff') }, uCore: { value: 0.6 } },
      inner: { uTime: { value: 0 }, uThrust: { value: 0 }, uColor: { value: new THREE.Color('#9cc8ff') }, uCore: { value: 1.0 } },
    }),
    []
  );

  const exhaust = useMemo(() => {
    const count = quality === 'high' ? 260 : 110;
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    const dir = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
      seed[i] = Math.random();
      const a = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random());
      dir[i * 2] = Math.cos(a) * r;
      dir[i * 2 + 1] = Math.sin(a) * r;
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    g.setAttribute('aDir', new THREE.BufferAttribute(dir, 2));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, -4, 0), 10);
    return {
      geometry: g,
      uniforms: { uTime: { value: 0 }, uThrust: { value: 0 }, uPixelRatio: { value: 1 } },
    };
  }, [quality]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const th = thrustRef.current;
    const flick = 0.92 + Math.sin(time * 40) * 0.04 + Math.sin(time * 23) * 0.04;
    const len = 0.25 + th * 2.6 * flick;
    flameOuter.current.scale.set(1, len, 1);
    flameOuter.current.position.y = -2.0 - len / 2;
    flameInner.current.scale.set(0.55, len * 0.6, 0.55);
    flameInner.current.position.y = -2.0 - (len * 0.6) / 2;
    [flameOuter.current.material.uniforms, flameInner.current.material.uniforms].forEach((u) => {
      u.uTime.value = time;
      u.uThrust.value = Math.min(1, th * 1.6 + 0.05);
    });
    const eu = exhaustMat.current.uniforms;
    eu.uTime.value = time;
    eu.uThrust.value = th;
    eu.uPixelRatio.value = state.viewport.dpr * 600;
    engineLight.current.intensity = th * 18 * flick;
    nozzleGlow.current.material.opacity = Math.min(1, 0.25 + th * 1.2);
    const blink = Math.sin(time * 3.2) > 0.6 ? 1 : 0.15;
    navLights.current.forEach((m) => m && (m.scale.setScalar(blink)));
  });

  return (
    <group ref={rocketRef}>
      <group rotation={[0, Math.PI, 0]}>
        <mesh geometry={bodyGeo} material={materials.body} />
      </group>
      <mesh geometry={nozzleGeo} material={materials.nozzle} />
      <Fins material={materials.fin} />

      {/* janela */}
      <group position={[0, 0.98, 0.462]} rotation={[-0.12, 0, 0]}>
        <mesh material={materials.ring}>
          <torusGeometry args={[0.13, 0.024, 12, 40]} />
        </mesh>
        <mesh material={materials.glass} scale={[1, 1, 0.35]}>
          <sphereGeometry args={[0.122, 24, 16]} />
        </mesh>
      </group>

      {/* luzes de navegação nas aletas */}
      {[Math.PI / 4, (5 * Math.PI) / 4].map((a, i) => (
        <mesh
          key={a}
          ref={(m) => (navLights.current[i] = m)}
          material={materials.nav}
          position={[Math.cos(a) * 1.0, -1.88, -Math.sin(a) * 1.0]}
        >
          <sphereGeometry args={[0.035, 8, 8]} />
        </mesh>
      ))}

      {/* brilho interno do bocal */}
      <mesh ref={nozzleGlow} position={[0, -1.99, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.34, 32]} />
        <meshBasicMaterial color="#bcd6ff" transparent opacity={0.4} toneMapped={false} />
      </mesh>

      {/* chama de plasma */}
      <mesh ref={flameOuter} rotation={[Math.PI, 0, 0]} renderOrder={20}>
        <coneGeometry args={[0.36, 1, 32, 1, true]} />
        <shaderMaterial
          vertexShader={flameVertex}
          fragmentShader={flameFragment}
          uniforms={flameUniforms.outer}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh ref={flameInner} rotation={[Math.PI, 0, 0]} renderOrder={21}>
        <coneGeometry args={[0.36, 1, 24, 1, true]} />
        <shaderMaterial
          vertexShader={flameVertex}
          fragmentShader={flameFragment}
          uniforms={flameUniforms.inner}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
      <points geometry={exhaust.geometry} renderOrder={19}>
        <shaderMaterial
          ref={exhaustMat}
          vertexShader={exhaustVertex}
          fragmentShader={exhaustFragment}
          uniforms={exhaust.uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <pointLight ref={engineLight} position={[0, -2.6, 0]} color="#6fa8ff" distance={10} decay={1.6} intensity={0} />
    </group>
  );
}

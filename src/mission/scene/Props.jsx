import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GATES } from '../missionPath.js';

const basicVertex = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

function labelTexture(index, label) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = 'rgba(8,18,40,0.72)';
  ctx.strokeStyle = 'rgba(110,165,255,0.9)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(4, 20, 504, 88, 10);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#4c8dff';
  ctx.font = '600 30px "IBM Plex Mono", monospace';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(index).padStart(2, '0'), 28, 66);
  ctx.fillStyle = '#eef3ff';
  ctx.font = '600 34px "IBM Plex Mono", monospace';
  ctx.fillText(label, 90, 66);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* Portões holográficos: o foguete atravessa um por tecnologia. */
const gateFragment = /* glsl */ `
  uniform float uFlash;
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    float d = length(vUv - 0.5) * 2.0;
    float ring = smoothstep(0.08, 0.0, abs(d - 0.92));
    float inner = smoothstep(0.92, 0.0, d) * 0.08;
    float ticks = step(0.86, fract(atan(vUv.y - 0.5, vUv.x - 0.5) * 6.0 / 3.14159 + uTime * 0.1)) * smoothstep(0.1, 0.0, abs(d - 0.8));
    float a = ring * 0.9 + inner + ticks * 0.6;
    a *= 0.55 + uFlash * 1.2;
    gl_FragColor = vec4(mix(vec3(0.25, 0.55, 1.0), vec3(0.85, 0.93, 1.0), uFlash), a);
  }
`;

export function Gates({ altRef }) {
  const items = useMemo(
    () =>
      GATES.map((g) => ({
        ...g,
        uniforms: { uFlash: { value: 0 }, uTime: { value: 0 } },
        label: labelTexture(g.index, g.label),
      })),
    []
  );
  const groups = useRef([]);
  const labels = useRef([]);
  const mats = useRef([]);

  useFrame((state) => {
    const a = altRef.current;
    items.forEach((it, i) => {
      const grp = groups.current[i];
      if (!grp) return;
      const rel = it.y - a;
      grp.visible = rel > -40 && rel < 90;
      const mat = mats.current[i];
      if (mat) {
        mat.uniforms.uTime.value = state.clock.elapsedTime;
        mat.uniforms.uFlash.value = Math.exp(-rel * rel * 0.02);
      }
      const lbl = labels.current[i];
      if (lbl) lbl.quaternion.copy(state.camera.quaternion);
    });
  });

  return (
    <>
      {items.map((it, i) => (
        <group key={it.key} position={[0, it.y, 0]} ref={(g) => (groups.current[i] = g)}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} renderOrder={6}>
            <planeGeometry args={[5.6, 5.6]} />
            <shaderMaterial
              ref={(m) => (mats.current[i] = m)}
              vertexShader={basicVertex}
              fragmentShader={gateFragment}
              uniforms={it.uniforms}
              transparent
              depthWrite={false}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[2.62, 0.03, 8, 96]} />
            <meshBasicMaterial color="#4c8dff" toneMapped={false} />
          </mesh>
          <mesh ref={(m) => (labels.current[i] = m)} position={[0, 0.25, 2.95]} renderOrder={7}>
            <planeGeometry args={[1.7, 0.42]} />
            <meshBasicMaterial map={it.label} transparent depthWrite={false} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </>
  );
}

/* Plataforma de lançamento + fumaça na decolagem */
const smokeVertex = /* glsl */ `
  uniform float uTime;
  uniform float uAmount;
  uniform float uPixelRatio;
  attribute float aSeed;
  attribute float aAng;
  varying float vAlpha;
  void main() {
    float age = fract(uTime * (0.18 + aSeed * 0.12) + aSeed * 7.0);
    float r = 0.3 + age * (2.5 + aSeed * 3.5) * uAmount;
    vec3 p = vec3(cos(aAng) * r, 0.1 + age * age * 1.4 + aSeed * 0.3, sin(aAng) * r);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vAlpha = uAmount * (1.0 - age) * smoothstep(0.0, 0.1, age);
    gl_PointSize = (0.6 + age * 1.8) * uPixelRatio / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;
const smokeFragment = /* glsl */ `
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    float a = smoothstep(1.0, 0.1, d) * vAlpha * 0.35;
    if (a < 0.005) discard;
    gl_FragColor = vec4(vec3(0.62, 0.7, 0.85), a);
  }
`;

export function LaunchPad({ smokeRef, quality }) {
  const smoke = useMemo(() => {
    const n = quality === 'high' ? 140 : 60;
    const g = new THREE.BufferGeometry();
    const seed = new Float32Array(n);
    const ang = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      seed[i] = Math.random();
      ang[i] = Math.random() * Math.PI * 2;
    }
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    g.setAttribute('aAng', new THREE.BufferAttribute(ang, 1));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 12);
    return { g, u: { uTime: { value: 0 }, uAmount: { value: 0 }, uPixelRatio: { value: 1 } } };
  }, [quality]);

  const lights = useRef();
  const smokeMat = useRef();
  useFrame((state) => {
    const su = smokeMat.current.uniforms;
    su.uTime.value = state.clock.elapsedTime;
    su.uAmount.value = smokeRef.current;
    su.uPixelRatio.value = state.viewport.dpr * 600;
    if (lights.current) lights.current.material.opacity = 0.55 + Math.sin(state.clock.elapsedTime * 3) * 0.35;
  });

  return (
    <group position={[0, -2.0, 0]}>
      <mesh position={[0, -0.06, 0]}>
        <cylinderGeometry args={[1.25, 1.45, 0.12, 48]} />
        <meshStandardMaterial color="#141a26" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh ref={lights} position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.1, 1.18, 64]} />
        <meshBasicMaterial color="#4c8dff" transparent opacity={0.8} toneMapped={false} />
      </mesh>
      {/* torre de serviço */}
      <group position={[-1.05, 0, -0.3]}>
        <mesh position={[0, 1.4, 0]}>
          <boxGeometry args={[0.16, 2.8, 0.16]} />
          <meshStandardMaterial color="#1b2230" metalness={0.8} roughness={0.35} />
        </mesh>
        {[0.6, 1.4, 2.2].map((y) => (
          <mesh key={y} position={[0.28, y, 0]}>
            <boxGeometry args={[0.45, 0.04, 0.06]} />
            <meshStandardMaterial color="#2a3346" metalness={0.8} roughness={0.35} emissive="#1f4fd0" emissiveIntensity={0.4} />
          </mesh>
        ))}
        <mesh position={[0, 2.85, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color="#9cc2ff" toneMapped={false} />
        </mesh>
      </group>
      <points geometry={smoke.g} renderOrder={4}>
        <shaderMaterial
          ref={smokeMat}
          vertexShader={smokeVertex}
          fragmentShader={smokeFragment}
          uniforms={smoke.u}
          transparent
          depthWrite={false}
        />
      </points>
    </group>
  );
}

/* Bandeira Alex Sousa Tech fincada na Lua (tecido ondulando no vertex shader) */
const flagVertex = /* glsl */ `
  uniform float uTime;
  uniform float uRaise;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 p = position;
    float w = uv.x;
    p.z += sin(uv.x * 6.0 - uTime * 2.4) * 0.06 * w;
    p.y += sin(uv.x * 4.0 - uTime * 1.8) * 0.025 * w;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;
const flagFragment = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uRaise;
  varying vec2 vUv;
  void main() {
    vec4 c = texture2D(uMap, vUv);
    gl_FragColor = vec4(c.rgb, uRaise);
    #include <colorspace_fragment>
  }
`;

export function Flag({ raiseRef, ...props }) {
  const meshRef = useRef();
  const poleRef = useRef();
  const { tex, uniforms } = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 320;
    const ctx = c.getContext('2d');
    const draw = (img) => {
      const g = ctx.createLinearGradient(0, 0, 512, 320);
      g.addColorStop(0, '#0b0f18');
      g.addColorStop(1, '#141c2b');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 512, 320);
      ctx.fillStyle = '#2f7bff';
      ctx.fillRect(0, 300, 512, 20);
      if (img) {
        ctx.globalCompositeOperation = 'lighten';
        ctx.drawImage(img, 136, 20, 240, 240);
        ctx.globalCompositeOperation = 'source-over';
      } else {
        ctx.fillStyle = '#e8eef9';
        ctx.font = '700 64px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('AS', 256, 170);
      }
    };
    draw(null);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    const img = new Image();
    img.onload = () => {
      draw(img);
      tex.needsUpdate = true;
    };
    img.src = 'img/site/logo-256.webp';
    return { tex, uniforms: { uMap: { value: tex }, uTime: { value: 0 }, uRaise: { value: 0 } } };
  }, []);

  useFrame((state) => {
    const r = raiseRef.current;
    const fu = meshRef.current.material.uniforms;
    fu.uTime.value = state.clock.elapsedTime;
    fu.uRaise.value = Math.min(1, r * 1.5);
    poleRef.current.visible = r > 0.01;
    poleRef.current.scale.set(1, Math.max(0.001, r), 1);
  });

  return (
    <group {...props}>
      <group ref={poleRef}>
        <mesh position={[0, 1.0, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 2.0, 8]} />
          <meshStandardMaterial color="#c9d3e3" metalness={1} roughness={0.25} />
        </mesh>
        <mesh ref={meshRef} position={[0.62, 1.6, 0]}>
          <planeGeometry args={[1.2, 0.75, 24, 8]} />
          <shaderMaterial vertexShader={flagVertex} fragmentShader={flagFragment} uniforms={uniforms} transparent side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}

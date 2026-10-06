import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { TIMELINE, TECH_TAGS, progress, easeOutCubic, easeInOutCubic, lerp, clamp01 } from '../config.js';
import Backdrop from './Backdrop.jsx';
import Starfield from './Starfield.jsx';
import FlareStars from './FlareStars.jsx';
import DustParticles from './DustParticles.jsx';
import Planet from './Planet.jsx';
import Astronaut, { ASTRO_H } from './Astronaut.jsx';
import { LightRays } from './Glows.jsx';

const FOV = 35;
const CAM_END_Z = 10.5;
const CAM_START_Z = 17;

/* Posição/escala do astronauta conforme o formato da tela. */
function computeLayout(width, height, contentBottom, contentRight) {
  const aspect = width / height;
  const visH = 2 * CAM_END_Z * Math.tan(THREE.MathUtils.degToRad(FOV / 2));
  const visW = visH * aspect;
  if (aspect >= 1.05) {
    // área livre à direita do texto; o astronauta + holograma precisam caber nela
    const left = (contentRight - 0.5) * visW + 0.15;
    const right = visW / 2 - 0.1;
    const scale = Math.min(0.98, (visH * 0.95) / ASTRO_H, (right - left) / 4.85);
    const x = Math.min(right - 2.75 * scale, Math.max(left + 2.1 * scale, visW * 0.23));
    const y = -visH / 2 + (scale * ASTRO_H) / 2 - 0.55 * scale;
    return { mobile: false, x, y, scale, spread: 1, spreadY: 1, holo: { pos: [1.72, 1.8, 0.45], scale: 1 } };
  }
  // retrato (celular / tablet em pé): astronauta na metade inferior
  const scale = Math.min(0.9, (visW * 0.98) / 4.9);
  const ratio = Math.min(0.64, Math.max(0.34, contentBottom + 0.015));
  const topOfHelmet = visH / 2 - visH * ratio;
  return {
    mobile: true,
    x: -0.2 * scale,
    y: topOfHelmet - 3.05 * scale,
    scale,
    spread: 0.62,
    spreadY: 0.8,
    holo: { pos: [1.3, 2.15, 0.5], scale: 0.72 },
  };
}

export default function Scene({ quality, settings, pointer, tagEls, captionEl, onReady, contentBottom = 0.5, contentRight = 0.45 }) {
  const { camera, size, setDpr } = useThree();
  // em desenvolvimento, ?t=8 pula a linha do tempo (útil para ajustar a cena)
  const devParams = import.meta.env.DEV ? new URLSearchParams(window.location.search) : null;
  const clock = useRef(devParams ? Number(devParams.get('t')) || 0 : 0);
  const frozen = devParams ? devParams.has('freeze') : false;
  const astroGroup = useRef();
  const rays = useRef();
  const parallax = useRef({ x: 0, y: 0 });
  const readySent = useRef(false);
  const perf = useRef({ frames: 0, time: 0, done: false });
  const tagWidths = useRef([]);
  const v = useMemo(() => new THREE.Vector3(), []);

  const [astroTex, spaceTex] = useLoader(THREE.TextureLoader, [
    quality === 'high' ? 'img/hero/astronaut.webp' : 'img/hero/astronaut-sm.webp',
    quality === 'high' ? 'img/hero/space.webp' : 'img/hero/space-sm.webp',
  ]);

  useMemo(() => {
    [astroTex, spaceTex].forEach((t) => {
      t.colorSpace = THREE.NoColorSpace;
      t.anisotropy = 4;
    });
    spaceTex.wrapS = spaceTex.wrapT = THREE.RepeatWrapping;
  }, [astroTex, spaceTex]);

  const layout = useMemo(
    () => computeLayout(size.width, size.height, contentBottom, contentRight),
    [size.width, size.height, contentBottom, contentRight]
  );

  useEffect(() => {
    camera.fov = FOV;
    camera.position.set(0, 0.2, CAM_START_Z);
    camera.updateProjectionMatrix();
    tagWidths.current = tagEls.current.map((el) => (el ? el.offsetWidth : 0));
  }, [camera, tagEls, size.width]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1);
    if (!frozen) clock.current += dt;
    const t = clock.current;
    const time = state.clock.elapsedTime;

    if (!readySent.current) {
      readySent.current = true;
      requestAnimationFrame(() => onReady && onReady());
    }

    // monitor de desempenho simples: reduz a resolução se o FPS cair
    const pf = perf.current;
    if (!pf.done && t > 2.5) {
      pf.frames += 1;
      pf.time += delta;
      if (pf.frames >= 90) {
        const fps = pf.frames / pf.time;
        if (fps < 45) setDpr(1);
        pf.done = true;
      }
    }

    // câmera: aproximação lenta + parallax do mouse (ou leve deriva no touch)
    const dolly = easeInOutCubic(progress(t, TIMELINE.dolly));
    const px = pointer.current.active ? pointer.current.x : Math.sin(time * 0.18) * 0.35;
    const py = pointer.current.active ? pointer.current.y : Math.cos(time * 0.14) * 0.2;
    const cam = state.camera;
    cam.position.z = lerp(CAM_START_Z, CAM_END_Z, dolly);
    // compensa o dolly para o astronauta manter o enquadramento à direita do texto
    const baseX = layout.mobile ? 0 : layout.x * (1 - cam.position.z / CAM_END_Z);
    parallax.current.x = lerp(parallax.current.x, px * 0.45, 0.04);
    parallax.current.y = lerp(parallax.current.y, py * 0.25, 0.04);
    cam.position.x = baseX + parallax.current.x;
    cam.position.y = 0.15 + parallax.current.y;
    cam.lookAt(baseX + (layout.mobile ? 0 : layout.x * 0.18), 0, 0);
    cam.updateMatrixWorld();

    if (rays.current) rays.current.uniforms.uTime.value = time;

    // tags tecnológicas: posição 3D projetada para elementos DOM
    const group = astroGroup.current;
    if (group) {
      group.updateMatrixWorld(true);
      const w = size.width;
      const h = size.height;
      for (let i = 0; i < TECH_TAGS.length; i++) {
        const el = tagEls.current[i];
        if (!el) continue;
        const tag = TECH_TAGS[i];
        if (layout.mobile && !tag.mobile) {
          el.style.opacity = '0';
          el.style.visibility = 'hidden';
          continue;
        }
        el.style.visibility = 'visible';
        const start = TIMELINE.tagsStart + i * TIMELINE.tagsStep;
        const appear = easeOutCubic(progress(t, [start, start + TIMELINE.tagsDur]));
        const float = Math.sin(time * 0.7 + tag.phase * 2.0) * 0.09;
        v.set(tag.pos[0] * layout.spread, tag.pos[1] * layout.spreadY + float, tag.pos[2]);
        group.localToWorld(v);
        const dist = v.distanceTo(cam.position);
        v.project(cam);
        const depth = CAM_END_Z / dist;
        const s = clamp01(depth) * (layout.mobile ? 0.82 : 1) * (0.92 + appear * 0.08);
        const half = ((tagWidths.current[i] || 90) * s) / 2 + 8;
        let x = (v.x * 0.5 + 0.5) * w;
        const y = (-v.y * 0.5 + 0.5) * h + (1 - appear) * 14;
        const minX = layout.mobile ? half : Math.max(half, contentRight * w + half + 16);
        x = Math.min(w - half, Math.max(minX, x));
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%) scale(${s.toFixed(3)})`;
        el.style.opacity = (appear * (0.6 + 0.4 * clamp01((depth - 0.85) * 4))).toFixed(3);
      }
    }

    if (captionEl.current) {
      const c = easeOutCubic(progress(t, TIMELINE.caption));
      captionEl.current.style.opacity = c.toFixed(3);
      captionEl.current.style.transform = `translateY(${((1 - c) * 10).toFixed(1)}px)`;
    }
  });

  return (
    <>
      <Backdrop texture={spaceTex} />
      <Planet position={layout.mobile ? [7, 13, -46] : [25, 13.5, -50]} radius={layout.mobile ? 4 : 4.6} />
      {settings.rays && <LightRays ref={rays} size={[60, 34]} position={[6, 3, -20]} />}
      <FlareStars count={settings.flares} />
      <Starfield count={settings.stars} clock={clock} />
      <Astronaut texture={astroTex} clock={clock} layout={layout} pointer={pointer} groupRef={astroGroup} />
      <DustParticles count={settings.dust} clock={clock} />
    </>
  );
}

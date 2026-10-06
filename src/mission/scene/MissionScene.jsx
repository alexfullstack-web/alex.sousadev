import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import Rocket from './Rocket.jsx';
import SpaceField from './SpaceField.jsx';
import { Earth, Moon, makeEarthUniforms, quaternionForLatLon } from './Planets.jsx';
import { Gates, LaunchPad, Flag } from './Props.jsx';
import {
  EARTH_R, EARTH_Y, MOON_R, altitude, flip, thrust, smooth, moonPosition, cameraKey, kmFromP, lerp,
} from '../missionPath.js';

const SUN_BASE = new THREE.Vector3(-0.75, 0.5, 0.55).normalize();

export default function MissionScene({ progressRef, quality, portrait, hudRef, onReady }) {
  const { scene, gl } = useThree();
  const sfx = quality === 'high' ? '' : '-sm';
  const [day, night, clouds, moonTex] = useLoader(THREE.TextureLoader, [
    `img/space/earth-day${sfx}.webp`,
    `img/space/earth-night${sfx}.webp`,
    `img/space/earth-clouds${sfx}.webp`,
    `img/space/moon${sfx}.webp`,
  ]);
  useMemo(() => {
    [day, night, moonTex].forEach((t) => (t.colorSpace = THREE.SRGBColorSpace));
    clouds.colorSpace = THREE.NoColorSpace;
    [day, night, clouds, moonTex].forEach((t) => {
      t.anisotropy = 4;
      t.wrapS = THREE.RepeatWrapping;
    });
  }, [day, night, clouds, moonTex]);

  // reflexos metálicos discretos no foguete
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.35;
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);

  const sun = useMemo(() => SUN_BASE.clone(), []);
  const earthU = useMemo(() => makeEarthUniforms({ day, night, clouds }, sun), [day, night, clouds, sun]);
  const haloU = useMemo(() => ({ uSun: { value: sun }, uOpacity: { value: 1 } }), [sun]);
  const farEarthU = useMemo(() => {
    const u = makeEarthUniforms({ day, night, clouds }, sun);
    u.uCloud.value = 0.3;
    return u;
  }, [day, night, clouds, sun]);
  const farHaloU = useMemo(() => ({ uSun: { value: sun }, uOpacity: { value: 0 } }), [sun]);
  const earthQuat = useMemo(() => quaternionForLatLon(-10, -47, 0.22), []);

  const world = useRef();
  const rocket = useRef();
  const moon = useRef();
  const earth = useRef();
  const farEarth = useRef();
  const sunLight = useRef();
  const earthMat = useRef();
  const earthHalo = useRef();
  const farMat = useRef();
  const farHalo = useRef();

  const altRef = useRef(0);
  const thrustRef = useRef(0);
  const speedRef = useRef(0);
  const smokeRef = useRef(0);
  const raiseRef = useRef(0);
  const ps = useRef(progressRef.current);
  const devP = useMemo(() => {
    if (!import.meta.env.DEV) return null;
    const v = new URLSearchParams(window.location.search).get('mp');
    return v === null ? null : Number(v);
  }, []);
  const ready = useRef(false);
  const v = useMemo(() => ({ off: new THREE.Vector3(), tgt: new THREE.Vector3(), m: new THREE.Vector3(), z: new THREE.Vector3(0, 0, 1) }), []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const time = state.clock.elapsedTime;
    if (!ready.current) {
      ready.current = true;
      requestAnimationFrame(() => onReady && onReady());
    }

    // progresso suavizado (scroll → cena). Em dev, ?mp=0.5 fixa o progresso.
    if (import.meta.env.DEV && typeof window.__missionP === 'number') ps.current = window.__missionP;
    else if (devP !== null) ps.current = devP;
    else ps.current = lerp(ps.current, progressRef.current, 1 - Math.exp(-dt * 4.5));
    const p = ps.current;
    const a = altitude(p);
    const speed = (a - altRef.current) / Math.max(dt, 1e-4);
    speedRef.current = lerp(speedRef.current, speed, 1 - Math.exp(-dt * 8));
    altRef.current = a;
    world.current.position.y = -a;

    const f = flip(p);
    const theta = f * Math.PI;

    // foguete: giro da manobra + balanço suave
    const r = rocket.current;
    r.rotation.set(Math.sin(time * 0.9) * 0.015, Math.sin(time * 0.22) * 0.55, theta + Math.sin(time * 0.7) * 0.012);

    const th = thrust(p) + Math.min(0.35, Math.abs(speedRef.current) * 0.004) * (p < 0.97 ? 1 : 0);
    thrustRef.current = devP !== null || (import.meta.env.DEV && typeof window.__missionP === 'number') ? th : lerp(thrustRef.current, th, 1 - Math.exp(-dt * 7));
    smokeRef.current = p < 0.004 ? 0.25 : smooth(0.0, 0.025, p) * (1 - smooth(0.06, 0.13, p));
    raiseRef.current = smooth(0.975, 0.997, p);

    // Lua
    moonPosition(p, v.m);
    moon.current.position.copy(v.m);
    moon.current.rotation.y = 1.2 + time * 0.004;

    // Terra próxima (decolagem) e Terra distante (vista da Lua)
    earth.current.visible = p < 0.42;
    const farA = smooth(0.85, 0.93, p);
    farEarth.current.visible = farA > 0.01;
    // luz do sol acompanha a rotação da câmera (iluminação consistente na tela)
    sun.copy(SUN_BASE).applyAxisAngle(v.z, theta);
    [earthMat, farMat].forEach((r, i) => {
      if (!r.current) return;
      r.current.uniforms.uTime.value = time;
      r.current.uniforms.uSun.value.copy(sun);
      if (i === 1) r.current.uniforms.uOpacity.value = farA;
    });
    [earthHalo, farHalo].forEach((r, i) => {
      if (!r.current) return;
      r.current.uniforms.uSun.value.copy(sun);
      if (i === 1) r.current.uniforms.uOpacity.value = farA;
    });
    if (import.meta.env.DEV) window.__mission = { thrust: thrustRef.current, p };
    sunLight.current.position.copy(sun).multiplyScalar(60);

    // câmera
    cameraKey(p, v.off, v.tgt);
    if (portrait) {
      v.off.multiplyScalar(1.55);
      // celular: foguete um pouco acima do centro (painel de código fica embaixo)
      v.tgt.y = v.tgt.y * 0.6 - 1.1;
      v.off.y -= 1.1;
    } else {
      // desloca o foguete para o vão entre o cartão e o painel de código
      v.off.x += 0.9;
      v.tgt.x += 0.9;
    }
    v.off.applyAxisAngle(v.z, theta);
    v.tgt.applyAxisAngle(v.z, theta);
    const cam = state.camera;
    cam.position.copy(v.off);
    cam.up.set(-Math.sin(theta), Math.cos(theta), 0);
    cam.lookAt(v.tgt);

    // painel de telemetria (DOM)
    const hud = hudRef.current;
    if (hud && hud.alt) {
      hud.alt.textContent = kmFromP(p).toLocaleString('pt-BR');
      const kms = Math.abs(speedRef.current) * 0.12;
      hud.vel.textContent = (p > 0.97 ? 0 : kms).toFixed(1).replace('.', ',');
    }
  });

  return (
    <>
      <color attach="background" args={['#02040a']} />
      <hemisphereLight args={['#9ab8ff', '#05070d', 0.45]} />
      <directionalLight ref={sunLight} intensity={2.6} color="#ffffff" />
      <directionalLight position={[6, 3, -8]} intensity={2.2} color="#3d7bff" />

      <SpaceField count={quality === 'high' ? 3600 : 1400} speedRef={speedRef} />

      <group ref={world}>
        <Earth ref={earth} matRef={earthMat} haloRef={earthHalo} radius={EARTH_R} position={[0, EARTH_Y, 0]} quaternion={earthQuat} uniforms={earthU} haloUniforms={haloU} />
        <LaunchPad smokeRef={smokeRef} quality={quality} />
        <Gates altRef={altRef} />
      </group>

      <Moon ref={moon} radius={MOON_R} texture={moonTex} />

      {/* referencial final (após o giro de 180°) */}
      <group rotation={[0, 0, Math.PI]}>
        <Earth
          ref={farEarth}
          matRef={farMat}
          haloRef={farHalo}
          radius={3.0}
          segments={64}
          position={[6.2, 5.2, -46]}
          quaternion={earthQuat}
          uniforms={farEarthU}
          haloUniforms={farHaloU}
        />
        <Flag raiseRef={raiseRef} position={[2.35, -2.2, 0.35]} rotation={[0, -0.4, 0.02]} />
      </group>

      <Rocket quality={quality} thrustRef={thrustRef} rocketRef={rocket} />
    </>
  );
}

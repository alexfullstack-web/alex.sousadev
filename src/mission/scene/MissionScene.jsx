import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import Rocket from './Rocket.jsx';
import SpaceField from './SpaceField.jsx';
import { Earth, Moon, makeEarthUniforms, updateEarth, quaternionForLatLon } from './Planets.jsx';
import { Gates, LaunchPad, Flag } from './Props.jsx';
import {
  EARTH_R, MOON_R, P, altitude, flip, thrust, smooth, moonPosition, earthPosition, cameraKey, kmFromP, lerp,
} from '../missionPath.js';
import { getProgress, writeTelemetry } from '../../journey/journeyStore.js';

const SUN_BASE = new THREE.Vector3(-0.75, 0.5, 0.55).normalize();

export default function MissionScene({ quality, portrait, onReady }) {
  const { scene, gl } = useThree();
  const hd = quality === 'high';
  const textures = useLoader(THREE.TextureLoader, [
    hd ? 'img/space/earth-day-hd.webp' : 'img/space/earth-day.webp',
    hd ? 'img/space/earth-night.webp' : 'img/space/earth-night-sm.webp',
    hd ? 'img/space/earth-clouds.webp' : 'img/space/earth-clouds-sm.webp',
    hd ? 'img/space/earth-water.webp' : 'img/space/earth-water-sm.webp',
    'img/space/earth-topo.webp',
    hd ? 'img/space/moon-hd.webp' : 'img/space/moon.webp',
    'img/space/moon-bump.webp',
  ]);
  const [day, night, clouds, water, topo, moonTex, moonBump] = textures;
  useMemo(() => {
    [day, night, moonTex].forEach((t) => (t.colorSpace = THREE.SRGBColorSpace));
    [clouds, water, topo, moonBump].forEach((t) => (t.colorSpace = THREE.NoColorSpace));
    textures.forEach((t) => {
      t.anisotropy = gl.capabilities.getMaxAnisotropy ? Math.min(8, gl.capabilities.getMaxAnisotropy()) : 4;
      t.wrapS = THREE.RepeatWrapping;
    });
  }, [textures, day, night, clouds, water, topo, moonTex, moonBump, gl]);

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
  const earthTex = { day, night, clouds, water, topo };
  const earthU = useMemo(() => makeEarthUniforms(earthTex, sun), [day, night, clouds, water, topo]); // eslint-disable-line react-hooks/exhaustive-deps
  const farU = useMemo(() => makeEarthUniforms(earthTex, sun), [day, night, clouds, water, topo]); // eslint-disable-line react-hooks/exhaustive-deps
  const earthQuat = useMemo(() => quaternionForLatLon(-12, -50, 0.22), []);
  const farQuat = useMemo(() => quaternionForLatLon(-5, -45, 1.35), []);

  const world = useRef();
  const rocket = useRef();
  const moon = useRef();
  const earth = useRef();
  const farEarth = useRef();
  const sunLight = useRef();
  const earthMats = [useRef(), useRef(), useRef()];
  const farMats = [useRef(), useRef(), useRef()];

  const altRef = useRef(0);
  const thrustRef = useRef(0);
  const speedRef = useRef(0);
  const smokeRef = useRef(0);
  const raiseRef = useRef(0);
  const ps = useRef(getProgress());
  const devP = useMemo(() => {
    if (!import.meta.env.DEV) return null;
    const v = new URLSearchParams(window.location.search).get('mp');
    return v === null ? null : Number(v);
  }, []);
  const ready = useRef(false);
  const v = useMemo(
    () => ({ off: new THREE.Vector3(), tgt: new THREE.Vector3(), m: new THREE.Vector3(), e: new THREE.Vector3(), z: new THREE.Vector3(0, 0, 1) }),
    []
  );

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const time = state.clock.elapsedTime;
    if (!ready.current) {
      ready.current = true;
      requestAnimationFrame(() => onReady && onReady());
    }

    // progresso: rolagem do site → viagem (suavizado). Em dev, ?mp=0.5 fixa o ponto.
    const forced = import.meta.env.DEV && typeof window.__missionP === 'number' ? window.__missionP : devP;
    if (forced !== null && forced !== undefined) ps.current = forced;
    else ps.current = lerp(ps.current, getProgress(), 1 - Math.exp(-dt * 4.5));
    const p = ps.current;

    const a = altitude(p);
    const speed = (a - altRef.current) / Math.max(dt, 1e-4);
    speedRef.current = lerp(speedRef.current, speed, 1 - Math.exp(-dt * 8));
    altRef.current = a;
    world.current.position.y = -a;

    const f = flip(p);
    const theta = f * Math.PI;

    const r = rocket.current;
    r.rotation.set(Math.sin(time * 0.9) * 0.015, Math.sin(time * 0.22) * 0.55, theta + Math.sin(time * 0.7) * 0.012);

    const th = thrust(p) + Math.min(0.35, Math.abs(speedRef.current) * 0.004) * (p < P.landed ? 1 : 0);
    thrustRef.current = forced != null ? thrust(p) : lerp(thrustRef.current, th, 1 - Math.exp(-dt * 7));
    smokeRef.current = p < 0.004 ? 0.25 : smooth(0.0, 0.025, p) * (1 - smooth(0.06, 0.13, p));
    raiseRef.current = smooth(0.975, 0.997, p);

    // Lua
    moonPosition(p, v.m);
    moon.current.position.copy(v.m);
    moon.current.rotation.y = 1.2 + time * 0.004;

    // Terra (decolagem → globo que fica para trás) e Terra distante (vista da Lua)
    earthPosition(p, a, v.e);
    earth.current.position.copy(v.e);
    earth.current.visible = p < 0.4;
    const farA = smooth(0.89, 0.95, p);
    farEarth.current.visible = farA > 0.01;

    sun.copy(SUN_BASE).applyAxisAngle(v.z, theta);
    updateEarth(earthMats, sun, time, 1);
    updateEarth(farMats, sun, time, farA);
    sunLight.current.position.copy(sun).multiplyScalar(60);

    // câmera
    cameraKey(p, v.off, v.tgt);
    if (portrait) {
      v.off.multiplyScalar(1.55);
      v.tgt.y = v.tgt.y * 0.6 - 1.1;
      v.off.y -= 1.1;
    } else {
      // na seção Missão o foguete fica no vão entre o cartão e o painel de código
      const pan = 0.35 + 0.55 * (smooth(0.17, 0.22, p) - smooth(0.84, 0.88, p));
      v.off.x += pan;
      v.tgt.x += pan;
    }
    v.off.applyAxisAngle(v.z, theta);
    v.tgt.applyAxisAngle(v.z, theta);
    const cam = state.camera;
    cam.position.copy(v.off);
    cam.up.set(-Math.sin(theta), Math.cos(theta), 0);
    cam.lookAt(v.tgt);

    writeTelemetry(kmFromP(p), p > P.landed ? 0 : Math.round(Math.abs(speedRef.current) * 1.2) / 10);
  });

  return (
    <>
      <color attach="background" args={['#02040a']} />
      <hemisphereLight args={['#9ab8ff', '#05070d', 0.22]} />
      <directionalLight ref={sunLight} intensity={2.8} color="#fffaf2" />
      <directionalLight position={[6, 3, -8]} intensity={1.8} color="#3d7bff" />

      <SpaceField count={quality === 'high' ? 3600 : 1400} speedRef={speedRef} />

      <Earth ref={earth} matRefs={earthMats} radius={EARTH_R} quaternion={earthQuat} uniforms={earthU} segments={hd ? 160 : 96} />

      <group ref={world}>
        <LaunchPad smokeRef={smokeRef} quality={quality} />
        <Gates altRef={altRef} />
      </group>

      <Moon ref={moon} radius={MOON_R} texture={moonTex} bump={moonBump} />

      {/* referencial final (após o giro de 180°) */}
      <group rotation={[0, 0, Math.PI]}>
        <group position={[6.2, 5.2, -46]}>
          <Earth ref={farEarth} matRefs={farMats} radius={3.0} segments={64} quaternion={farQuat} uniforms={farU} />
        </group>
        <Flag raiseRef={raiseRef} position={[2.35, -2.2, 0.35]} rotation={[0, -0.4, 0.02]} />
      </group>

      <Rocket quality={quality} thrustRef={thrustRef} rocketRef={rocket} />
    </>
  );
}

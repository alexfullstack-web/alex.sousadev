import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import MissionScene from './scene/MissionScene.jsx';

/* Carregado sob demanda quando a seção da missão se aproxima da tela. */
export default function MissionCanvas({ quality, active, progressRef, portrait, hudRef, onReady }) {
  return (
    <Canvas
      className="mission__canvas"
      dpr={quality === 'high' ? [1, 1.75] : [1, 1.3]}
      frameloop={active ? 'always' : 'never'}
      gl={{ antialias: quality === 'high', powerPreference: 'high-performance', stencil: false }}
      camera={{ fov: 42, near: 0.1, far: 1400, position: [0, 0.5, 9] }}
      resize={{ debounce: 150, scroll: false }}
      aria-hidden="true"
    >
      <Suspense fallback={null}>
        <MissionScene progressRef={progressRef} quality={quality} portrait={portrait} hudRef={hudRef} onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}

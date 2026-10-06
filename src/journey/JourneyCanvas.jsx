import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import MissionScene from '../mission/scene/MissionScene.jsx';

/* Cena 3D fixa atrás do site inteiro: a viagem do foguete da Terra à Lua. */
export default function JourneyCanvas({ quality, active, portrait, onReady }) {
  return (
    <Canvas
      className="journey__canvas"
      dpr={quality === 'high' ? [1, 1.75] : [1, 1.3]}
      frameloop={active ? 'always' : 'never'}
      gl={{ antialias: quality === 'high', powerPreference: 'high-performance', stencil: false }}
      camera={{ fov: 42, near: 0.1, far: 1400, position: [0, 2.4, 11.6] }}
      resize={{ debounce: 150, scroll: false }}
      aria-hidden="true"
    >
      <Suspense fallback={null}>
        <MissionScene quality={quality} portrait={portrait} onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}

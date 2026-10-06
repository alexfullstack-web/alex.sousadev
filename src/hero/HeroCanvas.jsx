import { Suspense, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { QUALITY, TECH_TAGS } from './config.js';
import Scene from './scene/Scene.jsx';

/*
  Carregado sob demanda (React.lazy): three.js e a cena só entram no
  navegador depois que o conteúdo principal da página já apareceu.
*/
export default function HeroCanvas({ quality, active, contentBottom, contentRight, onReady }) {
  const settings = QUALITY[quality];
  const pointer = useRef({ x: 0, y: 0, active: false });
  const tagEls = useRef([]);
  const captionEl = useRef(null);

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return undefined;
    const onMove = (e) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
      pointer.current.active = true;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  return (
    <div className="ast-scene">
      <Canvas
        className="ast-scene__canvas"
        dpr={settings.dpr}
        linear
        flat
        frameloop={active ? 'always' : 'never'}
        gl={{
          antialias: settings.antialias,
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false,
        }}
        camera={{ fov: 35, near: 0.1, far: 300, position: [0, 0.2, 17] }}
        onCreated={({ gl }) => gl.setClearColor('#02040a', 1)}
        resize={{ debounce: 150, scroll: false }}
        aria-hidden="true"
        tabIndex={-1}
      >
        <Suspense fallback={null}>
          <Scene
            quality={quality}
            settings={settings}
            pointer={pointer}
            tagEls={tagEls}
            captionEl={captionEl}
            onReady={onReady}
            contentBottom={contentBottom}
            contentRight={contentRight}
          />
        </Suspense>
      </Canvas>

      <ul className="ast-tags" aria-label="Tecnologias">
        {TECH_TAGS.map((tag, i) => (
          <li
            key={tag.label}
            ref={(el) => {
              tagEls.current[i] = el;
            }}
            className="ast-tag"
            style={{ opacity: 0 }}
          >
            <span className="ast-tag__dot" aria-hidden="true" />
            {tag.label}
          </li>
        ))}
      </ul>

      <div className="ast-caption" ref={captionEl} style={{ opacity: 0 }} aria-hidden="true">
        <span className="ast-caption__brand">ALEX SOUSA TECH</span>
        <span className="ast-caption__line">DESENVOLVIMENTO • TECNOLOGIA • INOVAÇÃO</span>
      </div>
    </div>
  );
}

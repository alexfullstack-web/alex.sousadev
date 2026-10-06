import { LazyMotion, MotionConfig, domAnimation } from 'framer-motion';
import SpaceBackground from './components/SpaceBackground.jsx';
import Navbar from './components/Navbar.jsx';
import HeroSpace from './hero/HeroSpace.jsx';
import Mission from './mission/Mission.jsx';
import { JourneyProvider, JourneyWindow, JourneyBar, useJourneyMode } from './journey/Journey.jsx';
import { About, Stack, Projects, Experience, Contact, Footer } from './components/Sections.jsx';

/* Fundo de estrelas em CSS só quando a viagem 3D não roda (movimento reduzido / sem WebGL) */
function StaticBackground() {
  return useJourneyMode() === 'static' ? <SpaceBackground /> : null;
}

export default function App() {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <JourneyProvider>
          <StaticBackground />
          <a className="skip-link" href="#conteudo">
            Pular para o conteúdo
          </a>
          <Navbar />
          <main id="conteudo">
            <HeroSpace />
            <About />
            <JourneyWindow id="janela-decolagem" keys={['decolagem']} height={190} />
            <Stack />
            <JourneyWindow id="janela-orbita" keys={['orbita']} height={150} />
            <Mission />
            <Projects />
            <Experience />
            <JourneyWindow id="janela-pouso" keys={['aproximacao', 'pouso']} height={260}>
              <div className="jwin__actions">
                <a className="ast-btn ast-btn--primary" href="#contato">
                  Lançar meu projeto
                </a>
                <a className="ast-btn ast-btn--ghost" href="#projetos">
                  Ver projetos
                </a>
              </div>
            </JourneyWindow>
            <Contact />
          </main>
          <Footer />
          <JourneyBar />
        </JourneyProvider>
      </MotionConfig>
    </LazyMotion>
  );
}

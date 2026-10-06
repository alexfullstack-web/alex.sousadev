import { LazyMotion, MotionConfig, domAnimation } from 'framer-motion';
import SpaceBackground from './components/SpaceBackground.jsx';
import Navbar from './components/Navbar.jsx';
import HeroSpace from './hero/HeroSpace.jsx';
import Mission from './mission/Mission.jsx';
import { About, Stack, Projects, Experience, Contact, Footer } from './components/Sections.jsx';

export default function App() {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <SpaceBackground />
        <a className="skip-link" href="#conteudo">
          Pular para o conteúdo
        </a>
        <Navbar />
        <main id="conteudo">
          <HeroSpace />
          <About />
          <Stack />
          <Mission />
          <Projects />
          <Experience />
          <Contact />
        </main>
        <Footer />
      </MotionConfig>
    </LazyMotion>
  );
}

import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { SiteProvider } from './context/SiteContext.jsx';
import TechBackground from './components/TechBackground.jsx';
import LoadingScreen from './components/LoadingScreen.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import WhatsAppFloat from './components/WhatsAppFloat.jsx';
import JoaoPedro from './components/JoaoPedro.jsx';
import Home from './pages/Home.jsx';

const Projetos = lazy(() => import('./pages/Projetos.jsx'));
const Projeto = lazy(() => import('./pages/Projeto.jsx'));
const Orcamento = lazy(() => import('./pages/Orcamento.jsx'));
const Privacidade = lazy(() => import('./pages/Privacidade.jsx'));
const NaoEncontrado = lazy(() => import('./pages/NaoEncontrado.jsx'));

// Links "/#secao": rola até a seção (esperando a página montar); troca de página volta ao topo.
function Rolagem() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return undefined;
    }
    let tentativas = 0;
    const id = decodeURIComponent(hash.slice(1));
    const t = setInterval(() => {
      const el = document.getElementById(id);
      if (el || ++tentativas > 30) {
        clearInterval(t);
        el?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
      }
    }, 60);
    return () => clearInterval(t);
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <SiteProvider>
        <TechBackground />
        <LoadingScreen />
        <a className="pular" href="#conteudo">
          Pular para o conteúdo
        </a>
        <Navbar />
        <Rolagem />
        <main id="conteudo" tabIndex={-1}>
          <Suspense fallback={<div className="pagina" aria-busy="true" />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/projetos" element={<Projetos />} />
              <Route path="/projetos/:slug" element={<Projeto />} />
              <Route path="/orcamento" element={<Orcamento />} />
              <Route path="/privacidade" element={<Privacidade />} />
              <Route path="*" element={<NaoEncontrado />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
        <WhatsAppFloat />
        <JoaoPedro />
      </SiteProvider>
    </BrowserRouter>
  );
}

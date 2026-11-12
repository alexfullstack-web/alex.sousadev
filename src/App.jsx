import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Footer from './components/Footer.jsx';
import Header from './components/Header.jsx';
import StarBackground from './components/StarBackground.jsx';
import WhatsAppFloat from './components/WhatsAppFloat.jsx';
import Home from './pages/Home.jsx';

const Empresa = lazy(() => import('./pages/Empresa.jsx'));
const SobreAlexSousa = lazy(() => import('./pages/SobreAlexSousa.jsx'));
const Servicos = lazy(() => import('./pages/Servicos.jsx'));
const Projetos = lazy(() => import('./pages/Projetos.jsx'));
const Projeto = lazy(() => import('./pages/Projeto.jsx'));
const Orcamento = lazy(() => import('./pages/Orcamento.jsx'));
const Contato = lazy(() => import('./pages/Contato.jsx'));
const Privacidade = lazy(() => import('./pages/Privacidade.jsx'));
const NaoEncontrado = lazy(() => import('./pages/NaoEncontrado.jsx'));

// Links "/pagina#secao": rola até a seção (esperando a página montar); troca de página volta ao topo.
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
  const { pathname } = useLocation();
  return (
    <>
      <StarBackground />
      <a className="pular" href="#conteudo">
        Pular para o conteúdo
      </a>
      <Header />
      <Rolagem />
      <main id="conteudo" tabIndex={-1}>
        {/* A chave reinicia a transição suave a cada troca de página. */}
        <div key={pathname} className="transicao">
          <Suspense fallback={<div className="pagina-topo" aria-busy="true" />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/empresa" element={<Empresa />} />
              <Route path="/sobre-alex-sousa" element={<SobreAlexSousa />} />
              <Route path="/servicos" element={<Servicos />} />
              <Route path="/projetos" element={<Projetos />} />
              <Route path="/projetos/:slug" element={<Projeto />} />
              <Route path="/orcamento" element={<Orcamento />} />
              <Route path="/contato" element={<Contato />} />
              <Route path="/privacidade" element={<Privacidade />} />
              <Route path="*" element={<NaoEncontrado />} />
            </Routes>
          </Suspense>
        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}

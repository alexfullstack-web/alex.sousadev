import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Footer from './components/Footer.jsx';
import Header from './components/Header.jsx';
import TechBackground from './components/TechBackground.jsx';
import WhatsAppFloat from './components/WhatsAppFloat.jsx';
import { CarregandoPagina } from './components/ui/Carregando.jsx';
import Home from './pages/Home.jsx';
import { CAMINHO_PRIVACIDADE, CAMINHO_TERMOS } from './data/legal.js';

const Empresa = lazy(() => import('./pages/Empresa.jsx'));
const SobreAlexSousa = lazy(() => import('./pages/SobreAlexSousa.jsx'));
const Servicos = lazy(() => import('./pages/Servicos.jsx'));
const Planos = lazy(() => import('./pages/Planos.jsx'));
const Orcamento = lazy(() => import('./pages/Orcamento.jsx'));
const Contato = lazy(() => import('./pages/Contato.jsx'));
const PoliticaPrivacidade = lazy(() => import('./pages/PoliticaPrivacidade.jsx'));
const TermosUso = lazy(() => import('./pages/TermosUso.jsx'));
const NaoEncontrado = lazy(() => import('./pages/NaoEncontrado.jsx'));
// Área do cliente: um só pedaço de código, carregado só em /conta.
const conta = (nome) => lazy(() => import('./conta/Paginas.jsx').then((m) => ({ default: m[nome] })));
const ContaLayout = conta('ContaLayout');
const MinhaConta = conta('MinhaConta');
const Entrar = conta('Entrar');
const Cadastro = conta('Cadastro');
const EsqueciSenha = conta('EsqueciSenha');
const RedefinirSenha = conta('RedefinirSenha');

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
  // A área do cliente (/conta) tem cabeçalho e navegação próprios, como uma plataforma.
  const areaCliente = pathname === '/conta' || pathname.startsWith('/conta/');
  return (
    <>
      <TechBackground />
      <a className="pular" href="#conteudo">
        Pular para o conteúdo
      </a>
      {!areaCliente && <Header />}
      <Rolagem />
      <main id="conteudo" tabIndex={-1}>
        {/* A chave reinicia a transição suave a cada troca de página. */}
        <div key={pathname} className="transicao">
          <Suspense fallback={<CarregandoPagina />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/empresa" element={<Empresa />} />
              <Route path="/sobre-alex-sousa" element={<SobreAlexSousa />} />
              <Route path="/servicos" element={<Servicos />} />
              <Route path="/planos" element={<Planos />} />
              {/* Vitrine pública de projetos removida: a Vercel redireciona (308); aqui cobre a navegação interna. */}
              <Route path="/projetos/*" element={<Navigate to="/servicos" replace />} />
              <Route path="/orcamento" element={<Orcamento />} />
              <Route path="/contato" element={<Contato />} />
              <Route path={CAMINHO_PRIVACIDADE} element={<PoliticaPrivacidade />} />
              <Route path={CAMINHO_TERMOS} element={<TermosUso />} />
              {/* Endereço antigo: a Vercel redireciona (308); aqui cobre a navegação interna. */}
              <Route path="/privacidade" element={<Navigate to={CAMINHO_PRIVACIDADE} replace />} />
              <Route path="/conta" element={<ContaLayout />}>
                <Route index element={<MinhaConta />} />
                <Route path="entrar" element={<Entrar />} />
                <Route path="cadastro" element={<Cadastro />} />
                <Route path="esqueci-senha" element={<EsqueciSenha />} />
                <Route path="redefinir-senha" element={<RedefinirSenha />} />
              </Route>
              <Route path="*" element={<NaoEncontrado />} />
            </Routes>
          </Suspense>
        </div>
      </main>
      {!areaCliente && <Footer />}
      {!areaCliente && <WhatsAppFloat />}
    </>
  );
}

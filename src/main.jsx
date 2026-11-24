import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { foiPreRenderizado } from './seo/dadosIniciais.js';
// Fontes servidas pelo próprio site (sem chamar terceiros: mais rápido e sem enviar dados a outros domínios).
import '@fontsource/sora/latin-500.css';
import '@fontsource/sora/latin-600.css';
import '@fontsource/sora/latin-700.css';
import '@fontsource/manrope/latin-400.css';
import '@fontsource/manrope/latin-500.css';
import '@fontsource/manrope/latin-600.css';
import '@fontsource/manrope/latin-700.css';
import './styles/base.css';
import './styles/ui.css';
import './styles/layout.css';
import './styles/paginas.css';

const raiz = document.getElementById('root');
const app = (
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);

// Páginas geradas no build já têm o conteúdo: o React só assume. A casca (área do cliente) monta do zero.
if (foiPreRenderizado()) hydrateRoot(raiz, app);
else createRoot(raiz).render(app);

// Tela de abertura (definida em index.html): sai com transição suave assim que o React assume a página.
// Não há porcentagem: o tempo de carregamento não é medido, então nada de número inventado.
const abertura = document.getElementById('abertura');
if (abertura) {
  const minimo = 450; // tempo mínimo para a animação de entrada não "piscar"
  const restante = Math.max(0, minimo - performance.now());
  setTimeout(() => {
    abertura.classList.add('abertura--saindo');
    abertura.addEventListener('animationend', () => abertura.remove(), { once: true });
    setTimeout(() => abertura.remove(), 900);
    try {
      sessionStorage.setItem('ast-abertura', '1');
    } catch {
      /* navegação privada: tudo bem */
    }
  }, restante);
}

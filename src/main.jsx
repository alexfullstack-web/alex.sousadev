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
import './styles/site.css';

const raiz = document.getElementById('root');
const app = (
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);

// Páginas geradas no build já têm o conteúdo: o React só assume. A casca de projetos novos monta do zero.
if (foiPreRenderizado()) hydrateRoot(raiz, app);
else createRoot(raiz).render(app);

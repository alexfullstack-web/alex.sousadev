// Entrada da pré-renderização (só no build; não vai para o navegador).
import { StrictMode } from 'react';
import { prerenderToNodeStream } from 'react-dom/static';
import { StaticRouter } from 'react-router-dom';
import App from './App.jsx';
import { definirDadosIniciais } from './seo/dadosIniciais.js';
import { iniciarColetaSeo, lerColetaSeo } from './hooks/useSeo.js';

export { calcularSeo, cabecalhoHtml, jsonSeguro } from './seo/cabecalho.js';

export async function renderizar(url, dados) {
  definirDadosIniciais(dados);
  iniciarColetaSeo();
  const { prelude } = await prerenderToNodeStream(
    <StrictMode>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </StrictMode>,
  );
  let html = '';
  for await (const pedaco of prelude) html += pedaco;
  return { html, seo: lerColetaSeo() };
}

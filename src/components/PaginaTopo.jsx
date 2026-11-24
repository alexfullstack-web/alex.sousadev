import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import Reveal from './Reveal.jsx';

// Abertura das páginas internas: trilha, rótulo, título, texto de apoio e ações.
export default function PaginaTopo({ titulo, destaque, texto, rotulo, children, id = 'pagina-titulo', trilha }) {
  return (
    <header className="pagina-topo">
      <div className="pagina-topo__decoracao" aria-hidden="true">
        <span className="pagina-topo__orbita" />
        <span className="pagina-topo__orbita pagina-topo__orbita--2" />
      </div>
      <Reveal className="pagina-topo__conteudo">
        {trilha && (
          <nav className="trilha" aria-label="Você está em">
            <ol>
              <li>
                <Link to="/">Início</Link>
              </li>
              <li aria-current="page">
                <ChevronRight size={14} aria-hidden="true" />
                {trilha}
              </li>
            </ol>
          </nav>
        )}
        {rotulo && <span className="rotulo">{rotulo}</span>}
        <h1 id={id}>
          {titulo}
          {destaque && (
            <>
              {' '}
              <span className="texto-gradiente">{destaque}</span>
            </>
          )}
        </h1>
        {texto && <p className="pagina-topo__texto">{texto}</p>}
        {children && <div className="pagina-topo__acoes">{children}</div>}
      </Reveal>
    </header>
  );
}

import Reveal from './Reveal.jsx';

// Abertura das páginas internas: título, texto de apoio e ações.
export default function PaginaTopo({ titulo, texto, children, id = 'pagina-titulo' }) {
  return (
    <header className="pagina-topo">
      <Reveal className="pagina-topo__conteudo">
        <h1 id={id}>{titulo}</h1>
        {texto && <p className="pagina-topo__texto">{texto}</p>}
        {children && <div className="pagina-topo__acoes">{children}</div>}
      </Reveal>
    </header>
  );
}

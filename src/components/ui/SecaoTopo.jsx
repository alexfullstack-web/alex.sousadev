import Reveal from '../Reveal.jsx';

// Cabeçalho de seção: rótulo, título, texto de apoio e uma ação opcional à direita.
export default function SecaoTopo({ id, rotulo, titulo, texto, acao, centro = false, nivel = 2 }) {
  const Titulo = `h${nivel}`;
  return (
    <Reveal className={`secao-topo${centro ? ' secao-topo--centro' : ''}`}>
      <div className="secao-topo__texto">
        {rotulo && <span className="rotulo">{rotulo}</span>}
        <Titulo id={id}>{titulo}</Titulo>
        {texto && <p>{texto}</p>}
      </div>
      {acao}
    </Reveal>
  );
}

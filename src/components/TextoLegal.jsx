import PaginaTopo from './PaginaTopo.jsx';

// Estrutura comum das páginas legais: abertura, data de atualização, sumário com âncoras e seções.
// secoes: [{ id, titulo, conteudo }]
export default function TextoLegal({ titulo, resumo, atualizadoEm, secoes }) {
  return (
    <>
      <PaginaTopo titulo={titulo} texto={resumo} />
      <div className="secao secao--colada texto-longo texto-legal">
        <p className="texto-legal__data">
          Última atualização: <time dateTime={atualizadoEm.iso}>{atualizadoEm.rotulo}</time>
        </p>
        <nav className="texto-legal__sumario" aria-label={`Seções: ${titulo}`}>
          <h2>Nesta página</h2>
          <ol>
            {secoes.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>{s.titulo}</a>
              </li>
            ))}
          </ol>
        </nav>
        {secoes.map((s) => (
          <section key={s.id} id={s.id} aria-labelledby={`${s.id}-titulo`} className="texto-legal__secao">
            <h2 id={`${s.id}-titulo`}>{s.titulo}</h2>
            {s.conteudo}
          </section>
        ))}
      </div>
    </>
  );
}

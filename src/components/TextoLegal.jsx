import { FileText } from 'lucide-react';
import PaginaTopo from './PaginaTopo.jsx';

// Estrutura comum das páginas legais: abertura, data de atualização, sumário com âncoras e seções.
// secoes: [{ id, titulo, conteudo }]
export default function TextoLegal({ titulo, resumo, atualizadoEm, secoes }) {
  return (
    <>
      <PaginaTopo trilha={titulo} rotulo="Documento legal" titulo={titulo} texto={resumo} />
      <div className="secao secao--colada legal">
        <nav className="legal__sumario" aria-label={`Seções: ${titulo}`}>
          <div className="legal__sumario-caixa">
            <h2>
              <FileText size={16} aria-hidden="true" /> Nesta página
            </h2>
            <ol>
              {secoes.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`}>
                    <span className="num mono">{String(i + 1).padStart(2, '0')}</span> {s.titulo}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </nav>
        <div className="legal__texto">
          <p className="legal__data">
            Última atualização: <time dateTime={atualizadoEm.iso}>{atualizadoEm.rotulo}</time>
          </p>
          {secoes.map((s) => (
            <section key={s.id} id={s.id} aria-labelledby={`${s.id}-titulo`} className="legal__secao">
              <h2 id={`${s.id}-titulo`}>{s.titulo}</h2>
              {s.conteudo}
            </section>
          ))}
        </div>
      </div>
    </>
  );
}

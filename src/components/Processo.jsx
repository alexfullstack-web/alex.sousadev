import { PROCESSO } from '../data/empresa.js';
import { useReveal } from '../hooks/useReveal.js';

// Linha do tempo das etapas (é uma sequência de verdade, por isso numerada).
// A linha se acende quando a seção entra na tela.
export default function Processo() {
  const ref = useReveal();
  return (
    <ol ref={ref} className="processo revelar">
      {PROCESSO.map((etapa, i) => (
        <li key={etapa.titulo} className="processo__etapa" style={{ '--i': i }}>
          <span className="processo__no num" aria-hidden="true">
            {String(i + 1).padStart(2, '0')}
          </span>
          <h3>{etapa.titulo}</h3>
          <p>{etapa.descricao}</p>
        </li>
      ))}
    </ol>
  );
}

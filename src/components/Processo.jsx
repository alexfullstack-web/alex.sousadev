import { ClipboardList, Code2, MessagesSquare, Rocket, TestTubeDiagonal } from 'lucide-react';
import { PROCESSO } from '../data/empresa.js';
import { useReveal } from '../hooks/useReveal.js';

const ICONES = [MessagesSquare, ClipboardList, Code2, TestTubeDiagonal, Rocket];

// Linha do tempo das etapas (é uma sequência de verdade, por isso numerada).
// A linha de energia se acende quando a seção entra na tela.
export default function Processo() {
  const ref = useReveal();
  return (
    <ol ref={ref} className="processo revelar">
      {PROCESSO.map((etapa, i) => {
        const Icone = ICONES[i] ?? Code2;
        return (
          <li key={etapa.titulo} className="processo__etapa" style={{ '--i': i }}>
            <div className="processo__no">
              <Icone size={20} strokeWidth={1.8} aria-hidden="true" />
            </div>
            <div className="processo__texto">
              <span className="processo__num num mono" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3>{etapa.titulo}</h3>
              <p>{etapa.descricao}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

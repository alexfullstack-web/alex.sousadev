// Tela de carregamento com a logo AS — só na primeira visita da sessão e por pouco tempo.
import { useEffect, useState } from 'react';
import { useSite } from '../context/SiteContext.jsx';

const CHAVE = 'ast.carregou';
function jaViu() {
  try {
    return sessionStorage.getItem(CHAVE) === '1';
  } catch {
    return false;
  }
}

export default function LoadingScreen() {
  const { carregando } = useSite();
  const [fase, setFase] = useState(() => (jaViu() ? 'fim' : 'entrando'));
  const [minimo, setMinimo] = useState(false);
  useEffect(() => {
    if (fase === 'fim') return undefined;
    const t1 = setTimeout(() => setMinimo(true), 900);
    const t2 = setTimeout(() => setFase('saindo'), 2600); // nunca prende o visitante
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [fase]);
  useEffect(() => {
    if (fase === 'entrando' && minimo && !carregando) setFase('saindo');
  }, [fase, minimo, carregando]);
  useEffect(() => {
    if (fase !== 'saindo') return undefined;
    try {
      sessionStorage.setItem(CHAVE, '1');
    } catch {
      /* */
    }
    const t = setTimeout(() => setFase('fim'), 520);
    return () => clearTimeout(t);
  }, [fase]);
  if (fase === 'fim') return null;
  return (
    <div className={`carregando${fase === 'saindo' ? ' carregando--saindo' : ''}`} role="status" aria-label="Carregando o site">
      <div className="carregando__marca">
        <img src="/img/site/logo-as.webp" alt="" width="240" height="141" />
        <span className="carregando__linha" />
        <span className="carregando__texto">Desenvolvimento • Tecnologia • Inovação</span>
      </div>
    </div>
  );
}

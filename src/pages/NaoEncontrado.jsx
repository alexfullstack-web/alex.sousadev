import { Link } from 'react-router-dom';
import { useSeo } from '../hooks/useSeo.js';

export default function NaoEncontrado() {
  useSeo({ titulo: 'Página não encontrada', caminho: '/404', noindex: true });
  return (
    <div className="pagina pagina--estreita nao-encontrado">
      <p className="nao-encontrado__codigo" aria-hidden="true">404</p>
      <h1 className="pagina__titulo">Esta página não existe</h1>
      <p className="secao__desc">O endereço pode ter mudado. Veja os projetos ou volte ao início.</p>
      <div className="hero__acoes">
        <Link to="/" className="botao botao--primario">
          Ir para o início
        </Link>
        <Link to="/projetos" className="botao botao--contorno">
          Ver projetos
        </Link>
      </div>
    </div>
  );
}

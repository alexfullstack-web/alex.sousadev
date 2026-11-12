import { Link } from 'react-router-dom';
import { useSeo } from '../hooks/useSeo.js';

export default function NaoEncontrado() {
  useSeo({ titulo: 'Página não encontrada', caminho: '/404', noindex: true });
  return (
    <section className="nao-encontrado" aria-labelledby="nao-encontrado-titulo">
      <p className="nao-encontrado__codigo num" aria-hidden="true">
        404
      </p>
      <h1 id="nao-encontrado-titulo">Esta página não existe</h1>
      <p>O endereço pode ter mudado. Volte ao início ou veja os projetos.</p>
      <div className="nao-encontrado__acoes">
        <Link to="/" className="botao botao--primario">
          Ir para o início
        </Link>
        <Link to="/projetos" className="botao botao--contorno">
          Ver projetos
        </Link>
      </div>
    </section>
  );
}

import { Link } from 'react-router-dom';
import { House, Layers } from 'lucide-react';
import { useSeo } from '../hooks/useSeo.js';

export default function NaoEncontrado() {
  useSeo({ titulo: 'Página não encontrada', caminho: '/404', noindex: true });
  return (
    <section className="nao-encontrado" aria-labelledby="nao-encontrado-titulo">
      <div className="nao-encontrado__codigo num" aria-hidden="true">
        <span>4</span>
        <span className="nao-encontrado__zero">
          <img src="/img/site/logo-as.webp" alt="" width="240" height="141" />
        </span>
        <span>4</span>
      </div>
      <span className="rotulo">Erro 404</span>
      <h1 id="nao-encontrado-titulo">Esta página não existe</h1>
      <p>O endereço pode ter mudado. Volte ao início ou veja os serviços.</p>
      <div className="nao-encontrado__acoes">
        <Link to="/" className="btn btn--primario">
          <House size={18} aria-hidden="true" /> Ir para o início
        </Link>
        <Link to="/servicos" className="btn btn--contorno">
          <Layers size={18} aria-hidden="true" /> Ver serviços
        </Link>
      </div>
    </section>
  );
}

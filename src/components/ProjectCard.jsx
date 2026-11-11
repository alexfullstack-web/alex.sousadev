import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

// Cartão de projeto publicado no Gestão. Sem capa: um quadro com as iniciais, sem imagem inventada.
export default function ProjectCard({ p, prioridade = false }) {
  return (
    <article className="projeto">
      <Link to={`/projetos/${p.slug}`} className="projeto__link" aria-label={`${p.nome}: ver projeto`}>
        <div className="projeto__capa">
          {p.capa ? (
            <img
              src={p.capa.url}
              alt={p.capa.alt}
              width={p.capa.largura || 1200}
              height={p.capa.altura || 750}
              loading={prioridade ? 'eager' : 'lazy'}
              decoding="async"
            />
          ) : (
            <span className="projeto__iniciais" aria-hidden="true">
              {p.nome
                .split(/\s+/)
                .slice(0, 2)
                .map((w) => w[0])
                .join('')}
            </span>
          )}
        </div>
        <div className="projeto__corpo">
          {p.segmento && <p className="projeto__segmento">{p.segmento}</p>}
          <h3 className="projeto__nome">
            {p.nome}
            <ArrowUpRight size={18} aria-hidden="true" className="projeto__seta" />
          </h3>
          <p className="projeto__resumo">{p.resumo}</p>
        </div>
      </Link>
    </article>
  );
}

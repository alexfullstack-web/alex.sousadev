import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ImageOff } from 'lucide-react';

export default function ProjectCard({ p, destaque = false }) {
  const [falhou, setFalhou] = useState(false);
  return (
    <article className={`projeto${destaque ? ' projeto--destaque' : ''}`}>
      <Link to={`/projetos/${p.slug}`} className="projeto__capa" tabIndex={-1} aria-hidden="true">
        {p.capaUrl && !falhou ? (
          <img src={p.capaUrl} alt="" loading="lazy" decoding="async" onError={() => setFalhou(true)} />
        ) : (
          <span className="projeto__sem-capa">
            <ImageOff size={28} aria-hidden="true" />
          </span>
        )}
        {(p.etiqueta || p.categoriaRotulo) && <span className="projeto__etiqueta">{p.etiqueta || p.categoriaRotulo}</span>}
      </Link>
      <div className="projeto__corpo">
        <h3 className="projeto__nome">
          <Link to={`/projetos/${p.slug}`}>{p.nome}</Link>
        </h3>
        <p className="projeto__resumo">{p.resumo}</p>
        {p.tecnologias?.length > 0 && (
          <ul className="projeto__tecs" aria-label="Tecnologias">
            {p.tecnologias.slice(0, 4).map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        )}
        <div className="projeto__acoes">
          <Link to={`/projetos/${p.slug}`} className="botao botao--contorno botao--p">
            Ver projeto
          </Link>
          {p.urlDemo && (
            <a href={p.urlDemo} target="_blank" rel="noopener noreferrer" className="projeto__demo" aria-label={`Abrir demonstração de ${p.nome} (nova aba)`}>
              Demonstração <ArrowUpRight size={15} aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

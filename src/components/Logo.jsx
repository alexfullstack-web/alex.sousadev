import { Link } from 'react-router-dom';

// Marca: o "AS" (imagem da logo) + nome em texto (nítido em qualquer tamanho).
export default function Logo({ compacta = false }) {
  return (
    <Link to="/" className={`logo${compacta ? ' logo--compacta' : ''}`} aria-label="Alex Sousa Tech — início">
      <img src="/img/site/logo-as.webp" alt="" width="240" height="141" className="logo__as" />
      <span className="logo__nome" aria-hidden="true">
        <span className="logo__alex">Alex</span> <span className="logo__sousa">Sousa</span>
        <span className="logo__tech">Tech</span>
      </span>
    </Link>
  );
}

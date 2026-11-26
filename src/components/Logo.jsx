import { Link } from 'react-router-dom';

// Logotipo oficial (o "AS") com o nome em texto, nítido em qualquer tamanho.
export default function Logo({ para = '/', compacto = false }) {
  return (
    <Link to={para} className={`logo${compacto ? ' logo--compacto' : ''}`} aria-label="Alex Sousa Tech, página inicial">
      <span className="logo__marca">
        <img src="/img/site/logo-as.webp" alt="" width="480" height="233" />
      </span>
      <span className="logo__nome" aria-hidden="true">
        <span className="logo__alex">Alex Sousa</span>
        <span className="logo__tech">Tech</span>
      </span>
    </Link>
  );
}

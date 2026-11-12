import { Link } from 'react-router-dom';

// Logotipo oficial (o "AS") com o nome em texto, nítido em qualquer tamanho.
export default function Logo() {
  return (
    <Link to="/" className="logo" aria-label="Alex Sousa Tech, página inicial">
      <img src="/img/site/logo-as.webp" alt="" width="240" height="141" className="logo__as" />
      <span className="logo__nome" aria-hidden="true">
        Alex Sousa <span>Tech</span>
      </span>
    </Link>
  );
}

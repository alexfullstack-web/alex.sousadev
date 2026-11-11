import { Link } from 'react-router-dom';
import { Github, Instagram, Mail, MessageCircle } from 'lucide-react';
import { CONTATO, EMPRESA, NAV, SERVICOS, linkWhatsapp } from '../data/empresa.js';

export default function Footer() {
  const ano = new Date().getFullYear();
  return (
    <footer className="rodape">
      <div className="rodape__grade">
        <div className="rodape__marca">
          <img src="/img/site/logo-full.webp" alt="Logotipo da Alex Sousa Tech" width="778" height="646" loading="lazy" />
          <p>{EMPRESA.posicionamento}</p>
        </div>
        <nav className="rodape__col" aria-label="Serviços">
          <h2>Serviços</h2>
          <ul>
            {SERVICOS.slice(0, 6).map((s) => (
              <li key={s.id}>
                <Link to={`/servicos#${s.id}`}>{s.nome}</Link>
              </li>
            ))}
            <li>
              <Link to="/servicos">Todos os serviços</Link>
            </li>
          </ul>
        </nav>
        <nav className="rodape__col" aria-label="Navegação do rodapé">
          <h2>Navegação</h2>
          <ul>
            {NAV.map((item) => (
              <li key={item.to}>
                <Link to={item.to}>{item.rotulo}</Link>
              </li>
            ))}
            <li>
              <Link to="/orcamento">Solicitar orçamento</Link>
            </li>
          </ul>
        </nav>
        <div className="rodape__col">
          <h2>Contato</h2>
          <ul className="rodape__contato">
            <li>
              <a href={linkWhatsapp()} target="_blank" rel="noopener noreferrer">
                <MessageCircle size={17} aria-hidden="true" /> {CONTATO.whatsappRotulo}
              </a>
            </li>
            <li>
              <a href={`mailto:${CONTATO.email}`}>
                <Mail size={17} aria-hidden="true" /> {CONTATO.email}
              </a>
            </li>
            <li>
              <a href={CONTATO.instagram} target="_blank" rel="noopener noreferrer">
                <Instagram size={17} aria-hidden="true" /> {CONTATO.instagramUsuario}
              </a>
            </li>
            <li>
              <a href={CONTATO.github} target="_blank" rel="noopener noreferrer">
                <Github size={17} aria-hidden="true" /> GitHub
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="rodape__base">
        <p>
          © <span suppressHydrationWarning>{ano}</span> {EMPRESA.nome}. {EMPRESA.slogan}
        </p>
        <Link to="/privacidade">Política de privacidade</Link>
      </div>
    </footer>
  );
}

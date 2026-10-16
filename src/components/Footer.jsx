import { Link } from 'react-router-dom';
import { Github, Instagram, Linkedin, Mail, MessageCircle, Youtube } from 'lucide-react';
import Logo from './Logo.jsx';
import { SECOES } from './Navbar.jsx';
import { useSite } from '../context/SiteContext.jsx';

export default function Footer() {
  const { dados } = useSite();
  const c = dados?.conteudo?.contato || {};
  const zap = dados?.whatsapp;
  const redes = [
    c.github && { href: c.github, rotulo: 'GitHub', Icone: Github },
    c.linkedin && { href: c.linkedin, rotulo: 'LinkedIn', Icone: Linkedin },
    c.instagram && { href: c.instagram, rotulo: 'Instagram', Icone: Instagram },
    c.youtube && { href: c.youtube, rotulo: 'YouTube', Icone: Youtube },
  ].filter(Boolean);
  return (
    <footer className="rodape">
      <div className="rodape__dentro">
        <div className="rodape__marca">
          <Logo />
          <p>Desenvolvimento • Tecnologia • Inovação</p>
        </div>
        <nav className="rodape__nav" aria-label="Rodapé">
          {SECOES.map((s) => (
            <Link key={s.id} to={s.id === 'inicio' ? '/' : `/#${s.id}`}>
              {s.rotulo}
            </Link>
          ))}
          <Link to="/projetos">Todos os projetos</Link>
          <Link to="/orcamento">Orçamento</Link>
          <Link to="/privacidade">Privacidade</Link>
        </nav>
        <div className="rodape__contato">
          {c.email && (
            <a href={`mailto:${c.email}`}>
              <Mail size={16} aria-hidden="true" /> {c.email}
            </a>
          )}
          {zap?.ativo && (
            <a href={zap.link} target="_blank" rel="noopener noreferrer">
              <MessageCircle size={16} aria-hidden="true" /> WhatsApp{zap.horario ? ` · ${zap.horario}` : ''}
            </a>
          )}
          {redes.length > 0 && (
            <ul className="rodape__redes" aria-label="Redes sociais">
              {redes.map(({ href, rotulo, Icone }) => (
                <li key={rotulo}>
                  <a href={href} target="_blank" rel="noopener noreferrer" aria-label={rotulo} title={rotulo}>
                    <Icone size={18} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <p className="rodape__copy">© {new Date().getFullYear()} Alex Sousa Tech. Projetos e conteúdo gerenciados pelo Business OS.</p>
    </footer>
  );
}

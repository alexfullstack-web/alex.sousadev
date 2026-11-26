import { Link } from 'react-router-dom';
import { ArrowUpRight, Github, Instagram, Mail, MessageCircle, Send } from 'lucide-react';
import { CONTATO, EMPRESA, NAV, SERVICOS, linkWhatsapp } from '../data/empresa.js';
import { CAMINHO_PRIVACIDADE, CAMINHO_TERMOS } from '../data/legal.js';

const REDES = [
  { href: () => linkWhatsapp(), icone: MessageCircle, rotulo: 'WhatsApp' },
  { href: () => `mailto:${CONTATO.email}`, icone: Mail, rotulo: 'E-mail', interno: true },
  { href: () => CONTATO.instagram, icone: Instagram, rotulo: 'Instagram' },
  { href: () => CONTATO.github, icone: Github, rotulo: 'GitHub' },
];

export default function Footer() {
  const ano = new Date().getFullYear();
  return (
    <footer className="rodape">
      <div className="rodape__brilho" aria-hidden="true" />
      <div className="rodape__conteudo">
        <div className="rodape__marca">
          <img src="/img/site/logo-full.webp" alt="Logotipo da Alex Sousa Tech" width="900" height="623" loading="lazy" decoding="async" />
          <p>{EMPRESA.posicionamento}</p>
          <ul className="rodape__redes" aria-label="Redes e contatos">
            {REDES.map(({ href, icone: Icone, rotulo, interno }) => (
              <li key={rotulo}>
                <a href={href()} {...(interno ? {} : { target: '_blank', rel: 'noopener noreferrer' })} aria-label={rotulo} title={rotulo}>
                  <Icone size={18} aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
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
              <Link to="/servicos" className="rodape__mais">
                Todos os serviços <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
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
            <li>
              <Link to="/conta">Área do cliente</Link>
            </li>
          </ul>
        </nav>

        <div className="rodape__col rodape__col--contato">
          <h2>Contato</h2>
          <ul className="rodape__contato">
            <li>
              <a href={linkWhatsapp()} target="_blank" rel="noopener noreferrer">
                <MessageCircle size={17} aria-hidden="true" /> <span className="num">{CONTATO.whatsappRotulo}</span>
              </a>
            </li>
            <li>
              <a href={`mailto:${CONTATO.email}`}>
                <Mail size={17} aria-hidden="true" /> <span>{CONTATO.email}</span>
              </a>
            </li>
            <li>
              <a href={CONTATO.instagram} target="_blank" rel="noopener noreferrer">
                <Instagram size={17} aria-hidden="true" /> <span>{CONTATO.instagramUsuario}</span>
              </a>
            </li>
          </ul>
          <Link to="/orcamento" className="btn btn--primario btn--p rodape__cta">
            <Send size={16} aria-hidden="true" /> Pedir orçamento
          </Link>
        </div>
      </div>

      <div className="rodape__base">
        <p>
          © <span suppressHydrationWarning>{ano}</span> {EMPRESA.nome}. Todos os direitos reservados.
        </p>
        <p className="rodape__slogan">{EMPRESA.slogan}</p>
        <nav className="rodape__legal" aria-label="Informações legais">
          <Link to={CAMINHO_PRIVACIDADE}>Política de Privacidade</Link>
          <Link to={CAMINHO_TERMOS}>Termos de Uso</Link>
        </nav>
      </div>
    </footer>
  );
}

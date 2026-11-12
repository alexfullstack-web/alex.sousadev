import { Link } from 'react-router-dom';
import { MessageCircle, Send } from 'lucide-react';
import { linkWhatsapp } from '../data/empresa.js';
import Reveal from './Reveal.jsx';

export default function CtaFinal({ titulo = 'Vamos tirar sua ideia do papel?', texto = 'Conte o que você precisa. A gente entende o seu caso e responde com uma proposta clara.' }) {
  return (
    <section className="cta-final" aria-labelledby="cta-final-titulo">
      <Reveal className="cta-final__caixa">
        <div>
          <h2 id="cta-final-titulo">{titulo}</h2>
          <p>{texto}</p>
        </div>
        <div className="cta-final__acoes">
          <Link to="/orcamento" className="botao botao--primario">
            <Send size={18} aria-hidden="true" /> Solicitar orçamento
          </Link>
          <a href={linkWhatsapp()} target="_blank" rel="noopener noreferrer" className="botao botao--contorno">
            <MessageCircle size={18} aria-hidden="true" /> Falar pelo WhatsApp
          </a>
        </div>
      </Reveal>
    </section>
  );
}

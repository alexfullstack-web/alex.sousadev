import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { linkWhatsapp } from '../data/empresa.js';
import Reveal from './Reveal.jsx';

// Chamada final para orçamento, presente no fim das páginas institucionais.
export default function CtaFinal({ titulo = 'Vamos tirar sua ideia do papel?', texto = 'Conte o que você precisa. A gente entende o seu caso e responde com uma proposta clara.' }) {
  return (
    <section className="cta" aria-labelledby="cta-titulo">
      <Reveal className="cta__caixa">
        <div className="cta__fundo" aria-hidden="true">
          <span className="cta__luz cta__luz--1" />
          <span className="cta__luz cta__luz--2" />
          <span className="cta__grade" />
        </div>
        <div className="cta__texto">
          <span className="rotulo">Orçamento sem compromisso</span>
          <h2 id="cta-titulo">{titulo}</h2>
          <p>{texto}</p>
        </div>
        <div className="cta__acoes">
          <Link to="/orcamento" className="btn btn--primario btn--g">
            Solicitar orçamento <ArrowRight size={18} className="btn__seta" aria-hidden="true" />
          </Link>
          <a href={linkWhatsapp()} target="_blank" rel="noopener noreferrer" className="btn btn--contorno btn--g">
            <MessageCircle size={18} aria-hidden="true" /> Falar pelo WhatsApp
          </a>
        </div>
      </Reveal>
    </section>
  );
}

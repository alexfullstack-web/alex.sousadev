import { Link } from 'react-router-dom';
import { Github, Instagram, Mail, MessageCircle, Send } from 'lucide-react';
import PaginaTopo from '../components/PaginaTopo.jsx';
import Reveal from '../components/Reveal.jsx';
import { CONTATO, linkWhatsapp } from '../data/empresa.js';
import { useSeo } from '../hooks/useSeo.js';
import { entidadesTrilha } from '../seo/schema.js';

const CANAIS = [
  { icone: MessageCircle, titulo: 'WhatsApp', texto: 'O jeito mais rápido de tirar uma dúvida.', valor: CONTATO.whatsappRotulo, href: linkWhatsapp(), externo: true, rotuloAcao: 'Abrir WhatsApp' },
  { icone: Mail, titulo: 'E-mail', texto: 'Para enviar detalhes, arquivos ou referências.', valor: CONTATO.email, href: `mailto:${CONTATO.email}`, rotuloAcao: 'Enviar e-mail' },
  { icone: Instagram, titulo: 'Instagram', texto: 'Novidades e bastidores dos projetos.', valor: CONTATO.instagramUsuario, href: CONTATO.instagram, externo: true, rotuloAcao: 'Abrir Instagram' },
  { icone: Github, titulo: 'GitHub', texto: 'Código e repositórios públicos.', valor: CONTATO.githubUsuario, href: CONTATO.github, externo: true, rotuloAcao: 'Abrir GitHub' },
];

export default function Contato() {
  useSeo({
    titulo: 'Contato',
    descricao: 'Fale com a Alex Sousa Tech pelo WhatsApp, e-mail ou redes sociais, ou envie um pedido de orçamento pelo site.',
    caminho: '/contato',
    entidades: entidadesTrilha('Contato', '/contato'),
  });
  return (
    <>
      <PaginaTopo titulo="Contato" texto="Escolha o canal mais prático para você. Para um orçamento, o formulário organiza as informações e agiliza a resposta.">
        <Link to="/orcamento" className="botao botao--primario">
          <Send size={18} aria-hidden="true" /> Solicitar orçamento
        </Link>
      </PaginaTopo>
      <section className="secao secao--colada" aria-label="Canais de contato">
        <ul className="canais">
          {CANAIS.map((c, i) => (
            <Reveal as="li" key={c.titulo} className="canal" style={{ '--atraso': `${i * 70}ms` }}>
              <c.icone size={24} aria-hidden="true" className="canal__icone" />
              <h2>{c.titulo}</h2>
              <p>{c.texto}</p>
              <a href={c.href} {...(c.externo ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className="canal__link" aria-label={`${c.rotuloAcao}: ${c.valor}`}>
                {c.valor}
              </a>
            </Reveal>
          ))}
        </ul>
      </section>
    </>
  );
}

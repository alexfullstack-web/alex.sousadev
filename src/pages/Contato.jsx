import { Link } from 'react-router-dom';
import { ArrowUpRight, Github, Instagram, Mail, MessageCircle, Send } from 'lucide-react';
import PaginaTopo from '../components/PaginaTopo.jsx';
import Reveal from '../components/Reveal.jsx';
import Cartao from '../components/ui/Cartao.jsx';
import { CONTATO, linkWhatsapp } from '../data/empresa.js';
import { useSeo } from '../hooks/useSeo.js';
import { entidadesTrilha } from '../seo/schema.js';

const CANAIS = [
  { icone: MessageCircle, titulo: 'WhatsApp', texto: 'O jeito mais rápido de tirar uma dúvida.', valor: CONTATO.whatsappRotulo, href: linkWhatsapp(), externo: true, rotuloAcao: 'Abrir WhatsApp', verde: true },
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
      <PaginaTopo
        trilha="Contato"
        rotulo="Fale com a gente"
        titulo="Vamos"
        destaque="conversar"
        texto="Escolha o canal mais prático para você. Para um orçamento, o formulário organiza as informações e agiliza a resposta."
      >
        <Link to="/orcamento" className="btn btn--primario">
          <Send size={18} aria-hidden="true" /> Solicitar orçamento
        </Link>
      </PaginaTopo>
      <section className="secao secao--colada" aria-label="Canais de contato">
        <ul className="grade grade--4 canais">
          {CANAIS.map((c, i) => (
            <Reveal as="li" key={c.titulo} style={{ '--atraso': `${i * 80}ms` }}>
              <Cartao className="canal" href={c.href} externo={c.externo} rotuloLink={`${c.rotuloAcao}: ${c.valor}`}>
                <span className={`icone-caixa${c.verde ? ' icone-caixa--verde' : ''}`}>
                  <c.icone size={22} strokeWidth={1.75} aria-hidden="true" />
                </span>
                <h2>{c.titulo}</h2>
                <p>{c.texto}</p>
                <span className="cartao__rodape">
                  <span className="canal__valor">{c.valor}</span>
                  <ArrowUpRight size={18} className="canal__seta" aria-hidden="true" />
                </span>
              </Cartao>
            </Reveal>
          ))}
        </ul>
      </section>
    </>
  );
}

import { useSearchParams } from 'react-router-dom';
import { ClipboardCheck, FileText, Mail, MessageCircle, MessagesSquare, ShieldCheck } from 'lucide-react';
import ClientOnly from '../components/ClientOnly.jsx';
import PaginaTopo from '../components/PaginaTopo.jsx';
import QuoteForm from '../components/QuoteForm.jsx';
import Reveal from '../components/Reveal.jsx';
import { CONTATO, linkWhatsapp } from '../data/empresa.js';
import { useSeo } from '../hooks/useSeo.js';
import { entidadesTrilha } from '../seo/schema.js';

const PASSOS = [
  { icone: FileText, texto: 'Você descreve o projeto e escolhe como prefere receber a resposta.' },
  { icone: MessagesSquare, texto: 'Analisamos a necessidade e, se precisar, conversamos para entender os detalhes.' },
  { icone: ClipboardCheck, texto: 'Você recebe a proposta com valor, prazo e o que será entregue.' },
];

export default function Orcamento() {
  const [params] = useSearchParams();
  useSeo({
    titulo: 'Solicitar orçamento',
    descricao: 'Peça um orçamento de site, sistema web, loja virtual, cardápio digital ou automação. Sem cadastro: a Alex Sousa Tech responde pelo canal que você escolher.',
    caminho: '/orcamento',
    entidades: entidadesTrilha('Solicitar orçamento', '/orcamento'),
  });
  return (
    <>
      <PaginaTopo
        trilha="Orçamento"
        rotulo="Sem cadastro"
        titulo="Solicitar"
        destaque="orçamento"
        texto="Conte o que você precisa. Analisamos cada pedido com atenção e respondemos com os próximos passos."
      />
      <section className="secao secao--colada orc" aria-label="Formulário de orçamento">
        <Reveal as="aside" className="orc__lado">
          <div className="orc__painel">
            <h2>Como funciona</h2>
            <ol className="orc__passos">
              {PASSOS.map(({ icone: I, texto }, i) => (
                <li key={i}>
                  <span className="icone-caixa icone-caixa--p">
                    <I size={18} strokeWidth={1.8} aria-hidden="true" />
                  </span>
                  <p>{texto}</p>
                </li>
              ))}
            </ol>
          </div>
          <div className="orc__painel orc__painel--direto">
            <p className="orc__direto-titulo">Prefere conversar direto?</p>
            <a href={linkWhatsapp()} target="_blank" rel="noopener noreferrer" className="btn btn--contorno btn--bloco">
              <MessageCircle size={17} aria-hidden="true" /> WhatsApp
            </a>
            <a href={`mailto:${CONTATO.email}`} className="btn btn--fantasma btn--bloco orc__email">
              <Mail size={17} aria-hidden="true" /> {CONTATO.email}
            </a>
          </div>
          <p className="orc__seguro">
            <ShieldCheck size={16} aria-hidden="true" /> Seus dados são usados só para responder a este pedido.
          </p>
        </Reveal>
        <ClientOnly fallback={<div className="orc__form esqueleto" aria-busy="true" aria-label="Carregando formulário" />}>
          <QuoteForm tipoInicial={params.get('tipo') || ''} />
        </ClientOnly>
      </section>
    </>
  );
}

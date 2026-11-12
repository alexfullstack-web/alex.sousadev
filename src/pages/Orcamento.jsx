import { useSearchParams } from 'react-router-dom';
import { Mail, MessageCircle } from 'lucide-react';
import ClientOnly from '../components/ClientOnly.jsx';
import PaginaTopo from '../components/PaginaTopo.jsx';
import QuoteForm from '../components/QuoteForm.jsx';
import { CONTATO, linkWhatsapp } from '../data/empresa.js';
import { useSeo } from '../hooks/useSeo.js';
import { entidadesTrilha } from '../seo/schema.js';

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
      <PaginaTopo titulo="Solicitar orçamento" texto="Conte o que você precisa. Analisamos cada pedido com atenção e respondemos com os próximos passos." />
      <section className="secao secao--colada orc-layout" aria-label="Formulário de orçamento">
        <aside className="orc-lado">
          <h2>Como funciona</h2>
          <ol className="orc-passos">
            <li>Você descreve o projeto e escolhe como prefere receber a resposta.</li>
            <li>Analisamos a necessidade e, se precisar, conversamos para entender os detalhes.</li>
            <li>Você recebe a proposta com valor, prazo e o que será entregue.</li>
          </ol>
          <div className="orc-lado__direto">
            <p>Prefere conversar direto?</p>
            <a href={linkWhatsapp()} target="_blank" rel="noopener noreferrer" className="botao botao--contorno botao--p">
              <MessageCircle size={17} aria-hidden="true" /> WhatsApp
            </a>
            <a href={`mailto:${CONTATO.email}`} className="botao botao--fantasma botao--p">
              <Mail size={17} aria-hidden="true" /> {CONTATO.email}
            </a>
          </div>
        </aside>
        <ClientOnly fallback={<div className="orc-form orc-form--esqueleto" aria-busy="true" aria-label="Carregando formulário" />}>
          <QuoteForm tipoInicial={params.get('tipo') || ''} />
        </ClientOnly>
      </section>
    </>
  );
}

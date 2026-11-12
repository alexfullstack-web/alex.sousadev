import { RefreshCw } from 'lucide-react';
import CtaFinal from '../components/CtaFinal.jsx';
import PaginaTopo from '../components/PaginaTopo.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import Reveal from '../components/Reveal.jsx';
import { useProjetos } from '../hooks/useProjetos.js';
import { useSeo } from '../hooks/useSeo.js';
import { entidadesTrilha } from '../seo/schema.js';

export default function Projetos() {
  const { itens, erro, recarregar } = useProjetos();
  useSeo({
    titulo: 'Projetos e soluções',
    descricao: 'Projetos desenvolvidos pela Alex Sousa Tech: sites, sistemas, cardápios digitais e soluções web para diferentes segmentos.',
    caminho: '/projetos',
    entidades: entidadesTrilha('Projetos', '/projetos'),
  });
  return (
    <>
      <PaginaTopo titulo="Projetos e soluções desenvolvidas" texto="Cada projeto parte de uma necessidade real. Veja o que já construímos e abra a demonstração quando ela estiver disponível." />
      <section className="secao secao--colada" aria-label="Lista de projetos">
        {erro && !itens ? (
          <div className="aviso" role="alert">
            <p>{erro}</p>
            <button type="button" className="botao botao--contorno botao--p" onClick={recarregar}>
              <RefreshCw size={16} aria-hidden="true" /> Tentar de novo
            </button>
          </div>
        ) : !itens ? (
          <div className="projetos-grade" aria-busy="true" aria-label="Carregando projetos">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="projeto projeto--esqueleto" />
            ))}
          </div>
        ) : !itens.length ? (
          <p className="vazio">Os projetos estão sendo preparados para publicação. Enquanto isso, conte o que você precisa em um pedido de orçamento.</p>
        ) : (
          <div className="projetos-grade">
            {itens.map((p, i) => (
              <Reveal key={p.slug} style={{ '--atraso': `${(i % 3) * 80}ms` }}>
                <ProjectCard p={p} prioridade={i < 3} />
              </Reveal>
            ))}
          </div>
        )}
      </section>
      <CtaFinal titulo="O próximo projeto pode ser o seu" />
    </>
  );
}

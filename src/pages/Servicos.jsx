import { Link } from 'react-router-dom';
import { Send } from 'lucide-react';
import CtaFinal from '../components/CtaFinal.jsx';
import Icone from '../components/Icone.jsx';
import PaginaTopo from '../components/PaginaTopo.jsx';
import Reveal from '../components/Reveal.jsx';
import { SERVICOS } from '../data/empresa.js';
import { useSeo } from '../hooks/useSeo.js';
import { entidadesServicos, entidadesTrilha } from '../seo/schema.js';

export default function Servicos() {
  useSeo({
    titulo: 'Serviços',
    descricao: 'Desenvolvimento de sites, sistemas web personalizados, lojas virtuais, cardápios digitais, landing pages, automação, inteligência artificial e manutenção.',
    caminho: '/servicos',
    entidades: [...entidadesServicos(), ...entidadesTrilha('Serviços', '/servicos')],
  });
  return (
    <>
      <PaginaTopo titulo="Serviços" texto="Soluções digitais sob medida. Escolha um serviço para pedir um orçamento, ou conte a sua ideia e a gente indica o melhor caminho." />
      <section className="secao secao--colada" aria-label="Lista de serviços">
        <ul className="servicos-lista">
          {SERVICOS.map((s, i) => (
            <Reveal as="li" key={s.id} id={s.id} className="servico-linha" style={{ '--atraso': `${(i % 2) * 60}ms` }}>
              <span className="servico-linha__icone">
                <Icone nome={s.icone} size={26} />
              </span>
              <div className="servico-linha__texto">
                <h2>{s.nome}</h2>
                <p>{s.descricao}</p>
                <p className="servico-linha__beneficio">
                  <strong>Para você:</strong> {s.beneficio}
                </p>
              </div>
              <Link to={`/orcamento?tipo=${encodeURIComponent(s.nome)}`} className="botao botao--contorno botao--p servico-linha__acao" aria-label={`Solicitar orçamento de ${s.nome.toLowerCase()}`}>
                <Send size={16} aria-hidden="true" /> Solicitar orçamento
              </Link>
            </Reveal>
          ))}
        </ul>
      </section>
      <CtaFinal titulo="Não encontrou o que precisa?" texto="Conte a sua ideia. Se for possível resolver com tecnologia, a gente monta a solução com você." />
    </>
  );
}

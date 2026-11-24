import { Link } from 'react-router-dom';
import { CheckCircle2, Send } from 'lucide-react';
import CtaFinal from '../components/CtaFinal.jsx';
import Icone from '../components/Icone.jsx';
import PaginaTopo from '../components/PaginaTopo.jsx';
import Reveal from '../components/Reveal.jsx';
import Cartao from '../components/ui/Cartao.jsx';
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
      <PaginaTopo
        trilha="Serviços"
        rotulo="O que fazemos"
        titulo="Serviços"
        destaque="sob medida"
        texto="Soluções digitais sob medida. Escolha um serviço para pedir um orçamento, ou conte a sua ideia e a gente indica o melhor caminho."
      />
      <section className="secao secao--colada" aria-label="Lista de serviços">
        <ul className="servicos">
          {SERVICOS.map((s, i) => (
            <Reveal as="li" key={s.id} id={s.id} style={{ '--atraso': `${(i % 2) * 80}ms` }}>
              <Cartao interativo className="servico">
                <div className="servico__cabeca">
                  <span className={`icone-caixa${i % 3 === 2 ? ' icone-caixa--verde' : ''}`}>
                    <Icone nome={s.icone} size={24} />
                  </span>
                  <span className="servico__num num mono" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <h2>{s.nome}</h2>
                <p>{s.descricao}</p>
                <p className="servico__beneficio">
                  <CheckCircle2 size={17} aria-hidden="true" />
                  <span>
                    <strong>Para você:</strong> {s.beneficio}
                  </span>
                </p>
                <div className="cartao__rodape">
                  <Link to={`/orcamento?tipo=${encodeURIComponent(s.nome)}`} className="btn btn--contorno btn--p" aria-label={`Solicitar orçamento de ${s.nome.toLowerCase()}`}>
                    <Send size={15} aria-hidden="true" /> Solicitar orçamento
                  </Link>
                </div>
              </Cartao>
            </Reveal>
          ))}
        </ul>
      </section>
      <CtaFinal titulo="Não encontrou o que precisa?" texto="Conte a sua ideia. Se for possível resolver com tecnologia, a gente monta a solução com você." />
    </>
  );
}
